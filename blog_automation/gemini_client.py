# -*- coding: utf-8 -*-
"""Gemini API (google-genai Interactions API) istemcisi — retry, backoff ve WebP dönüşümü."""

import base64
import io
import json
import queue
import re
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from PIL import Image, ImageDraw, ImageFont
from google import genai
import config

ARTICLE_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "meta_title": {"type": "string"},
        "meta_description": {"type": "string"},
        "slug": {"type": "string"},
        "tldr_summary": {"type": "string"},
        "content_html": {"type": "string"},
        "faqs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "answer": {"type": "string"},
                },
                "required": ["question", "answer"],
            },
        },
        "image_prompts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "prompt_en": {"type": "string"},
                    "alt_tr": {"type": "string"},
                    "caption_tr": {"type": "string"},
                    "filename_base": {"type": "string"},
                },
                "required": ["prompt_en", "alt_tr", "caption_tr", "filename_base"],
            },
        },
    },
    "required": [
        "title",
        "meta_title",
        "meta_description",
        "slug",
        "tldr_summary",
        "content_html",
        "faqs",
        "image_prompts",
    ],
}

def _get_client() -> genai.Client:
    if not config.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY ortam değişkeni tanımlı değil.")
    return genai.Client(api_key=config.GEMINI_API_KEY)

def _with_retry(fn, label: str, max_attempts: int = 3, call_timeout_s: int = 45):
    delay = 2.0
    last_err = None
    for attempt in range(1, max_attempts + 1):
        res_q: queue.Queue = queue.Queue(maxsize=1)

        def _worker():
            try:
                res_q.put((True, fn(attempt)))
            except Exception as e:
                res_q.put((False, e))

        t = threading.Thread(target=_worker, daemon=True)
        t.start()
        try:
            ok, payload = res_q.get(timeout=call_timeout_s)
            if ok:
                return payload
            raise payload
        except Exception as exc:
            if isinstance(exc, queue.Empty):
                exc = TimeoutError(f"{call_timeout_s}s zaman aşımı")
            last_err = exc
            err_name = type(exc).__name__
            err_msg = str(exc)
            safe_msg = re.sub(r"AIza[0-9A-Za-z\-_]+|AQ\.[0-9A-Za-z\-_]+", "[REDACTED]", err_msg)
            print(f"  [Gemini Retry {attempt}/{max_attempts}] {label}: {err_name} - {safe_msg[:180]}")
            if attempt < max_attempts:
                time.sleep(delay)
                delay *= 2
    raise RuntimeError(f"{label} {max_attempts} denemede başarısız: {type(last_err).__name__}")

def generate_article_json(prompt_text: str) -> Dict[str, Any]:
    """Gemini metin modeli üzerinden (yoğunlukta otomatik fallback model ile) yapılandırılmış JSON üretir."""
    client = _get_client()
    models = config.TEXT_MODEL_FALLBACKS

    def _call(attempt: int):
        model_name = models[(attempt - 1) % len(models)]
        print(f"    -> Kullanılan metin modeli: {model_name}")
        interaction = client.interactions.create(
            model=model_name,
            input=prompt_text,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": ARTICLE_JSON_SCHEMA,
            },
        )
        raw = interaction.output_text or ""
        return json.loads(raw)

    return _with_retry(_call, "Metin Üretimi", max_attempts=max(3, len(models)), call_timeout_s=90)

def refine_article_json(
    article: Dict[str, Any],
    plan: Dict[str, Any],
    issues: List[str],
    current_word_count: int,
) -> Dict[str, Any]:
    """Kalite kapısını geçemeyen taslağı sıfırdan üretmek yerine tespit edilen hatalara göre revize eder."""
    client = _get_client()
    models = config.TEXT_MODEL_FALLBACKS

    only_word_shortage = (
        current_word_count < 950
        and len(issues) == 1
        and "Kelime sayısı" in issues[0]
    )

    if only_word_shortage:
        deficit = max(110, 1020 - current_word_count)
        upper = deficit + 45
        prod_facts = [
            {
                "name": p["name"],
                "url": f"{config.SITE_URL}/urun/{p['slug']}",
                "price_tl": int(p["price"]),
                "highlights": json.loads(p.get("highlights_json") or "[]")[:4],
                "specs": json.loads(p.get("specs_json") or "[]")[:6],
            }
            for p in plan["products"]
        ]
        add_prompt = f"""Aşağıdaki konu ve gerçek ürün verileri için mevcut Türkçe makaleye eklenecek YENİ bir teknik HTML bölümü yaz.

KONU / ANA ANAHTAR KELİME: {plan['primary_keyword']}
Mevcut başlıklar (bunları tekrar etme): {', '.join(re.findall(r'<h2[^>]*>(.*?)</h2>', article.get('content_html', ''), flags=re.S | re.I))}

GERÇEK ÜRÜN VERİLERİ (Yalnızca bunları kullan, fiyat/özellik uydurma):
{json.dumps(prod_facts, ensure_ascii=False)}

KURALLAR:
1. Uzunluk: Üreteceğin "extra_html" düz metni KESİNLİKLE {deficit} ile {upper} kelime arasında olmalıdır (bütçeyi tam tuttur!).
2. Yapı: 1 veya 2 adet yeni <h2> soru başlığı ("... nasıl konumlandırılır?", "... batarya ve kayıt ömrü nasıl yönetilir?" gibi), her <h2> altında 2–3 kısa <p> paragraf ve bir <ul><li> madde listesi kullan.
3. Yalnızca <h2>, <h3>, <p>, <ul>, <li>, <strong> etiketleri kullan. <h1> kullanma.
4. "Sonuç olarak", "Günümüz dünyasında", "Bu makalede", "Buraya tıklayın" gibi yasaklı AI kalıplarını ASLA kullanma.
5. JSON içinde yalnızca {{"extra_html": "..."}} döndür."""

        def _add_call(attempt: int):
            model_name = models[(attempt - 1) % len(models)]
            print(f"    -> Eklemeli genişletme modeli ({deficit}-{upper} kelime): {model_name}")
            interaction = client.interactions.create(
                model=model_name,
                input=add_prompt,
                response_format={
                    "type": "text",
                    "mime_type": "application/json",
                    "schema": {
                        "type": "object",
                        "properties": {"extra_html": {"type": "string"}},
                        "required": ["extra_html"],
                    },
                },
            )
            data = json.loads(interaction.output_text or "{}")
            return data.get("extra_html", "")

        extra_html = _with_retry(_add_call, "Eklemeli Kelime Genişletme", max_attempts=3, call_timeout_s=60)
        merged = dict(article)
        orig_html = merged.get("content_html", "")
        last_h2 = orig_html.rfind("<h2")
        if last_h2 > 0:
            merged["content_html"] = orig_html[:last_h2] + "\n" + extra_html + "\n" + orig_html[last_h2:]
        else:
            merged["content_html"] = orig_html + "\n" + extra_html
        return merged

    prod_links = [
        {"name": p["name"], "url": f"{config.SITE_URL}/urun/{p['slug']}", "price_tl": int(p["price"])}
        for p in plan["products"]
    ]
    cat_url = f"{config.SITE_URL}/kategori/{plan['category']['slug']}"
    word_delta = 1015 - current_word_count
    word_instruction = (
        f"Mevcut kelime sayısı {current_word_count}. Hedef: KESİNLİKLE 980–1060 kelime! "
        f"Eksik kalan yaklaşık {max(80, word_delta)} kelimeyi mevcut <h2> bölümlerinin altındaki paragraflara ve yeni somut teknik uygulama alt başlıklarına (<h3> + <ul>) ekle."
        if current_word_count < 950
        else f"Mevcut kelime sayısı {current_word_count}. Hedef: 980–1060 kelime aralığına sığdır."
    )

    rev_prompt = f"""Aşağıdaki Türkçe SEO/GEO blog makalesi taslağını incele ve YALNIZCA belirtilen kalite kontrol hatalarını düzelt. Mevcut teknik doğruluğu, gerçek fiyatları ve yapıyı koru.

TESPİT EDİLEN HATALAR:
{chr(10).join('- ' + x for x in issues)}

DÜZELTME TALİMATLARI:
1. {word_instruction}
2. "{plan['primary_keyword']}" ifadesini title, meta_title, content_html içindeki ilk 100 kelimede ve en az bir <h2> başlıkta BİREBİR geçir.
3. meta_title KESİNLİKLE <= 58 karakter, meta_description KESİNLİKLE 145–156 karakter olsun.
4. content_html içinde şu ürünlerden EN AZ 3 FARKLI TANESİNE <a href="URL">...</a> linki koy:
{json.dumps(prod_links, ensure_ascii=False)}
5. Kategori linki (<a href="{cat_url}">{plan['category']['name']}</a>) mutlaka bulunsun.
6. Dış kaynaklardan en az 2 tanesine <a href="URL" target="_blank" rel="noopener noreferrer">...</a> linki bulunsun:
{json.dumps(plan['external_sources'], ensure_ascii=False)}
7. Yapay zekâ klişelerini ("Sonuç olarak", "Günümüz dünyasında", "Bu makalede" vb.) tamamen kaldır.

DÜZELTİLECEK MEVCUT JSON:
{json.dumps(article, ensure_ascii=False)}

Çıktıyı şemaya uygun tam JSON olarak döndür."""

    def _call(attempt: int):
        model_name = models[(attempt - 1) % len(models)]
        print(f"    -> Revizyon modeli: {model_name}")
        interaction = client.interactions.create(
            model=model_name,
            input=rev_prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": ARTICLE_JSON_SCHEMA,
            },
        )
        raw = interaction.output_text or ""
        return json.loads(raw)

    return _with_retry(_call, "Metin Revizyonu", max_attempts=3, call_timeout_s=90)

def _compress_to_webp_under_limit(im: Image.Image, out_path: Path, max_kb: int = config.MAX_IMAGE_KB) -> Dict[str, Any]:
    """Görseli 1200x675 (16:9) boyutuna getirir ve <= max_kb altında WebP olarak kaydeder."""
    target_w, target_h = 1200, 675
    im = im.convert("RGB")
    src_w, src_h = im.size
    src_ratio = src_w / max(1, src_h)
    tgt_ratio = target_w / target_h
    if src_ratio > tgt_ratio:
        new_w = int(src_h * tgt_ratio)
        left = (src_w - new_w) // 2
        im = im.crop((left, 0, left + new_w, src_h))
    elif src_ratio < tgt_ratio:
        new_h = int(src_w / tgt_ratio)
        top = (src_h - new_h) // 2
        im = im.crop((0, top, src_w, top + new_h))
    im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    for quality in (82, 74, 65, 55, 45):
        buf = io.BytesIO()
        im.save(buf, format="WEBP", quality=quality, method=6)
        size_kb = len(buf.getvalue()) / 1024.0
        if size_kb <= max_kb or quality == 45:
            out_path.write_bytes(buf.getvalue())
            return {"width": target_w, "height": target_h, "size_kb": round(size_kb, 1)}
    return {"width": target_w, "height": target_h, "size_kb": 0.0}

def _build_product_composite_webp(prod_image_rel: str, out_path: Path, accent_idx: int = 0) -> Dict[str, Any]:
    """Ürün gerçek görselinden telifsiz, temiz 1200x675 WebP blog görseli üretir (hibrit veya fallback)."""
    src_path = config.REPO_ROOT / "public" / prod_image_rel.lstrip("/")
    palettes = [
        ((15, 23, 42), (30, 41, 59), (255, 96, 0)),
        ((24, 34, 52), (37, 99, 235), (248, 250, 252)),
        ((241, 245, 249), (226, 232, 240), (255, 96, 0)),
    ]
    c1, c2, acc = palettes[accent_idx % len(palettes)]
    bg = Image.new("RGB", (1200, 675), c1)
    draw = ImageDraw.Draw(bg)
    draw.rectangle([0, 0, 1200, 10], fill=acc)
    draw.rounded_rectangle([80, 55, 1120, 620], radius=32, fill=(255, 255, 255))

    if src_path.exists():
        prod_im = Image.open(src_path).convert("RGB")
        prod_im.thumbnail((540, 520), Image.Resampling.LANCZOS)
        bg.paste(prod_im, ((1200 - prod_im.width) // 2, (675 - prod_im.height) // 2))

    return _compress_to_webp_under_limit(bg, out_path)

def generate_article_images(
    slug: str,
    image_specs: List[Dict[str, str]],
    products: List[Dict[str, Any]],
    out_dir: Path,
) -> List[Dict[str, Any]]:
    """
    Her makale için en az 3 WebP (<150 KB) görsel hazırlar:
    - İlk görselleri Gemini IMAGE_MODEL ile üretmeyi dener,
    - Ürün görselleriyle dengeler (ve Gemini görsel API kotası/hatası durumunda gerçek ürün görseli kompozisyonuyla kesintisiz devam eder).
    """
    tpl = (config.PROMPTS_DIR / "image_prompt.txt").read_text(encoding="utf-8")
    client = _get_client()
    results: List[Dict[str, Any]] = []
    image_api_timed_out = False

    for idx, spec in enumerate(image_specs[:3]):
        base = re.sub(r"[^a-z0-9\-]+", "-", (spec.get("filename_base") or f"{slug}-{idx+1}").lower()).strip("-")
        if not base:
            base = f"{slug}-gorsel-{idx+1}"
        fname = f"{base}.webp"
        out_path = out_dir / fname

        meta_dim = None
        # İlk ve 3. görseli Gemini görsel modeliyle üret; 2. görseli gerçek ürün stüdyo fotoğrafından üret (a+b hibrit)
        if idx != 1 and not image_api_timed_out:
            full_prompt = tpl.replace("{IMAGE_PROMPT}", spec["prompt_en"])
            try:
                def _img_call(attempt_i: int):
                    img_models = [config.IMAGE_MODEL, "gemini-3.1-flash-lite-image"]
                    img_m = img_models[(attempt_i - 1) % len(img_models)]
                    interaction = client.interactions.create(
                        model=img_m,
                        input=full_prompt,
                        response_format=[{"type": "image"}],
                    )
                    out_img = getattr(interaction, "output_image", None)
                    if out_img and getattr(out_img, "data", None):
                        raw_bytes = out_img.data if isinstance(out_img.data, bytes) else base64.b64decode(out_img.data)
                        return Image.open(io.BytesIO(raw_bytes))
                    # Bazı yanıtlarda step çıktısından base64 yakala
                    for out in getattr(interaction, "outputs", []) or []:
                        if getattr(out, "type", "") == "image" and getattr(out, "data", None):
                            raw_bytes = out.data if isinstance(out.data, bytes) else base64.b64decode(out.data)
                            return Image.open(io.BytesIO(raw_bytes))
                    raise RuntimeError("Görsel çıktısı boş döndü.")

                pil_img = _with_retry(_img_call, f"Görsel Üretimi (#{idx+1})", max_attempts=2, call_timeout_s=25)
                meta_dim = _compress_to_webp_under_limit(pil_img, out_path)
                source_type = "gemini_image"
            except Exception as exc:
                image_api_timed_out = True
                print(f"  [Görsel Fallback #{idx+1}] Gerçek ürün görseline geçiliyor ({type(exc).__name__})")
                prod_img_rel = products[idx % len(products)]["image"]
                meta_dim = _build_product_composite_webp(prod_img_rel, out_path, idx)
                source_type = "product_studio_webp"
        else:
            prod_img_rel = products[idx % len(products)]["image"]
            meta_dim = _build_product_composite_webp(prod_img_rel, out_path, idx)
            source_type = "product_studio_webp"

        results.append(
            {
                "filename": fname,
                "url": f"/uploads/blog/{slug}/{fname}",
                "local_path": str(out_path),
                "alt": spec.get("alt_tr", f"{slug} bilgilendirme görseli {idx+1}"),
                "caption": spec.get("caption_tr", ""),
                "width": meta_dim["width"],
                "height": meta_dim["height"],
                "size_kb": meta_dim["size_kb"],
                "is_featured": idx == 0,
                "source": source_type,
            }
        )

    return results
