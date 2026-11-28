# -*- coding: utf-8 -*-
"""
Digi Güvenlik — Standart 720x1280 Dikey Ürün Görseli Şablon Üreticisi.
Sitedeki tüm ürünlerin 5 slaytlık kurumsal WebP setini (1-ana-gorsel ... 5-kapida-odeme-guvence)
tutarlı tipografi, renk paleti ve kart düzeniyle oluşturur.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont

W, H = 720, 1280
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"

RAINBOW = [
    (255, 96, 0),    # Turuncu
    (56, 189, 248),  # Açık mavi
    (124, 58, 237),  # Mor
    (101, 163, 13),  # Yeşil
    (245, 158, 11),  # Amber
]


def _fb(sz: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD, sz)


def _fr(sz: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_REG, sz)


def _center_text(draw: ImageDraw.ImageDraw, cx: float, y: float, text: str, font, fill) -> float:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((cx - tw / 2, y), text, font=font, fill=fill)
    return th


def _wrap_lines(draw: ImageDraw.ImageDraw, text: str, font, max_w: int) -> List[str]:
    words = text.split()
    lines: List[str] = []
    cur = ""
    for w in words:
        cand = f"{cur} {w}".strip()
        bw = draw.textbbox((0, 0), cand, font=font)[2]
        if bw <= max_w or not cur:
            cur = cand
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _draw_rainbow_bar(draw: ImageDraw.ImageDraw, y: int = 0, h: int = 10) -> None:
    seg = W // len(RAINBOW)
    for i, col in enumerate(RAINBOW):
        x0 = i * seg
        x1 = W if i == len(RAINBOW) - 1 else (i + 1) * seg
        draw.rectangle([x0, y, x1, y + h], fill=col)


def _paste_contain(canvas: Image.Image, src: Image.Image, box: Tuple[int, int, int, int], pad: int = 8) -> None:
    x0, y0, x1, y1 = box
    bw, bh = (x1 - x0) - 2 * pad, (y1 - y0) - 2 * pad
    im = src.convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    rgb = Image.alpha_composite(bg, im).convert("RGB")
    ratio = min(bw / rgb.width, bh / rgb.height)
    nw, nh = max(1, int(round(rgb.width * ratio))), max(1, int(round(rgb.height * ratio)))
    resized = rgb.resize((nw, nh), Image.Resampling.LANCZOS)
    px = x0 + pad + (bw - nw) // 2
    py = y0 + pad + (bh - nh) // 2
    canvas.paste(resized, (px, py))


def _save_webp(im: Image.Image, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(out_path, format="WEBP", quality=88, method=6)
    print(f"Saved {out_path.name}: {im.size} ({out_path.stat().st_size / 1024:.1f} KB)")


def build_slide_1_ana(
    product_img: Image.Image,
    category_badge: str,
    title: str,
    out_path: Path,
) -> None:
    """Slayt 1: Ok işareti ile gösterilen Digi Güvenlik vitrin kart formatı (720x1280)."""
    canvas = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(canvas)
    _draw_rainbow_bar(d, 0, 12)

    # Üst krem rozet
    d.rounded_rectangle([36, 42, W - 36, 102], radius=30, fill=(255, 247, 237), outline=(253, 186, 116), width=2)
    _center_text(d, W / 2, 57, "DİGİ GÜVENLİK  •  %100 ORİJİNAL  •  24 AY GARANTİLİ", _fb(20), (234, 88, 12))

    # Ürün fotoğrafı alanı (beyaz)
    _paste_contain(canvas, product_img, (28, 124, W - 28, 886), pad=10)

    # Alt koyu lacivert + turuncu çerçeveli vitrin kutusu
    card_box = [32, 916, W - 32, 1242]
    d.rounded_rectangle(card_box, radius=24, fill=(17, 24, 39), outline=(255, 96, 0), width=4)

    # Kategori hapı
    cat_txt = category_badge.upper()
    cat_font = _fb(20)
    cat_w = max(230, d.textbbox((0, 0), cat_txt, font=cat_font)[2] + 56)
    cx0 = (W - cat_w) // 2
    d.rounded_rectangle([cx0, 944, cx0 + cat_w, 990], radius=23, fill=(255, 96, 0))
    _center_text(d, W / 2, 954, cat_txt, cat_font, (255, 255, 255))

    # Ürün başlığı (1 veya 2 satır ortalı)
    title_font = _fb(36)
    lines = _wrap_lines(d, title, title_font, W - 120)[:2]
    y_start = 1024 if len(lines) == 1 else 1012
    for i, ln in enumerate(lines):
        _center_text(d, W / 2, y_start + i * 44, ln, title_font, (255, 255, 255))

    # Alt 3 güven rozeti
    badges = [
        ("ÜCRETSİZ KARGO", (229, 231, 235)),
        ("KAPIDA ÖDEME", (250, 204, 21)),
        ("%100 GÜVENLİ PAKET", (229, 231, 235)),
    ]
    bx_positions = [(52, 248), (262, 458), (472, 668)]
    bf = _fb(15)
    for (label, col), (bx0, bx1) in zip(badges, bx_positions):
        d.rounded_rectangle([bx0, 1140, bx1, 1210], radius=12, fill=(30, 41, 59), outline=(71, 85, 105), width=2)
        _center_text(d, (bx0 + bx1) / 2, 1165, label, bf, col)

    _save_webp(canvas, out_path)


def build_slide_2_ozellikler(
    showcase_img: Image.Image,
    top_label: str,
    title: str,
    features: List[Tuple[str, str, Tuple[int, int, int]]],
    out_path: Path,
) -> None:
    """Slayt 2: 1. referans görseldeki teknik özellikler infografik şablonu (720x1280)."""
    canvas = Image.new("RGB", (W, H), (15, 23, 42))
    d = ImageDraw.Draw(canvas)

    # Üst turuncu bant
    d.rectangle([0, 0, W, 168], fill=(255, 96, 0))
    _center_text(d, W / 2, 24, top_label.upper(), _fb(19), (255, 237, 213))
    tf = _fb(35)
    lines = _wrap_lines(d, title, tf, W - 80)[:2]
    y_t = 72 if len(lines) == 1 else 58
    for i, ln in enumerate(lines):
        _center_text(d, W / 2, y_t + i * 44, ln, tf, (255, 255, 255))
    _draw_rainbow_bar(d, 168, 8)

    # Beyaz yuvarlatılmış teknik görsel kutusu
    d.rounded_rectangle([24, 194, W - 24, 650], radius=24, fill=(255, 255, 255), outline=(51, 65, 85), width=2)
    _paste_contain(canvas, showcase_img, (28, 198, W - 28, 646), pad=10)

    # 2x3 teknik kartlar
    cols_x = [(24, 350), (370, W - 24)]
    rows_y = [(670, 816), (832, 978), (994, 1140)]
    head_f = _fb(20)
    desc_f = _fr(17)

    for idx, (ftitle, fdesc, accent) in enumerate(features[:6]):
        r, c = divmod(idx, 2)
        x0, x1 = cols_x[c]
        y0, y1 = rows_y[r]
        d.rounded_rectangle([x0, y0, x1, y1], radius=16, fill=(21, 31, 48), outline=accent, width=2)
        d.rounded_rectangle([x0, y0, x0 + 12, y1], radius=6, fill=accent)
        d.text((x0 + 24, y0 + 16), ftitle.upper(), font=head_f, fill=accent)
        for li, ln in enumerate(_wrap_lines(d, fdesc, desc_f, (x1 - x0) - 38)[:3]):
            d.text((x0 + 24, y0 + 48 + li * 26), ln, font=desc_f, fill=(226, 232, 240))

    # Alt turuncu CTA şeridi
    d.rounded_rectangle([24, 1166, W - 24, 1248], radius=20, fill=(255, 96, 0))
    _center_text(d, W / 2, 1192, "24 AY GARANTİ  •  ÜCRETSİZ KARGO  •  WHATSAPP: 0 216 825 10 57", _fb(19), (255, 255, 255))

    _save_webp(canvas, out_path)


def build_slide_3_detay(
    detail_img: Image.Image,
    title: str,
    pill_text: str,
    detail_cards: List[Tuple[str, str]],
    out_path: Path,
) -> None:
    """Slayt 3: Yakın çekim & donanım detayı şablonu (720x1280)."""
    canvas = Image.new("RGB", (W, H), (241, 245, 249))
    d = ImageDraw.Draw(canvas)
    _draw_rainbow_bar(d, 0, 10)

    d.text((38, 34), "YAKIN ÇEKİM & DONANIM DETAYI", font=_fb(19), fill=(255, 96, 0))
    d.text((38, 66), title, font=_fb(31), fill=(15, 23, 42))

    # Beyaz vitrin kartı
    d.rounded_rectangle([28, 124, W - 28, 792], radius=24, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    _paste_contain(canvas, detail_img, (36, 134, W - 36, 712), pad=12)

    # Sağ alt turuncu hap
    pf = _fb(19)
    pw = max(320, d.textbbox((0, 0), pill_text.upper(), font=pf)[2] + 54)
    d.rounded_rectangle([W - 46 - pw, 720, W - 46, 774], radius=14, fill=(255, 96, 0))
    _center_text(d, W - 46 - pw / 2, 735, pill_text.upper(), pf, (255, 255, 255))

    # 3 adet yatay detay kartı
    y_cards = [(818, 950), (968, 1094), (1112, 1238)]
    for (ctitle, cdesc), (y0, y1) in zip(detail_cards[:3], y_cards):
        d.rounded_rectangle([28, y0, W - 28, y1], radius=18, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
        d.rounded_rectangle([46, y0 + 20, 58, y1 - 20], radius=5, fill=(255, 96, 0))
        d.text((76, y0 + 20), ctitle.upper(), font=_fb(20), fill=(255, 96, 0))
        for li, ln in enumerate(_wrap_lines(d, cdesc, _fr(20), W - 126)[:2]):
            d.text((76, y0 + 54 + li * 28), ln, font=_fr(20), fill=(30, 41, 59))

    _save_webp(canvas, out_path)


def build_slide_4_kullanim(
    app_img: Image.Image,
    title: str,
    steps: List[Tuple[str, str]],
    use_cases: List[Tuple[str, str]],
    out_path: Path,
) -> None:
    """Slayt 4: Kullanım alanları & 3 adımlı kurulum şablonu (720x1280)."""
    canvas = Image.new("RGB", (W, H), (241, 245, 249))
    d = ImageDraw.Draw(canvas)

    # Üst koyu lacivert alan
    d.rectangle([0, 0, W, 330], fill=(15, 23, 42))
    _center_text(d, W / 2, 28, "KULLANIM ALANLARI & PRATİK KURULUM", _fb(19), (251, 146, 60))
    tf = _fb(32)
    lines = _wrap_lines(d, title, tf, W - 80)[:2]
    y_t = 76 if len(lines) == 1 else 62
    for i, ln in enumerate(lines):
        _center_text(d, W / 2, y_t + i * 40, ln, tf, (255, 255, 255))

    # Turuncu çerçeveli beyaz görsel kutusu
    d.rounded_rectangle([32, 152, W - 32, 622], radius=24, fill=(255, 255, 255), outline=(255, 96, 0), width=3)
    _paste_contain(canvas, app_img, (38, 158, W - 38, 616), pad=8)

    # 3 adım kutusu
    step_cols = [(32, 246), (256, 464), (474, W - 32)]
    for idx, ((stitle, sdesc), (sx0, sx1)) in enumerate(zip(steps[:3], step_cols), 1):
        d.rounded_rectangle([sx0, 646, sx1, 872], radius=16, fill=(255, 255, 255), outline=(253, 186, 116), width=2)
        d.rounded_rectangle([sx0 + 18, 666, sx0 + 120, 704], radius=10, fill=(255, 96, 0))
        _center_text(d, sx0 + 69, 673, f"{idx}. ADIM", _fb(17), (255, 255, 255))
        d.text((sx0 + 18, 718), stitle.upper(), font=_fb(18), fill=(15, 23, 42))
        for li, ln in enumerate(_wrap_lines(d, sdesc, _fr(17), (sx1 - sx0) - 34)[:4]):
            d.text((sx0 + 18, 752 + li * 25), ln, font=_fr(17), fill=(71, 85, 105))

    # 4 kullanım alanı kartı
    uc_x = [(32, 352), (368, W - 32)]
    uc_y = [(894, 1020), (1036, 1162)]
    for idx, (utitle, udesc) in enumerate(use_cases[:4]):
        r, c = divmod(idx, 2)
        x0, x1 = uc_x[c]
        y0, y1 = uc_y[r]
        d.rounded_rectangle([x0, y0, x1, y1], radius=16, fill=(255, 255, 255), outline=(203, 213, 225), width=2)
        d.ellipse([x0 + 18, y0 + 22, x0 + 34, y0 + 38], fill=(255, 96, 0))
        d.text((x0 + 44, y0 + 18), utitle.upper(), font=_fb(18), fill=(234, 88, 12))
        for li, ln in enumerate(_wrap_lines(d, udesc, _fr(17), (x1 - x0) - 36)[:2]):
            d.text((x0 + 18, y0 + 52 + li * 24), ln, font=_fr(17), fill=(51, 65, 85))

    # Alt yeşil CTA şeridi
    d.rounded_rectangle([32, 1184, W - 32, 1252], radius=22, fill=(34, 160, 73))
    _center_text(d, W / 2, 1205, "7/24 TÜRKÇE KURULUM DESTEĞİ: 0 216 825 10 57", _fb(20), (255, 255, 255))

    _save_webp(canvas, out_path)


def build_slide_5_guvence(
    product_img: Image.Image,
    out_path: Path,
) -> None:
    """Slayt 5: Önce teslim al sonra ödeme yap & güvence şablonu (720x1280)."""
    canvas = Image.new("RGB", (W, H), (11, 18, 32))
    d = ImageDraw.Draw(canvas)

    # Üst turuncu bant
    d.rectangle([0, 0, W, 148], fill=(255, 96, 0))
    _center_text(d, W / 2, 32, "ÖNCE TESLİM AL SONRA ÖDEME YAP", _fb(30), (255, 255, 255))
    _center_text(d, W / 2, 86, "TÜM TÜRKİYE'YE ÜCRETSİZ & %100 GÜVENLİ KARGO", _fb(20), (255, 237, 213))

    # Beyaz yuvarlatılmış ürün vitrini
    d.rounded_rectangle([90, 174, W - 90, 486], radius=24, fill=(255, 255, 255), outline=(255, 96, 0), width=3)
    _paste_contain(canvas, product_img, (98, 182, W - 98, 478), pad=10)

    # 4 güvence kartı
    cards = [
        ("KAPIDA NAKİT VEYA KREDİ KARTI", "Siparişinizi kargo görevlisinden teslim alırken nakit veya kartla güvenle ödeyin.", (255, 96, 0)),
        ("HAVALE / EFT İLE %10 ANINDA İNDİRİM", "Havale veya EFT ödemelerinde sepette anında %10 ek indirim avantajı.", (34, 197, 94)),
        ("%100 GÜVENLİ PAKETLEME GARANTİSİ", "Kargo paketi üzerinde ürün içeriğine dair hiçbir yazı veya logo yer almaz.", (56, 189, 248)),
        ("24 AY GARANTİ & TÜRKÇE KILAVUZ", "Adınıza faturalı, 2 yıl garantili ve adım adım Türkçe kullanım kılavuzlu.", (168, 85, 247)),
    ]
    y_slots = [(518, 662), (682, 826), (846, 990), (1010, 1154)]
    for (ctitle, cdesc, acc), (y0, y1) in zip(cards, y_slots):
        d.rounded_rectangle([34, y0, W - 34, y1], radius=18, fill=(20, 29, 46), outline=acc, width=2)
        d.rounded_rectangle([34, y0, 48, y1], radius=7, fill=acc)
        d.text((68, y0 + 20), ctitle, font=_fb(21), fill=acc)
        for li, ln in enumerate(_wrap_lines(d, cdesc, _fr(20), W - 120)[:2]):
            d.text((68, y0 + 56 + li * 28), ln, font=_fr(20), fill=(226, 232, 240))

    # Alt yeşil CTA şeridi
    d.rounded_rectangle([34, 1178, W - 34, 1252], radius=22, fill=(34, 197, 94))
    _center_text(d, W / 2, 1201, "WHATSAPP SİPARİŞ & DESTEK: 0 216 825 10 57", _fb(22), (255, 255, 255))

    _save_webp(canvas, out_path)
