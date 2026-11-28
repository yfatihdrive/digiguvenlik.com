# -*- coding: utf-8 -*-
"""Onaylanan makaleleri siteye (data/blog-posts.json) veya dry-run önizleme klasörüne kaydeder."""

import json
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List
import config
import db

TR_TZ = timezone(timedelta(hours=3))

def inject_inline_images(html: str, images: List[Dict[str, Any]]) -> str:
    """[[INLINE_IMAGE:1]] ve [[INLINE_IMAGE:2]] yer tutucularını SEO uyumlu <figure> bloklarına çevirir."""
    for idx in (1, 2):
        token = f"[[INLINE_IMAGE:{idx}]]"
        if idx < len(images):
            im = images[idx]
            fig = (
                f'<figure class="my-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">'
                f'<img src="{im["url"]}" alt="{im["alt"]}" title="{im["alt"]}" '
                f'width="{im["width"]}" height="{im["height"]}" loading="lazy" '
                f'class="h-auto w-full object-cover" />'
                f'<figcaption class="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-center text-xs font-medium text-gray-600">'
                f'{im.get("caption") or im["alt"]}</figcaption></figure>'
            )
            html = html.replace(token, fig)
        else:
            html = html.replace(token, "")
    return html

def build_json_ld(article: Dict[str, Any], plan: Dict[str, Any], images: List[Dict[str, Any]], published_iso: str) -> Dict[str, Any]:
    """BlogPosting + FAQPage + Product + ImageObject JSON-LD @graph şeması üretir."""
    url = f"{config.SITE_URL}/blog/{article['slug']}"
    featured = images[0] if images else None
    graph: List[Dict[str, Any]] = [
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": f"{config.SITE_URL}/"},
                {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{config.SITE_URL}/blog"},
                {"@type": "ListItem", "position": 3, "name": article["title"], "item": url},
            ],
        },
        {
            "@type": "BlogPosting",
            "headline": article["title"],
            "description": article["meta_description"],
            "datePublished": published_iso,
            "dateModified": published_iso,
            "inLanguage": "tr-TR",
            "mainEntityOfPage": {"@type": "WebPage", "@id": url},
            "author": {"@type": "Organization", "name": config.AUTHOR_NAME, "url": config.SITE_URL},
            "publisher": {
                "@type": "Organization",
                "name": config.SITE_NAME,
                "url": config.SITE_URL,
                "logo": {"@type": "ImageObject", "url": f"{config.SITE_URL}/digi-guvenlik-logo.png"},
            },
            "image": [
                {
                    "@type": "ImageObject",
                    "url": f"{config.SITE_URL}{im['url']}",
                    "width": im["width"],
                    "height": im["height"],
                    "caption": im.get("caption") or im["alt"],
                }
                for im in images
            ],
            "keywords": ", ".join([plan["primary_keyword"]] + plan["secondary_keywords"]),
        },
    ]

    if article.get("faqs"):
        graph.append(
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f["question"],
                        "acceptedAnswer": {"@type": "Answer", "text": f["answer"]},
                    }
                    for f in article["faqs"]
                ],
            }
        )

    # İncelenen ilk ürüne ait Product + AggregateRating referansı (Google Rich Results yıldız desteği)
    if plan.get("products"):
        p0 = plan["products"][0]
        graph.append(
            {
                "@type": "Product",
                "name": p0["name"],
                "image": f"{config.SITE_URL}{p0['image']}",
                "sku": p0["sku"],
                "brand": {"@type": "Brand", "name": config.SITE_NAME},
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": p0.get("rating", 5.0),
                    "reviewCount": max(1, int(p0.get("review_count", 12))),
                    "bestRating": "5",
                    "worstRating": "1",
                },
                "offers": {
                    "@type": "Offer",
                    "url": f"{config.SITE_URL}/urun/{p0['slug']}",
                    "priceCurrency": "TRY",
                    "price": int(p0["price"]),
                    "priceValidUntil": "2026-12-31",
                    "availability": "https://schema.org/InStock",
                },
            }
        )

    return {"@context": "https://schema.org", "@graph": graph}

def publish_live(article: Dict[str, Any], plan: Dict[str, Any], images: List[Dict[str, Any]], schema_obj: Dict[str, Any], report: Dict[str, Any]) -> Dict[str, Any]:
    """Makaleyi data/blog-posts.json ve SQLite üzerine 'published' olarak yayınlar."""
    now_tr = datetime.now(TR_TZ)
    published_iso = now_tr.isoformat()
    reading_minutes = max(4, round(article["word_count"] / 190))

    final_html = inject_inline_images(article["content_html"], images)
    public_images = [
        {
            "url": im["url"],
            "alt": im["alt"],
            "caption": im.get("caption", ""),
            "width": im["width"],
            "height": im["height"],
            "isFeatured": bool(im.get("is_featured")),
        }
        for im in images
    ]

    post_record = {
        "slug": article["slug"],
        "title": article["title"],
        "metaTitle": article["meta_title"],
        "metaDescription": article["meta_description"],
        "primaryKeyword": plan["primary_keyword"],
        "secondaryKeywords": plan["secondary_keywords"],
        "topicType": plan["topic_type"],
        "categorySlug": plan["category"]["slug"],
        "categoryName": plan["category"]["name"],
        "author": config.AUTHOR_NAME,
        "publishedAt": published_iso,
        "updatedAt": published_iso,
        "readingMinutes": reading_minutes,
        "wordCount": article["word_count"],
        "tldrSummary": article["tldr_summary"],
        "featuredImage": public_images[0] if public_images else None,
        "images": public_images,
        "productSlugs": [p["slug"] for p in plan["products"]],
        "contentHtml": final_html,
        "faqs": article["faqs"],
        "schemaJsonLd": schema_obj,
    }

    # data/blog-posts.json güncelle
    existing_posts = []
    if config.BLOG_POSTS_JSON.exists():
        existing_posts = json.loads(config.BLOG_POSTS_JSON.read_text(encoding="utf-8") or "[]")
    existing_posts = [p for p in existing_posts if p["slug"] != post_record["slug"]]
    existing_posts.insert(0, post_record)
    config.BLOG_POSTS_JSON.write_text(json.dumps(existing_posts, indent=2, ensure_ascii=False), encoding="utf-8")

    # SQLite kaydet
    db.save_article(
        {
            "slug": article["slug"],
            "title": article["title"],
            "primary_keyword": plan["primary_keyword"],
            "secondary_keywords": plan["secondary_keywords"],
            "topic_type": plan["topic_type"],
            "category_slug": plan["category"]["slug"],
            "product_slugs": [p["slug"] for p in plan["products"]],
            "status": "published",
            "word_count": article["word_count"],
            "meta_title": article["meta_title"],
            "meta_description": article["meta_description"],
            "content_html": final_html,
            "plain_text": article["plain_text"],
            "images": public_images,
            "faqs": article["faqs"],
            "schema_json": schema_obj,
            "quality_notes": json.dumps(report, ensure_ascii=False),
            "published_at": published_iso,
        }
    )
    return post_record

def save_dry_run_preview(article: Dict[str, Any], plan: Dict[str, Any], images: List[Dict[str, Any]], schema_obj: Dict[str, Any], report: Dict[str, Any]) -> Dict[str, str]:
    """Canlı blog verisine dokunmadan dry_run_previews klasörüne önizleme kaydeder."""
    config.DRY_RUN_DIR.mkdir(parents=True, exist_ok=True)
    slug = article["slug"]
    final_html = inject_inline_images(article["content_html"], images)

    preview_payload = {
        "slug": slug,
        "title": article["title"],
        "metaTitle": article["meta_title"],
        "metaDescription": article["meta_description"],
        "primaryKeyword": plan["primary_keyword"],
        "secondaryKeywords": plan["secondary_keywords"],
        "topicType": plan["topic_type"],
        "category": plan["category"]["name"],
        "tldrSummary": article["tldr_summary"],
        "wordCount": article["word_count"],
        "images": images,
        "productSlugs": [p["slug"] for p in plan["products"]],
        "faqs": article["faqs"],
        "qualityReport": report,
        "contentHtml": final_html,
        "schemaJsonLd": schema_obj,
    }
    json_path = config.DRY_RUN_DIR / f"{slug}.json"
    html_path = config.DRY_RUN_DIR / f"{slug}.html"

    json_path.write_text(json.dumps(preview_payload, indent=2, ensure_ascii=False), encoding="utf-8")

    # Standalone önizleme HTML dosyası
    faqs_html = "".join(f"<h3>{f['question']}</h3><p>{f['answer']}</p>" for f in article["faqs"])
    html_doc = f"""<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>{article['meta_title']}</title>
<meta name="description" content="{article['meta_description']}">
<style>body{{font-family:Segoe UI,sans-serif;max-width:860px;margin:40px auto;line-height:1.7;color:#1e293b;padding:0 20px}}
.tldr{{background:#fff7ed;border-left:4px solid #ff6000;padding:16px;border-radius:8px;margin:20px 0}}
table{{width:100%;border-collapse:collapse;margin:20px 0}}th,td{{border:1px solid #cbd5e1;padding:10px;text-align:left}}
.meta{{background:#f1f5f9;padding:12px;border-radius:8px;font-size:13px;margin-bottom:20px}}</style></head>
<body>
<div class="meta"><strong>[DRY-RUN ÖNİZLEME]</strong> | Tür: {plan['topic_type']} | Kelime: {article['word_count']} |
Meta Title ({len(article['meta_title'])} kr): {article['meta_title']} | Benzerlik: {report.get('similarity', 0):.2%}</div>
<h1>{article['title']}</h1>
<div class="tldr"><strong>Kısaca:</strong> {article['tldr_summary']}</div>
{final_html}
<hr><h2>Sıkça Sorulan Sorular</h2>{faqs_html}
</body></html>"""
    html_path.write_text(html_doc, encoding="utf-8")

    # SQLite'a dry_run olarak işle ki 2. dry-run makalesi farklı konu & ürün seçsin
    db.save_article(
        {
            "slug": slug,
            "title": article["title"],
            "primary_keyword": plan["primary_keyword"],
            "secondary_keywords": plan["secondary_keywords"],
            "topic_type": plan["topic_type"],
            "category_slug": plan["category"]["slug"],
            "product_slugs": [p["slug"] for p in plan["products"]],
            "status": "dry_run",
            "word_count": article["word_count"],
            "meta_title": article["meta_title"],
            "meta_description": article["meta_description"],
            "content_html": final_html,
            "plain_text": article["plain_text"],
            "images": images,
            "faqs": article["faqs"],
            "schema_json": schema_obj,
            "quality_notes": json.dumps(report, ensure_ascii=False),
            "published_at": None,
        }
    )

    return {"json": str(json_path), "html": str(html_path)}
