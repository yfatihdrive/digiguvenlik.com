# -*- coding: utf-8 -*-
"""Otomatik günlük blog üretim ve yayın sistemi yapılandırması."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent

def _load_env_file(path: Path) -> None:
    """Basit .env/.env.local okuyucu (yalnızca ortamda tanımlı olmayanları yükler)."""
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v

# Ortam değişkenlerini sırayla yükle (sistem ortamı önceliklidir)
_load_env_file(REPO_ROOT / ".env.local")
_load_env_file(REPO_ROOT / ".env")

# Gemini API Ayarları (Model adları buradan veya .env üzerinden değiştirilebilir)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
TEXT_MODEL = os.environ.get("GEMINI_TEXT_MODEL", "gemini-3.5-flash-lite").strip()
TEXT_MODEL_FALLBACKS = [
    m for m in dict.fromkeys([
        TEXT_MODEL,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-4-argon",
        "gemini-4-hydrogen",
        "gemini-4-neon",
    ]) if m
]
IMAGE_MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-nano-banana-2.1").strip()

# Site ve Yayın Ayarları
SITE_URL = os.environ.get("NEXT_PUBLIC_SITE_URL", "https://digiguvenlik.company").rstrip("/")
SITE_NAME = "Digi Güvenlik"
AUTHOR_NAME = os.environ.get("BLOG_AUTHOR_NAME", "Digi Güvenlik Teknik Ekibi").strip()
PUBLISH_HOUR_TR = int(os.environ.get("BLOG_PUBLISH_HOUR_TR", "10"))

# Dosya Yolları
SITE_DB_JSON = REPO_ROOT / "data" / "db.json"
BLOG_POSTS_JSON = REPO_ROOT / "data" / "blog-posts.json"
SQLITE_DB_PATH = BASE_DIR / "blog.db"
PROMPTS_DIR = BASE_DIR / "prompts"
PUBLIC_BLOG_UPLOAD_DIR = REPO_ROOT / "public" / "uploads" / "blog"
DRY_RUN_DIR = BASE_DIR / "dry_run_previews"
LOGS_DIR = BASE_DIR / "logs"

# E-posta & Bildirim Ayarları
NOTIFY_EMAIL = os.environ.get("BLOG_NOTIFY_EMAIL", "siparis@digiguvenlik.company").strip()
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587") or "587")
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASS = os.environ.get("SMTP_PASS", "").strip()

# Kalite Kontrol Eşikleri
MIN_WORDS = 950
MAX_WORDS = 1100
TARGET_WORDS = 1000
MAX_SIMILARITY = 0.20
MAX_RETRIES = 3
MAX_IMAGE_KB = 150

# Konu Türleri (dönüşümlü kullanılır)
TOPIC_TYPES = [
    "kategori_rehberi",
    "tek_urun_inceleme",
    "urun_karsilastirma",
    "nasil_secilir",
    "kullanim_ipuclari",
    "sss_rehberi",
    "mevsimsel_guncel",
]

# Yasaklı yapay zekâ klişeleri
FORBIDDEN_CLICHES = [
    "sonuç olarak",
    "günümüz dünyasında",
    "bu makalede",
    "özetle günümüzde",
    "teknolojinin gelişmesiyle",
    "hızla gelişen teknoloji",
    "gelin yakından bakalım",
    "merak edilen tüm detaylar",
    "buraya tıklayın",
    "burada bulabilirsiniz",
]

# Otoriter ve doğrulanmış dış kaynak havuzu (asla rakip e-ticaret sitesi içermez)
TRUSTED_EXTERNAL_SOURCES = [
    {
        "title": "Kişisel Verileri Koruma Kurumu (KVKK)",
        "url": "https://www.kvkk.gov.tr/",
        "topic": "Görüntü ve ses kayıtlarında kişisel verilerin korunması mevzuatı",
    },
    {
        "title": "Bilgi Teknolojileri ve İletişim Kurumu (BTK)",
        "url": "https://www.btk.gov.tr/",
        "topic": "Elektronik haberleşme, IMEI ve SIM kartlı cihaz regülasyonları",
    },
    {
        "title": "Türk Standardları Enstitüsü (TSE)",
        "url": "https://www.tse.org.tr/",
        "topic": "Elektronik cihaz güvenlik, elektromanyetik uyumluluk ve kalite standartları",
    },
    {
        "title": "T.C. Ticaret Bakanlığı",
        "url": "https://ticaret.gov.tr/",
        "topic": "Tüketici hakları, mesafeli satış ve 14 gün cayma hakkı düzenlemeleri",
    },
    {
        "title": "Küresel Konumlandırma Sistemi (GPS) — Vikipedi",
        "url": "https://tr.wikipedia.org/wiki/K%C3%BCresel_Konumland%C4%B1rma_Sistemi",
        "topic": "Uydu tabanlı GPS ve Beidou konumlandırma çalışma prensibi",
    },
    {
        "title": "IP Koruma Sınıfı Standartları — Vikipedi",
        "url": "https://tr.wikipedia.org/wiki/IP_kodu",
        "topic": "IP65, IP67 ve IP68 su/toz geçirmezlik standartları açıklaması",
    },
    {
        "title": "Wi-Fi Kablosuz Ağ Standardı — Vikipedi",
        "url": "https://tr.wikipedia.org/wiki/Wi-Fi",
        "topic": "IEEE 802.11 kablosuz bağlantı ve uzaktan IP izleme altyapısı",
    },
    {
        "title": "Kapalı Devre Televizyon (CCTV) Sistemleri — Vikipedi",
        "url": "https://tr.wikipedia.org/wiki/Kapal%C4%B1_devre_televizyon",
        "topic": "Güvenlik kamerası kayıt sistemleri ve lens teknolojileri",
    },
]
