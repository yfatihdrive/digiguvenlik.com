# -*- coding: utf-8 -*-
"""Akıllı günlük konu planlayıcı — kannibalizasyon önleme ve ürün kapsama önceliği."""

import json
import re
from typing import Any, Dict, List, Optional, Tuple
import config
import db

TOPIC_DESCRIPTIONS = {
    "kategori_rehberi": "Kapsamlı Kategori Rehberi — kategorideki farklı model tiplerini, kullanım senaryolarını ve seçim kriterlerini anlat.",
    "tek_urun_inceleme": "Detaylı Tek Ürün İncelemesi — odak ürünü teknik verileriyle incele, alternatif 2 ürünü de tamamlayıcı seçenek olarak bağla.",
    "urun_karsilastirma": "Ürün Karşılaştırma Rehberi — seçilen 3 ürünü somut teknik özellikler, batarya/voltaj/çözünürlük ve kullanım alanına göre karşılaştır.",
    "nasil_secilir": "Nasıl Seçilir Rehberi — ihtiyaca göre doğru cihaz tipini seçme adımlarını, yapılan yaygın hataları ve kontrol listesini ver.",
    "kullanim_ipuclari": "Kurulum, Konumlandırma ve Pratik Kullanım İpuçları — sahada verimi artıran gerçek uygulama tavsiyeleri ve bakım adımları sun.",
    "sss_rehberi": "Sektörel Sorular ve Mevzuat/Teknik Rehber — kullanıcıların en çok merak ettiği soruları net sayısal verilerle yanıtla.",
    "mevsimsel_guncel": "Güncel Saha Güvenliği ve Dönemsel İhtiyaç Rehberi — güncel kullanım ihtiyaçları (seyahat, araç koruma, ofis denetimi vb.) çerçevesinde çözüm sun.",
}

def _slug_clean(text: str) -> str:
    tr_map = str.maketrans("çğıöşüÇĞİÖŞÜ ", "cgiosucgiosu-")
    s = text.lower().translate(tr_map)
    s = re.sub(r"[^a-z0-9\-]+", "", s)
    return re.sub(r"-+", "-", s).strip("-")

def choose_next_plan(
    exclude_product_slugs: Optional[set] = None,
    exclude_category_slugs: Optional[set] = None,
) -> Dict[str, Any]:
    """Sonraki benzersiz makale konusunu, ürün setini ve anahtar kelimeleri seçer."""
    exclude_product_slugs = exclude_product_slugs or set()
    exclude_category_slugs = exclude_category_slugs or set()
    existing = db.get_existing_articles(include_dry_run=True)

    # 1. Konu türünü dönüşümlü belirle
    next_idx = len(existing) % len(config.TOPIC_TYPES)
    topic_type = config.TOPIC_TYPES[next_idx]

    used_keywords = {a["primary_keyword"].lower().strip() for a in existing}
    used_titles = {a["title"].lower().strip() for a in existing}
    used_slugs = {a["slug"].lower().strip() for a in existing}

    with db.get_conn() as conn:
        all_cats = [dict(r) for r in conn.execute("SELECT * FROM categories WHERE count > 0").fetchall()]
        # Öncelik: hiç işlenmemiş (usage_count = 0), ardından en az işlenmiş stoklu ürünler
        active_prods = [
            dict(r)
            for r in conn.execute(
                """
                SELECT * FROM products
                WHERE is_active = 1
                ORDER BY usage_count ASC, review_count DESC, id DESC
                """
            ).fetchall()
        ]

    if not active_prods:
        raise RuntimeError("Aktif stoklu ürün bulunamadı.")

    # Aynı oturumda/günde farklı kategorilere, henüz hiç yazılmamış kategorilere ve hiç işlenmemiş ürünlere öncelik ver
    cat_article_counts: Dict[str, int] = {}
    for a in existing:
        cs = a.get("category_slug") or ""
        if cs:
            cat_article_counts[cs] = cat_article_counts.get(cs, 0) + 1

    candidate_prods = [
        p
        for p in active_prods
        if p["slug"] not in exclude_product_slugs
        and p["category_slug"] not in exclude_category_slugs
    ]
    if len(candidate_prods) < 3:
        candidate_prods = [p for p in active_prods if p["slug"] not in exclude_product_slugs]
    if len(candidate_prods) < 3:
        candidate_prods = active_prods

    # Henüz makalesi olmayan (en az yazılı) kategoriden ürün seç
    min_cat_cnt = min(cat_article_counts.get(p["category_slug"], 0) for p in candidate_prods)
    untouched_cat_prods = [p for p in candidate_prods if cat_article_counts.get(p["category_slug"], 0) == min_cat_cnt]
    focus_prod = untouched_cat_prods[0] if untouched_cat_prods else candidate_prods[0]
    cat_slug = focus_prod["category_slug"]
    cat_obj = next((c for c in all_cats if c["slug"] == cat_slug), None)
    if not cat_obj and all_cats:
        cat_obj = all_cats[0]

    same_cat = [
        p for p in candidate_prods
        if p["category_slug"] == cat_slug and p["slug"] != focus_prod["slug"]
    ]
    other_cat = [
        p for p in candidate_prods
        if p["category_slug"] != cat_slug and p["slug"] != focus_prod["slug"]
    ]
    selected_prods = [focus_prod] + (same_cat[:3] if len(same_cat) >= 3 else (same_cat + other_cat)[:3])
    selected_prods = selected_prods[:4]

    # Ana ve ikincil anahtar kelimeleri doğal 2-4 kelimelik yapıda, kannibalizasyonsuz üret
    cat_name = cat_obj["name"] if cat_obj else focus_prod["category"]
    cat_lower = cat_name.lower()
    cat_words = cat_lower.split()
    cat_short = cat_lower if len(cat_lower) <= 35 else " ".join(cat_words[:4])
    model_short = " ".join(focus_prod["name"].split("—")[0].strip().split()[:3]).lower()

    keyword_candidates: List[Tuple[str, List[str]]] = [
        (cat_short, [f"{cat_short} rehberi", f"{cat_short} seçimi", "uzaktan izleme cihazı", "kapıda ödeme güvenlik"]),
        (f"{cat_short} rehberi", [cat_short, f"{cat_short} tavsiye", "uzun pil ömrü", "mobil uygulama kontrol"]),
        (f"{cat_short} seçimi", [cat_short, f"en uygun {cat_short}", "teknik özellik farkları", "profesyonel kullanım"]),
        (f"{model_short} inceleme", [cat_short, f"{cat_short} modelleri", "konum doğruluğu", "batarya verimliliği"]),
        (f"{cat_short} fiyatları", [cat_short, "garantili güvenlik cihazı", "4g konum izleme", "türkçe destekli cihaz"]),
        (f"{cat_short} kullanımı", [cat_short, "kvkk uyumlu kullanım", "sim kartlı takip", "pratik kurulum"]),
    ]

    primary_kw = f"{cat_short} teknik rehberi"
    secondary_kws = [cat_short, model_short, "türkçe mobil uygulama", "uzaktan takip cihazı"]
    for cand_kw, cand_sec in keyword_candidates:
        if cand_kw.lower() not in used_keywords and len(cand_kw) <= 38:
            primary_kw = cand_kw
            secondary_kws = cand_sec
            break
    else:
        if len(model_short) <= 28:
            primary_kw = f"{model_short} incelemesi"

    # Önceki yayınlanmış yazı (varsa iç link için)
    prev_article = next((a for a in existing if a["status"] == "published"), None)
    if not prev_article and existing:
        prev_article = existing[0]

    # Kategoriyle uyumlu 3-4 otoriter dış kaynak seç
    ext_sources = _pick_external_sources(cat_slug)

    return {
        "topic_type": topic_type,
        "topic_instruction": TOPIC_DESCRIPTIONS[topic_type],
        "primary_keyword": primary_kw,
        "secondary_keywords": secondary_kws[:5],
        "category": cat_obj or {"slug": cat_slug, "name": cat_name, "description": ""},
        "products": selected_prods,
        "previous_article": (
            {"title": prev_article["title"], "url": f"{config.SITE_URL}/blog/{prev_article['slug']}"}
            if prev_article
            else None
        ),
        "external_sources": ext_sources,
        "forbidden_titles": list(used_titles),
        "forbidden_slugs": list(used_slugs),
        "suggested_slug": _slug_clean(primary_kw)[:65],
    }

def _pick_external_sources(category_slug: str) -> List[Dict[str, str]]:
    """Kategori bağlamına göre 4 güvenilir dış kaynak önerir."""
    sources = config.TRUSTED_EXTERNAL_SOURCES
    if "gps" in category_slug or "takip" in category_slug:
        preferred = [
            "https://tr.wikipedia.org/wiki/K%C3%BCresel_Konumland%C4%B1rma_Sistemi",
            "https://www.btk.gov.tr/",
            "https://tr.wikipedia.org/wiki/IP_kodu",
            "https://www.kvkk.gov.tr/",
        ]
    elif "dinleme" in category_slug or "ses" in category_slug:
        preferred = [
            "https://www.kvkk.gov.tr/",
            "https://www.btk.gov.tr/",
            "https://www.tse.org.tr/",
            "https://ticaret.gov.tr/",
        ]
    else:
        preferred = [
            "https://www.kvkk.gov.tr/",
            "https://tr.wikipedia.org/wiki/Kapal%C4%B1_devre_televizyon",
            "https://tr.wikipedia.org/wiki/Wi-Fi",
            "https://www.tse.org.tr/",
        ]
    picked = [s for s in sources if s["url"] in preferred]
    return picked[:4] if len(picked) >= 2 else sources[:4]
