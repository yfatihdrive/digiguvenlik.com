# Digi Güvenlik — Günlük Otomatik SEO/GEO Blog Sistemi Kurulum & Kullanım Rehberi

Bu rehber, **Gemini API** (güncel `google-genai` SDK) ile her gün otomatik olarak özgün, SEO/GEO uyumlu blog makalesi ve WebP görselleri üreten, kalite kapısından geçirdikten sonra **GitHub Actions → Vercel** hattı üzerinden `https://digiguvenlik.company/blog` adresinde yayınlayan sistemin kurulum ve bakım adımlarını anlatır.

---

## 1. Klasör ve Dosya Mimarisi

```text
blog_automation/
├── config.py              # Model adları, limitler, e-posta ve güvenilir dış kaynak havuzu
├── db.py                  # SQLite (blog.db) — ürün, kategori, makale ve log takibi
├── planner.py             # 7 konulu dönüşümlü planlayıcı + kannibalizasyon önleme
├── gemini_client.py       # Interactions API (retry+backoff) + 1200x675 WebP (<150 KB)
├── quality_gate.py        # 10 maddelik yayın öncesi kalite & HTTP 200 dış link doğrulama
├── publisher.py           # data/blog-posts.json canlı yayın + dry-run HTML/JSON önizleme
├── notifier.py            # Hata/taslak durumunda SMTP e-posta + alerts.log bildirimi
├── run_daily.py           # Ana çalıştırıcı CLI (--dry-run, --count)
├── requirements.txt       # google-genai>=3.5.0, Pillow>=10.0.0
└── prompts/
    ├── text_prompt.txt    # Metin üretim şablonu (kolayca düzenlenebilir)
    └── image_prompt.txt   # Görsel üretim şablonu

src/
├── app/blog/page.tsx      # Blog listesi (/blog)
├── app/blog/[slug]/page.tsx # Makale detay + GEO "Kısaca" + JSON-LD + Ürün Kartları
├── components/BlogProductCard.tsx # Makale içi "Ürünü İncele / Hemen Satın Al" kartı
└── lib/blog.ts            # data/blog-posts.json okuyucu

.github/workflows/daily-blog.yml  # Her gün 10:00 TR (07:00 UTC) otomatik Vercel yayını
```

---

## 2. Yerel Kurulum ve Dry-Run Testi

1. **Bağımlılıkları yükleyin:**
   ```bash
   pip install -r blog_automation/requirements.txt
   ```
2. **Ortam değişkenlerini ayarlayın:**
   - `.env.example` dosyasını `.env.local` olarak kopyalayın (`cp .env.example .env.local`).
   - `.env.local` içine geçerli `GEMINI_API_KEY` değerini ekleyin. (`.env.local` `.gitignore` kapsamındadır; asla Git'e push edilmez.)
3. **Dry-run (yayınlamadan test) çalıştırın:**
   ```bash
   python blog_automation/run_daily.py --dry-run --count 2
   ```
   Üretilen önizleme dosyaları `blog_automation/dry_run_previews/` klasörüne `.html` ve `.json` olarak kaydedilir; `data/blog-posts.json` değişmez.
4. **Canlı tek makale testi (yerel):**
   ```bash
   python blog_automation/run_daily.py --count 1
   ```

---

## 3. GitHub Actions Otomatik Yayın Kurulumu (Günlük 10:00 TR)

Bilgisayarınız kapalıyken bile her gün saat **10:00 Türkiye Saati (07:00 UTC)** itibarıyla çalışması için:

1. GitHub deponuzu açın: `Settings → Secrets and variables → Actions → New repository secret`.
2. Zorunlu gizli anahtarı ekleyin:
   - `GEMINI_API_KEY`: Google AI Studio Gemini API anahtarınız.
3. *(İsteğe bağlı — Hata e-postası için)* Aynı bölüme şu 4 SMTP secret'ını ekleyin:
   - `SMTP_HOST` (ör. `smtp.gmail.com`)
   - `SMTP_PORT` (ör. `587`)
   - `SMTP_USER` (ör. `siparis@digiguvenlik.company`)
   - `SMTP_PASS` (Gmail Uygulama Şifresi)
4. İlk manuel testi GitHub üzerinden yapmak için **Actions → Günlük Otomatik SEO/GEO Blog Üretimi ve Yayını → Run workflow** butonunu kullanabilirsiniz (`dry_run: true` veya `false`).
5. Workflow yeni makaleyi `main` dalına push ettiğinde **Vercel otomatik olarak canlıya (`https://digiguvenlik.company/blog`)** çıkarır ve `/sitemap.xml` + `/llms.txt` anında güncellenir.

---

## 4. Model Adlarını Değiştirme

`blog_automation/config.py` içinden veya `.env.local` / GitHub Actions Variables (`vars`) üzerinden kod değiştirmeden güncelleyebilirsiniz:
- `GEMINI_TEXT_MODEL=gemini-3.5-flash-lite` *(alternatif: `gemini-3.1-flash-lite`, `gemini-4-argon`, `gemini-4-hydrogen`, `gemini-4-neon`)*
- `GEMINI_IMAGE_MODEL=gemini-nano-banana-2.1` *(alternatif: `gemini-3-pro-image`)*

---

## 5. Google Arama Yıldızlı Görünüm & Google Görsel Arama Notları

- **Yıldızlı Görünüm (`5,0 ★★★★★`):**
  - Tüm ürün sayfaları (`/urun/[slug]`), kategori listeleri (`/kategori/[slug]`) ve ürün inceleyen blog makaleleri (`/blog/[slug]`) içinde `AggregateRating` (`bestRating: "5"`, `worstRating: "1"`), `Review` ve `Offer` (`priceValidUntil`) JSON-LD şemaları tanımlıdır.
  - **Önemli Not:** Google Rich Results yıldızlarının arama sonuçlarında görünmesi Google'ın otomatik tarama ve kalite değerlendirmesine bağlıdır; Search Console üzerinden **"URL Denetimi → Canlı URL'yi Test Et"** veya **Zengin Sonuçlar Testi** (`search.google.com/test/rich-results`) ile doğrulama yapabilirsiniz.
- **Google Görsel Arama:**
  - `sitemap.ts` tüm ürün WebP görsellerini ve blog WebP görsellerini `<image:image>` etiketiyle XML haritasına dahil eder.
  - `layout.tsx` `max-image-preview:large` direktifiyle büyük görsel önizlemeyi açar; tüm görseller `<150 KB`, `1200×675` WebP, açıklamalı `alt` ve `<figcaption>` ile yayınlanır.

---

## 6. Neler Otomatik, Neler Elle Kontrol Edilmeli?

| Süreç | Durum | Açıklama |
| :--- | :---: | :--- |
| Ürün/kategori senkronizasyonu (`data/db.json` → `blog.db`) | **Otomatik** | Her çalıştırmada güncel fiyat ve stok çekilir. |
| Konu seçimi & kannibalizasyon önleme | **Otomatik** | 7 tür arasında döner, işlenmemiş ürünlere öncelik verir. |
| Metin + görsel üretimi ve `<150 KB` WebP sıkıştırma | **Otomatik** | Interactions API + retry/backoff + ürün görseli hibriti. |
| 10 maddelik kalite kontrol & HTTP 200 dış link testi | **Otomatik** | Başarısız olursa 3 kez dener; geçmezse taslağa alır. |
| `main` dalına push + Vercel canlı yayın + Sitemap/llms.txt | **Otomatik** | GitHub Actions her gün 10:00 TR'de çalışır. |
| `GEMINI_API_KEY` ve SMTP GitHub Secret tanımlaması | **Elle (1 kez)** | GitHub Repo `Settings → Secrets` bölümüne eklenmeli. |
| Haftalık kalite & Google Search Console Performans takibi | **Elle (Önerilen)** | `blog_automation/logs/alerts.log` ve GSC Zengin Sonuçlar raporu izlenmelidir. |
