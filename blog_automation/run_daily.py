# -*- coding: utf-8 -*-
"""
Digi Güvenlik — Günlük Otomatik Blog Üretim ve Yayın Orkestratörü
Kullanım:
  python blog_automation/run_daily.py --dry-run --count 2
  python blog_automation/run_daily.py
"""

import argparse
import json
import os
import sys
import io
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Windows konsol UTF-8 uyumu + anlık log çıktısı
if sys.stdout and hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)

import config
import db
import planner
import gemini_client
import quality_gate
import publisher
import notifier

TR_TZ = timezone(timedelta(hours=3))

def _format_prompt(plan: dict, retry_feedback: str = "") -> str:
    tpl = (config.PROMPTS_DIR / "text_prompt.txt").read_text(encoding="utf-8")
    prods_for_prompt = [
        {
            "name": p["name"],
            "slug": p["slug"],
            "url": f"{config.SITE_URL}/urun/{p['slug']}",
            "price_tl": int(p["price"]),
            "old_price_tl": int(p["old_price"]),
            "stock": int(p["stock"]),
            "category": p["category"],
            "category_url": f"{config.SITE_URL}/kategori/{p['category_slug']}",
            "short_description": p["short_description"],
            "highlights": json.loads(p["highlights_json"] or "[]")[:5],
            "specs": json.loads(p["specs_json"] or "[]")[:8],
        }
        for p in plan["products"]
    ]
    cat_for_prompt = {
        "name": plan["category"]["name"],
        "slug": plan["category"]["slug"],
        "url": f"{config.SITE_URL}/kategori/{plan['category']['slug']}",
        "description": plan["category"].get("description", ""),
    }

    fb_block = (
        f"ÖNCEKİ DENEMEDE TESPİT EDİLEN HATALAR (BUNLARI KESİNLİKLE DÜZELT):\n{retry_feedback}"
        if retry_feedback
        else ""
    )

    replacements = {
        "{SITE_URL}": config.SITE_URL,
        "{TOPIC_TYPE}": plan["topic_type"],
        "{TOPIC_INSTRUCTION}": plan["topic_instruction"],
        "{PRIMARY_KEYWORD}": plan["primary_keyword"],
        "{SECONDARY_KEYWORDS}": ", ".join(plan["secondary_keywords"]),
        "{SUGGESTED_SLUG}": plan["suggested_slug"],
        "{CATEGORY_JSON}": json.dumps(cat_for_prompt, indent=2, ensure_ascii=False),
        "{PRODUCTS_JSON}": json.dumps(prods_for_prompt, indent=2, ensure_ascii=False),
        "{PREVIOUS_ARTICLE_JSON}": json.dumps(plan["previous_article"], ensure_ascii=False) if plan["previous_article"] else "Henüz yok",
        "{EXTERNAL_SOURCES_JSON}": json.dumps(plan["external_sources"], indent=2, ensure_ascii=False),
        "{FORBIDDEN_TITLES}": json.dumps(plan["forbidden_titles"][-25:], ensure_ascii=False),
        "{FORBIDDEN_SLUGS}": json.dumps(plan["forbidden_slugs"][-25:], ensure_ascii=False),
        "{RETRY_FEEDBACK}": fb_block,
    }
    out = tpl
    for k, v in replacements.items():
        out = out.replace(k, v)
    return out

def _normalize_meta(article: dict, primary_kw: str) -> None:
    """meta_title (<=60) ve meta_description (140-160) uzunluklarını mekanik olarak sınırlar içine çeker."""
    kw_title = primary_kw.strip().title()
    mt = (article.get("meta_title") or "").strip()
    if primary_kw.lower() not in mt.lower():
        candidate = f"{kw_title} | Digi Güvenlik"
        mt = candidate if len(candidate) <= 60 else kw_title
    if len(mt) > 60:
        cut = mt[:60]
        if " " in cut and len(cut.rsplit(" ", 1)[0]) >= len(primary_kw) + 5:
            cut = cut.rsplit(" ", 1)[0]
        mt = cut.rstrip(" -|:,")
        if len(mt) > 60 or primary_kw.lower() not in mt.lower():
            mt = kw_title[:60].strip()
    article["meta_title"] = mt

    md = " ".join((article.get("meta_description") or "").split()).strip()
    if len(md) > 160:
        cut = md[:159]
        if " " in cut:
            cut = cut.rsplit(" ", 1)[0]
        cut = cut.rstrip(" ,;:-")
        if not cut.endswith((".", "!", "?")):
            cut += "."
        if len(cut) > 160:
            cut = cut[:159].rstrip() + "."
        md = cut
    elif len(md) < 140:
        suffix_pool = [
            " Detaylı teknik inceleme, güncel fiyatlar ve kapıda ödeme seçeneklerini keşfedin.",
            " Uzman teknik analiz, karşılaştırma tablosu ve güncel model seçeneklerini inceleyin.",
            " Güncel fiyatları, pil ömrünü ve garanti koşullarını şimdi karşılaştırın.",
        ]
        for suf in suffix_pool:
            base = md.rstrip(".")
            cand = (base + "." + suf).strip()
            if 140 <= len(cand) <= 160:
                md = cand
                break
        else:
            base = md.rstrip(".") + "."
            extra = " Teknik rehber ve güncel fiyat seçeneklerini Digi Güvenlik güvencesiyle inceleyin."
            combined = (base + extra).strip()
            if len(combined) > 160:
                cut = combined[:159].rsplit(" ", 1)[0].rstrip(" ,;:-") + "."
                md = cut
            elif len(combined) >= 140:
                md = combined
    article["meta_description"] = md


def process_one_article(dry_run: bool, exclude_slugs: set, exclude_cats: set) -> dict:
    mode = "dry_run" if dry_run else "live"
    plan = planner.choose_next_plan(
        exclude_product_slugs=exclude_slugs,
        exclude_category_slugs=exclude_cats,
    )
    print(f"\n>>> Plan Seçildi: tür={plan['topic_type']} | ana_kelime='{plan['primary_keyword']}'")
    print(f"    Kategori: {plan['category']['name']} | Ürünler: {[p['slug'] for p in plan['products']]}")

    existing_articles = db.get_existing_articles(include_dry_run=dry_run)
    last_issues: list = []
    last_report = {}
    last_article = None
    last_images = []
    last_schema = {}

    for attempt in range(1, config.MAX_RETRIES + 1):
        if attempt == 1 or last_article is None:
            print(f"  [Deneme {attempt}/{config.MAX_RETRIES}] Gemini metin üretimi çağrılıyor...")
            prompt = _format_prompt(plan)
            article = gemini_client.generate_article_json(prompt)
        else:
            print(f"  [Deneme {attempt}/{config.MAX_RETRIES}] Mevcut taslak kalite hatalarına göre revize ediliyor...")
            article = gemini_client.refine_article_json(
                article=last_article,
                plan=plan,
                issues=last_issues,
                current_word_count=last_report.get("word_count", 0),
            )

        _normalize_meta(article, plan["primary_keyword"])

        # Slug güvenliği
        slug = planner._slug_clean(article.get("slug") or plan["suggested_slug"])[:70]
        if not slug:
            slug = plan["suggested_slug"]
        article["slug"] = slug

        img_out_dir = (config.DRY_RUN_DIR / "images" / slug) if dry_run else (config.PUBLIC_BLOG_UPLOAD_DIR / slug)
        if attempt == 1 or not last_images:
            print(f"  [Deneme {attempt}] Görseller hazırlanıyor ({config.IMAGE_MODEL} + ürün görseli)...")
            images = gemini_client.generate_article_images(
                slug=slug,
                image_specs=article.get("image_prompts", []),
                products=plan["products"],
                out_dir=img_out_dir,
            )
            last_images = images
        else:
            images = last_images

        now_iso = datetime.now(TR_TZ).isoformat()
        schema_obj = publisher.build_json_ld(article, plan, images, now_iso)
        passed, issues, report = quality_gate.validate_and_prepare(
            article=article,
            plan=plan,
            existing_articles=existing_articles,
            images=images,
            schema_obj=schema_obj,
        )
        last_issues = issues
        last_report = report
        last_article = article
        last_schema = schema_obj

        print(f"  [Kalite Kapısı] Kelime={report['word_count']} | H2={report['h2_count']} | ÜrünLink={report['product_links_count']} | DışLink={len(report['external_links_verified'])} | Benzerlik={report['similarity']:.2%}")
        if passed:
            print("  [BAŞARILI] Tüm kalite kontrolleri geçti!")
            if dry_run:
                paths = publisher.save_dry_run_preview(article, plan, images, schema_obj, report)
                db.log_run(mode, "dry_run_ok", plan["topic_type"], slug, [p["slug"] for p in plan["products"]], "Dry-run başarılı", report)
                return {
                    "status": "dry_run_ok",
                    "article": article,
                    "report": report,
                    "paths": paths,
                    "products": [p["slug"] for p in plan["products"]],
                    "category_slug": plan["category"]["slug"],
                }
            else:
                post = publisher.publish_live(article, plan, images, schema_obj, report)
                db.log_run(mode, "published", plan["topic_type"], slug, [p["slug"] for p in plan["products"]], "Canlı yayınlandı", report)
                return {
                    "status": "published",
                    "post": post,
                    "report": report,
                    "products": [p["slug"] for p in plan["products"]],
                    "category_slug": plan["category"]["slug"],
                }
        else:
            print(f"  [RED #{attempt}] Sorunlar: {issues}")

    # 3 denemede geçmezse taslak olarak kaydet ve bildirim gönder
    assert last_article is not None
    draft_slug = last_article["slug"]
    db.save_article(
        {
            "slug": draft_slug,
            "title": last_article["title"],
            "primary_keyword": plan["primary_keyword"],
            "secondary_keywords": plan["secondary_keywords"],
            "topic_type": plan["topic_type"],
            "category_slug": plan["category"]["slug"],
            "product_slugs": [p["slug"] for p in plan["products"]],
            "status": "draft",
            "word_count": last_article.get("word_count", 0),
            "meta_title": last_article.get("meta_title", ""),
            "meta_description": last_article.get("meta_description", ""),
            "content_html": last_article.get("content_html", ""),
            "plain_text": last_article.get("plain_text", ""),
            "images": last_images,
            "faqs": last_article.get("faqs", []),
            "schema_json": last_schema,
            "quality_notes": json.dumps(last_report, ensure_ascii=False),
            "published_at": None,
        }
    )
    msg = f"Makale 3 denemede kalite kapısını geçemediği için TASLAK olarak kaydedildi.\nSlug: {draft_slug}\nHatalar: {last_report.get('issues')}"
    notifier.send_alert("Kalite Kontrol Başarısız — Taslağa Alındı", msg)
    db.log_run(mode, "draft_saved", plan["topic_type"], draft_slug, [p["slug"] for p in plan["products"]], msg, last_report)
    return {
        "status": "draft_saved",
        "slug": draft_slug,
        "report": last_report,
        "products": [p["slug"] for p in plan["products"]],
        "category_slug": plan["category"]["slug"],
    }

def main():
    parser = argparse.ArgumentParser(description="Digi Güvenlik Otomatik Günlük Blog Üreticisi")
    parser.add_argument("--dry-run", action="store_true", help="Canlıya basmadan önizleme üretir")
    parser.add_argument("--count", type=int, default=1, help="Üretilecek makale adedi")
    args = parser.parse_args()

    exit_code = 0
    try:
        synced = db.sync_catalog_from_site_db()
        print(f"Katalog senkronize edildi: {synced['categories']} kategori, {synced['products']} ürün.")
        used_in_session = set()
        used_cats_in_session = set()
        results = []
        for i in range(args.count):
            res = process_one_article(
                dry_run=args.dry_run,
                exclude_slugs=used_in_session,
                exclude_cats=used_cats_in_session,
            )
            results.append(res)
            for ps in res.get("products", []):
                used_in_session.add(ps)
            if res.get("category_slug"):
                used_cats_in_session.add(res["category_slug"])
        print("\n=== ÖZET ===")
        print(json.dumps({"mode": "dry_run" if args.dry_run else "live", "count": len(results), "statuses": [r["status"] for r in results]}, ensure_ascii=False, indent=2))
    except Exception as exc:
        err_text = f"Kritik Çalışma Hatası: {type(exc).__name__} — {str(exc)[:300]}"
        notifier.send_alert("Çalışma Hatası", err_text)
        db.log_run("dry_run" if args.dry_run else "live", "error", message=err_text)
        print(err_text, file=sys.stderr)
        exit_code = 1
    finally:
        if sys.stdout:
            sys.stdout.flush()
        if sys.stderr:
            sys.stderr.flush()
        os._exit(exit_code)

if __name__ == "__main__":
    main()
