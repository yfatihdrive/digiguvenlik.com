# -*- coding: utf-8 -*-
"""Yayın öncesi otomatik kalite kontrol kapısı (Madde 5 kontrol listesi)."""

import json
import re
import urllib.request
from html.parser import HTMLParser
from typing import Any, Dict, List, Set, Tuple
import config

class _TagBalanceParser(HTMLParser):
    VOID = {"br", "hr", "img", "input", "meta", "link"}

    def __init__(self):
        super().__init__()
        self.stack: List[str] = []
        self.errors: List[str] = []

    def handle_starttag(self, tag, attrs):
        t = tag.lower()
        if t not in self.VOID:
            self.stack.append(t)

    def handle_endtag(self, tag):
        t = tag.lower()
        if t in self.VOID:
            return
        if not self.stack or self.stack[-1] != t:
            self.errors.append(f"Eşleşmeyen kapanış etiketi: </{t}>")
        else:
            self.stack.pop()

def strip_html(html: str) -> str:
    txt = re.sub(r"\[\[(PRODUCT_CARD|INLINE_IMAGE):[^\]]+\]\]", " ", html)
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt

def count_words(article: Dict[str, Any]) -> int:
    faq_text = " ".join(
        f"{f.get('question', '')} {f.get('answer', '')}" for f in article.get("faqs", [])
    )
    combined = " ".join([article.get("tldr_summary", ""), strip_html(article.get("content_html", "")), faq_text])
    words = [w for w in re.split(r"\s+", combined.strip()) if w]
    return len(words)

def sanitize_html_text(html: str) -> str:
    """Boş paragraf, çift boşluk ve temel noktalama boşluk hatalarını temizler."""
    # Boş paragrafları sil
    html = re.sub(r"<p>\s*</p>", "", html, flags=re.I)
    # Metin içindeki çift boşlukları (tag içindeki attribute boşluklarını bozmadan) düzelt
    parts = re.split(r"(<[^>]+>)", html)
    cleaned_parts = []
    for p in parts:
        if p.startswith("<"):
            cleaned_parts.append(p)
        else:
            p = re.sub(r" {2,}", " ", p)
            p = re.sub(r"\s+([,.;:!?])", r"\1", p)
            cleaned_parts.append(p)
    return "".join(cleaned_parts).strip()

def check_url_http_200(url: str) -> bool:
    """Dış linkin canlı HTTP 200 (veya yönlendirme sonrası 200) döndüğünü doğrular."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; DigiGuvenlikBot/1.0; +https://digiguvenlik.company)"}
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=5) as resp:
                if 200 <= resp.status < 300:
                    return True
        except Exception:
            continue
    return False

def _ngram_set(text: str, n: int = 5) -> Set[str]:
    words = re.findall(r"[a-zçğıöşü0-9]+", text.lower())
    if len(words) < n:
        return set(words)
    return {" ".join(words[i : i + n]) for i in range(len(words) - n + 1)}

def max_similarity_with_existing(plain_text: str, existing_articles: List[Dict[str, Any]]) -> float:
    cur_ng = _ngram_set(plain_text, 5)
    if not cur_ng:
        return 0.0
    worst = 0.0
    for art in existing_articles:
        other_ng = _ngram_set(art.get("plain_text", ""), 5)
        if not other_ng:
            continue
        inter = len(cur_ng & other_ng)
        union = len(cur_ng | other_ng)
        sim = inter / max(1, union)
        if sim > worst:
            worst = sim
    return round(worst, 4)

def validate_and_prepare(
    article: Dict[str, Any],
    plan: Dict[str, Any],
    existing_articles: List[Dict[str, Any]],
    images: List[Dict[str, Any]],
    schema_obj: Dict[str, Any],
) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    Tüm yayın öncesi kontrolleri çalıştırır.
    Dönüş: (geçti_mi, hata_listesi, rapor_özeti)
    """
    issues: List[str] = []
    html = sanitize_html_text(article.get("content_html", ""))
    # İçerikte yanlışlıkla <h1> yazıldıysa <h2> yap (sayfada tek H1 title olarak basılır)
    html = re.sub(r"<h1([^>]*)>", r"<h2\1>", html, flags=re.I)
    html = re.sub(r"</h1>", "</h2>", html, flags=re.I)
    article["content_html"] = html

    plain = strip_html(html)
    article["plain_text"] = plain

    # 1. Kelime sayısı
    wc = count_words(article)
    article["word_count"] = wc
    if wc < config.MIN_WORDS or wc > config.MAX_WORDS:
        issues.append(f"Kelime sayısı {wc} (hedef: {config.MIN_WORDS}–{config.MAX_WORDS})")

    # 2. H2 sayısı (en az 4) ve tek H1 kontrolü
    h2_matches = re.findall(r"<h2[^>]*>(.*?)</h2>", html, flags=re.S | re.I)
    h2_texts = [re.sub(r"<[^>]+>", "", h).strip() for h in h2_matches]
    if len(h2_texts) < 4:
        issues.append(f"En az 4 adet <h2> olmalı (mevcut: {len(h2_texts)})")

    # 3. Görseller (>= 3, alt metni ve <150KB WebP)
    if len(images) < 3:
        issues.append(f"En az 3 görsel olmalı (mevcut: {len(images)})")
    for idx, im in enumerate(images):
        if not (im.get("alt") or "").strip():
            issues.append(f"Görsel #{idx+1} alt metni eksik")
        if im.get("size_kb", 999) > config.MAX_IMAGE_KB:
            issues.append(f"Görsel #{idx+1} boyutu {im.get('size_kb')} KB (> {config.MAX_IMAGE_KB} KB)")

    # 4. İç & Dış link doğrulama + gerçek HTTP 200 kontrolü
    all_hrefs = re.findall(r'<a[^>]+href=["\']([^"\']+)["\']', html, flags=re.I)
    valid_product_urls = {f"{config.SITE_URL}/urun/{p['slug']}" for p in plan["products"]}
    # Veritabanındaki herhangi bir aktif ürüne link verilmişse kabul et
    import db as _db
    with _db.get_conn() as conn:
        db_prod_urls = {
            f"{config.SITE_URL}/urun/{r['slug']}"
            for r in conn.execute("SELECT slug FROM products WHERE is_active = 1").fetchall()
        }
        db_cat_urls = {
            f"{config.SITE_URL}/kategori/{r['slug']}"
            for r in conn.execute("SELECT slug FROM categories").fetchall()
        }

    found_prod_links = {u for u in all_hrefs if u in db_prod_urls}
    found_cat_links = {u for u in all_hrefs if u in db_cat_urls}
    if len(found_prod_links) < 3:
        issues.append(f"En az 3 gerçek aktif ürün linki olmalı (mevcut: {len(found_prod_links)})")
    if len(found_cat_links) < 1:
        issues.append("En az 1 gerçek kategori linki eksik")

    # Sahte/var olmayan iç linkleri engelle
    for u in all_hrefs:
        if u.startswith(f"{config.SITE_URL}/urun/") and u not in db_prod_urls:
            issues.append(f"Var olmayan ürün linki tespit edildi: {u}")
        if u.startswith(f"{config.SITE_URL}/kategori/") and u not in db_cat_urls:
            issues.append(f"Var olmayan kategori linki tespit edildi: {u}")

    # Dış linkler: yalnızca otoriter ve HTTP 200 dönenler
    trusted_urls = {s["url"] for s in config.TRUSTED_EXTERNAL_SOURCES}
    ext_links = [u for u in all_hrefs if u.startswith("http") and not u.startswith(config.SITE_URL)]
    working_ext: List[str] = []
    for ext_u in dict.fromkeys(ext_links):
        if ext_u in trusted_urls and check_url_http_200(ext_u):
            working_ext.append(ext_u)
        elif ext_u in trusted_urls:
            # HTTP 200 dönmeyen dış linki metinden temizle
            html = re.sub(
                rf'<a[^>]+href=["\']{re.escape(ext_u)}["\'][^>]*>(.*?)</a>',
                r"\1",
                html,
                flags=re.S | re.I,
            )
        else:
            # Güvenilir listede olmayan dış linki temizle
            html = re.sub(
                rf'<a[^>]+href=["\']{re.escape(ext_u)}["\'][^>]*>(.*?)</a>',
                r"\1",
                html,
                flags=re.S | re.I,
            )
    article["content_html"] = html
    if len(working_ext) < 2:
        issues.append(f"En az 2 doğrulanmış HTTP 200 otoriter dış link olmalı (geçerli: {len(working_ext)})")

    # 5. Meta Title (<=60) & Meta Description (140-160)
    mt = (article.get("meta_title") or "").strip()
    md = (article.get("meta_description") or "").strip()
    if not mt or len(mt) > 60:
        issues.append(f"meta_title uzunluğu {len(mt)} (maks 60 karakter olmalı)")
    if len(md) < 140 or len(md) > 160:
        issues.append(f"meta_description uzunluğu {len(md)} (140–160 karakter olmalı)")

    # 6. Ana anahtar kelime kontrolü (title, meta_title, ilk paragraf, en az 1 H2)
    kw = plan["primary_keyword"].lower().strip()
    first_p_m = re.search(r"<p[^>]*>(.*?)</p>", html, flags=re.S | re.I)
    first_100 = " ".join(plain.split()[:100]).lower()
    if kw not in (article.get("title") or "").lower():
        issues.append("Ana anahtar kelime H1 başlıkta (title) geçmiyor")
    if kw not in mt.lower():
        issues.append("Ana anahtar kelime meta_title içinde geçmiyor")
    if kw not in first_100:
        issues.append("Ana anahtar kelime ilk 100 kelimede geçmiyor")
    if not any(kw in h.lower() for h in h2_texts):
        issues.append("Ana anahtar kelime en az bir H2 başlıkta geçmiyor")

    # 7. Geçerli HTML & geçerli JSON-LD
    parser = _TagBalanceParser()
    parser.feed(html)
    if parser.errors:
        issues.append("HTML etiket dengesizliği: " + "; ".join(parser.errors[:2]))
    try:
        json.dumps(schema_obj, ensure_ascii=False)
    except Exception as exc:
        issues.append(f"Geçersiz JSON-LD: {exc}")

    # 8. Klişe yasağı & boşluk/noktalama kontrolü
    lower_plain = plain.lower()
    for cliche in config.FORBIDDEN_CLICHES:
        if cliche in lower_plain:
            issues.append(f"Yasaklı AI klişesi bulundu: '{cliche}'")

    # 9. Benzerlik kontrolü
    sim = max_similarity_with_existing(plain, existing_articles)
    if sim >= config.MAX_SIMILARITY:
        issues.append(f"Önceki makalelerle benzerlik yüksek: {sim:.2%} (>= {config.MAX_SIMILARITY:.0%})")

    # 10. Başlık / Slug benzersizliği
    used_slugs = {a["slug"].lower() for a in existing_articles}
    used_titles = {a["title"].lower() for a in existing_articles}
    if article["slug"].lower() in used_slugs:
        issues.append(f"Slug daha önce kullanılmış: {article['slug']}")
    if article["title"].lower() in used_titles:
        issues.append("Başlık daha önce kullanılmış")

    report = {
        "word_count": wc,
        "h2_count": len(h2_texts),
        "images_count": len(images),
        "product_links_count": len(found_prod_links),
        "category_links_count": len(found_cat_links),
        "external_links_verified": working_ext,
        "meta_title_len": len(mt),
        "meta_description_len": len(md),
        "similarity": sim,
        "issues": issues,
    }
    return (len(issues) == 0, issues, report)
