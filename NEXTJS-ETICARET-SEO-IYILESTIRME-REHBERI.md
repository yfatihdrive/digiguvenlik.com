# NEXT.JS E-TİCARET — KAPSAMLI SİTE İYİLEŞTİRME, TEKNİK SEO, GEO, ÖLÇÜM VE GÜVENLİK REHBERİ

> **Kullanım Amacı:** Bu doküman, Next.js (App Router) tabanlı herhangi bir Türkiye e-ticaret projesini üretim kalitesine taşımak için uçtan uca uygulanan **teknik denetim, SEO, yapay zekâ arama görünürlüğü (GEO), ölçüm (GA4/GTM/Consent Mode v2/Yandex/Bing), Merchant Center/fiyat karşılaştırma feedleri, performans/erişilebilirlik ve güvenlik** adımlarının tekrar kullanılabilir kontrol listesidir.  
> **Not:** Tüm örneklerde `[SITE_ADI]`, `[DOMAIN]`, `[ID]` yer tutucularını kendi projenize göre değiştirin; gizli anahtarları asla koda gömmeyin (`.env` / Vercel Env kullanın).

---

## 1. MİMARİ, REFERANS TEMİZLİĞİ VE KONFİGÜRASYON (P0)

### 1.1 Referans / Şablon Kalıntısı Temizliği
- Tüm repoda (`src/`, `public/`, `README.md`, `next.config.ts`, `package.json`, `.env*`) eski marka adı, alan adı, telefon, adres, e-posta, harita embed'i ve analitik ID'lerini tarayın ve sıfırlayın.
- `next.config.ts` → `images.remotePatterns` içinde harici/referans domain bırakmayın; yalnızca kendi CDN/Blob/S3 alan adlarınıza izin verin.
- Yasal künye bilgilerini tek merkezde (`src/config/site.ts`) tutun ve bilinmeyen alanları `[DOLDUR: ...]` ile işaretleyin:
  - Ticaret Unvanı, Fiziksel Adres, Telefon, E-posta, Çalışma Saatleri
  - Vergi Dairesi, Vergi No, MERSİS No, Ticaret Sicil No, KEP Adresi, ETBİS Kayıt No & Linki
- `.env.example` dosyasını eksiksiz güncelleyin; `NEXT_PUBLIC_*` önekini yalnızca herkese açık değerlerde kullanın.

### 1.2 Build Hata Gizleme Kontrolü
- `next.config.ts` içinde `typescript.ignoreBuildErrors` ve `eslint.ignoreDuringBuilds` **kapalı** olsun.
- Her değişiklik sonrası şu 4 komutu mutlaka çalıştırın:
  ```bash
  npm run typecheck   # tsc --noEmit
  npm run lint        # next lint / eslint
  npm run build       # next build
  npm run test:e2e    # Playwright (next start üzerinde!)
  ```

---

## 2. NAVİGASYON, SAYFALAR, GERÇEK 404 VE YASAL UYUM

### 2.1 Gerçek HTTP 404 (Soft-404 Tuzaklarından Kaçınma)
- **Kritik Next.js 15 App Router Notu:** Kök storefront düzeninde genel bir `(storefront)/loading.tsx` dosyası varsa ve catch-all (`[...legacyPath]`) kullanıyorsanız, geçersiz URL'ler streaming nedeniyle **`HTTP 200` (Soft 404)** dönebilir!
- **Çözüm:** Genel `loading.tsx` yerine yalnızca liste/detay rotalarına özel `urunler/loading.tsx`, `urun/[slug]/loading.tsx` kullanın; özel `src/app/not-found.tsx`, `src/app/error.tsx` ve `src/app/global-error.tsx` ekleyin.
- Production `next start` üzerinde `/olmayan-sayfa-test-404` isteğinin **gerçek `HTTP 404`** döndüğünü doğrulayın.

### 2.2 Navigasyon ve İç Link Sağlığı
- Ana menü, mega menü, mobil menü ve footer **tek veri kaynağından** beslensin (hard-code tekrarları kaldırın).
- Tüm iç linklerde `next/link` kullanın; boş `href`, `#`, `javascript:void(0)` bırakmayın.
- Aktif menü vurgusu (`usePathname` + `aria-current="page"`) ve klavye (`onFocus` / `Escape`) desteği ekleyin.
- Korumalı rotalara (`/hesabim`, `/admin`) giden `<Link>` bileşenlerine **`prefetch={false}`** ekleyin; aksi halde misafir kullanıcıda 307 yönlendirmesi tarayıcı konsolunda `RSC fetch` hatası üretebilir.
- Production build üzerinde tüm iç linkleri tarayıp **0 kırık link (`4xx/5xx`)** doğrulayın.

### 2.3 Türkiye E-Ticaret Zorunlu Yasal & Güven Sayfaları
Aşağıdaki sayfaların tamamı özgün (veya hukuk onaylı) içerikle yayında olmalı ve footer'a bağlanmalıdır:
- `/hakkimizda` (Kurumsal künye + ETBİS)
- `/iletisim` (Gerçek sunucu API'li form + tıklanabilir `tel:` / `mailto:` / WhatsApp)
- `/sss` (Ekranda görünen SSS + `FAQPage` JSON-LD)
- `/kvkk` (KVKK Aydınlatma Metni)
- `/gizlilik-politikasi`
- `/cerez-politikasi` + **KVKK Çerez Onay Banner'ı** + footer'da *"Çerez Tercihlerini Yönet"* butonu
- `/mesafeli-satis-sozlesmesi`
- `/on-bilgilendirme-formu`
- `/iade-ve-garanti-kosullari`
- `/teslimat-kosullari`
- `/kargo-takip`, `/kampanyalar`, `/bakim` (`noindex`)

---

## 3. E-TİCARET AKIŞI, FORMLAR, MEDYA VE E2E TEST

### 3.1 Form Doğrulama, Spam Koruması ve E-Posta
- Tüm API Route Handler'larda sunucu tarafı **Zod** doğrulaması kullanın.
- İletişim (`/api/contact`), bülten (`/api/newsletter`), ürün yorumu (`/api/reviews`) ve stok bildirimi (`/api/stock-alerts`) formlarına **görünmez honeypot (`website`)** alanı ekleyin (doluysa sessizce yut).
- E-posta şablonları (`Resend` API birincil, `SMTP` yedek): Sipariş onayı, admin yeni sipariş bildirimi, şifre sıfırlama, iletişim formu bildirimi.

### 3.2 Görsel Özgünleştirme, Filigran ve Tedarikçi "Görsel Hazırlanıyor" Koruması
- **Sunucu Ortamı Font Sorunu:** Vercel AWS Lambda Linux ortamında sistem fontu olmadığı için SVG `<text>` filigranı kutucuk (tofu) çizer. Filigranı ve yer tutucu (placeholder) görsellerini **önceden işlenmiş şeffaf PNG / WebP** olarak üretip projeye gömün.
- **Tedarikçi Placeholder Tespiti:** Tedarikçi "Görsel Hazırlanıyor" görseline normal ürün dosya adı verebilir. 4 katmanlı tespit kullanın:
  1. URL deseni (`hazirlaniyor`, `resim-yok`, `no-image`, `blank.png`)
  2. Kesin SHA-256 hash eşleşmesi
  3. Çok küçük görsel kontrolü (`<80px`)
  4. **16×16 RGB algısal parmak izi** (`MAE <= 10.5` ve `Pearson korelasyonu >= 0.88`) → Yakalanan görselleri otomatik kendi markanızın 1000×1000 WebP logosuyla değiştirin.

### 3.3 Playwright E2E Regresyon Paketi (`npm run test:e2e`)
- Testleri `next dev` ile değil, **gerçek production `next start`** üzerinde masaüstü (`1440×900`) + mobil (`390×844`) olarak çalıştırın.
- Kritik smoke test kapsamı:
  1. Anasayfa + menü/kategori gezinmesi
  2. Arama sonuç yok durumu + canlı arama API'si (`/api/search`)
  3. Boş sepet → ürün detay → sepete ekleme → sepet → ödeme ekranı
  4. İletişim formu sunucu gönderimi + geçersiz veride Zod `400`
  5. Üyelik sayfaları (`/giris`, `/kayit`, `/sifremi-unuttum`) + gerçek `HTTP 404`
  6. SEO/GEO (`/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/favicon.ico`, `/llms.txt`, JSON-LD, tek `<h1>`)
  7. KVKK çerez banner'ı (onay öncesi 0 izleme betiği, onay sonrası tercih kaydı)
  8. Duyarlılık (`360/390/768/1024/1280/1440/1920px` 0 yatay taşma), skip link (`Tab` → `#main-content`), 0 konsol/hydration hatası
  9. Güvenlik başlıkları (CSP/HSTS), yetkisiz `/api/admin` → `403`, `/admin` & `/hesabim` → `/giris` yönlendirmesi, rate limiting → `429`
  10. XML Feed doğrulaması (`/api/feeds/google-merchant.xml`, `cimri.xml`, `akakce.xml`, `epey.xml`)

---

## 4. TEKNİK SEO VE YAPAY ZEKÂ ARAMA GÖRÜNÜRLÜĞÜ (GEO)

### 4.1 Metadata, Yönlendirmeler ve Staging Koruması
- Kök `layout.tsx`: `<html lang="tr">`, `metadataBase`, `viewport.themeColor`, `Open Graph`, `Twitter Card`, `icon.svg` + çok boyutlu `public/favicon.ico` (16×16 + 32×32) + `apple-touch-icon.png` + `src/app/manifest.ts`.
- `"use client"` sayfaları (`iletisim`, `sepet`, `odeme`, `giris`, `kayit`, `kargo-takip` vb.) için yanlarına küçük server `layout.tsx` ekleyip benzersiz `title`/`description`/`canonical` ve sepet/ödeme/üyelik için `robots: { index: false, follow: false }` verin.
- **301 Yönlendirmeleri (`next.config.ts`):**
  - `trailingSlash: false`
  - `www.[DOMAIN]` → `https://[DOMAIN]/:path*` (`permanent: true`)
  - `http` (`x-forwarded-proto: http`) → `https://[DOMAIN]/:path*` (`permanent: true`)
- **Staging / Preview `noindex`:** `VERCEL_ENV !== "production"` veya `ALLOW_INDEXING === "false"` olduğunda hem `layout.tsx` `robots: { index: false, follow: false }` hem `robots.ts` `Disallow: /` dönsün.
- **Stoksuz Ürün SEO Kuralı:** Stokta olmayan ürünlerde `robots: { index: false, follow: true }` uygulayın ve XML ürün sitemap'inden hariç tutun (crawl budget koruması).
- **Toplu Ürün Yayınında Google Sıfır Risk Isınma Modu:** Yeni sitede ilk 3 hafta kademeli hızlanma (Hafta 1: 48/gün → Hafta 2: 72/gün → Hafta 3: 96/gün → 22. gün+: 144/gün) + tüm kategorilerden karışık stoklu ürün yayını.

### 4.2 Schema.org JSON-LD (XSS Güvenli: `<` → `\u003c`)
- **Global:** `["Organization", "ElectronicsStore"]` (veya sektöre uygun `LocalBusiness` — gerçek fiziksel adres varsa `PostalAddress`, `openingHoursSpecification`, `telephone`, `sameAs`) + `WebSite` (`SearchAction`).
- **Kategori / Liste:** `BreadcrumbList` + `CollectionPage` (`ItemList`).
- **Ürün Sayfası:** `Product` + `Offer` (`TRY`, `InStock`/`OutOfStock`, `shippingDetails`, `MerchantReturnPolicy` 14 gün; `aggregateRating` **yalnızca gerçek yorum varsa**).
- **SSS & Rehber:** Ekranda görünen sorular için `FAQPage`; teknik yazılar için `Article` / `HowTo`.

### 4.3 Yapay Zekâ Arama Görünürlüğü (GEO)
- Tüm ana içerik **SSR/SSG/ISR** ile JS çalışmadan ham HTML'de görünmelidir (bazı AI botları JS çalıştırmaz).
- `src/app/robots.ts`: Arama ve AI arama botlarına açık izin verin (`Googlebot`, `Bingbot`, `YandexBot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`; eğitim botları `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot` için proje sahibinin kararını uygulayın). `/admin`, `/api/`, `/sepet`, `/odeme`, `/hesabim` ve `?sort=`, `?q=`, `?minFiyat=` gibi parametreli filtre URL'lerini `Disallow` yapın.
- `/llms.txt` (`src/app/llms.txt/route.ts`): Marka özeti, resmi NAP (isim-adres-telefon-saat), kargo/garanti/iade kuralları, ana kategoriler, teknik rehberler, sitemap ve feed URL'lerini düz metin (`text/plain; charset=utf-8`) sunun.
- **Alıntılanabilir İçerik Formatı:** Soru biçiminde başlıklar, ilk 2–3 cümlede doğrudan net cevap, karşılaştırma/teknik özellik tabloları, ekranda görünen SSS ve tutarlı marka bilgisi. Proje başında müşterilerin ChatGPT/Gemini/Google'a soracağı **30 gerçekçi Türkçe soru** çıkarıp sayfa eşleştirmesi yapın.

---

## 5. ÖLÇÜM, KVKK CONSENT MODE V2 VE ARAMA KONSOLLARI

### 5.1 KVKK Uyumlu Google Consent Mode v2 + Çoklu Analitik
- Çerez banner'ı (`CookieConsentBanner.tsx`) onay vermeden **hiçbir** zorunlu olmayan betik (`GTM`, `GA4`, `Meta Pixel`, `Google Ads`, `Yandex Metrica`, `Microsoft Clarity`) yüklenmemelidir.
- Onay verildiğinde `AnalyticsScripts.tsx`:
  1. Önce `gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500 })` ve hemen ardından kullanıcının seçimine göre `gtag('consent', 'update', ...)` çalıştırır.
  2. GTM tanımlıysa (`NEXT_PUBLIC_GTM_ID`) yalnızca GTM yüklenir (`!gtmId && ga4Id` koşuluyla **yinelenen GA4 etiketi engellenir**).
  3. Env ID'leri enjekte edilmeden önce katı regex ile doğrulanır (`/^GTM-[A-Z0-9]+$/`, `/^G-[A-Z0-9]+$/`, `/^[0-9]{5,12}$/`).
- **Ölçülecek Olaylar (`dataLayer` + `reachGoal`):**
  - E-ticaret: `view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
  - İletişim / Lead: `contact_phone_click` (`a[href^="tel:"]`), `contact_whatsapp_click` (`a[href*="wa.me"]`), `generate_lead` (iletişim formu & bülten)
- **Canlı Doğrulama Kanıtı:** Playwright ile onay öncesi `0` analitik isteği, onay sonrası `gtm.js`, `g/collect?...&gcs=G111&en=page_view` (Consent Mode v2 aktif) ve `mc.yandex.ru/metrika/tag.js` doğrulaması yapın.

### 5.2 Arama Konsolları ve Bağlantı Haritası
1. **Google Search Console:** HTML meta (`GOOGLE_SITE_VERIFICATION`) + Alan Adı için DNS TXT ile doğrulayın → `sitemap.xml` gönderin → ana sayfa ve kritik kategoriler için URL Denetimi / Dizine eklenmesini isteyin.
2. **GA4 + GTM:** Web veri akışı açın → `purchase`, `begin_checkout`, `add_to_cart`, `contact_whatsapp_click`, `generate_lead` olaylarını **Key Event (Önemli Olay)** yapın → GTM'de `Google Etiketi` + `GA4 Etkinliği` (Ecommerce Data Layer + Custom Event regex tetikleyicisi) yayınlayın → **GA4 ↔ Search Console** bağlayın.
3. **Bing Webmaster Tools & IndexNow:** GSC'den tek tıkla içe aktarın → `/indexnow-key.txt` + `INDEXNOW_API_KEY` ile `api.indexnow.org/indexnow` ve `yandex.com/indexnow` uç noktalarına anlık URL bildirimi yapın (ChatGPT/Copilot Bing indeksinden yararlanır).
4. **Yandex Webmaster & Metrica:** `YANDEX_SITE_VERIFICATION` meta ile doğrulayın, bölgeyi **Türkiye** yapın; Yandex Metrica'da `ecommerce: 'dataLayer'` açıp `NEXT_PUBLIC_YANDEX_METRICA_ID` ile bağlayın.

---

## 6. MERCHANT CENTER, FİYAT KARŞILAŞTIRMA VE GOOGLE ADS

### 6.1 Politika Risk Kontrolü (Kampanya Öncesi Zorunlu!)
- Katalog ve feed metinlerini yasaklı/kısıtlı ürünlere karşı tarayın (casus/gizli kamera, gizli ses kaydedici, izinsiz GPS takip, sinyal kesici/jammer, elektroşok, biber gazı, e-sigara).
- **Kritik E-Ticaret Uyarısı:** Muadil/uyumlu yedek parçalarda *"orijinal uyumlu"* veya *"orijinal kalite"* ifadeleri Google Merchant Center'da **Sahte Ürün / Yanıltıcı Marka askısı** sebebidir → otomatik olarak **"birebir uyumlu / yüksek kalite"** şeklinde temizleyin.

### 6.2 Otomatik XML Feedler (Tek Veri Kaynağından)
- **Google Merchant Center (`/api/feeds/google-merchant.xml`):** `id`, `title`, `description`, `link`, `image_link`, `availability`, `price` (`TRY`), `sale_price`, `brand`, `gtin`/`mpn` (yoksa `identifier_exists=no`), `condition=new`, kategori bazlı `google_product_category`, `shipping` (`TR`, kargo ücreti). Planlı günlük getirme + Ücretsiz Listelemeler + Kargo & 14 gün İade politikası girin; **Merchant ↔ GA4 ↔ Google Ads** bağlayın.
- **Türkiye Fiyat Karşılaştırma Feedleri:** Aynı stoklu ve politika uyumlu ürün listesinden `/api/feeds/cimri.xml`, `/api/feeds/akakce.xml` ve `/api/feeds/epey.xml` üretin (`utm_source` etiketli).

### 6.3 Google Ads Başlangıç Mimarisi (Tüm Taslaklar `PAUSED`)
- Hesabı **"Kampanya olmadan hesap oluştur"** ile açın (`Türkiye`, `TRY`, `İstanbul`); faturalandırmayı hesap sahibi girer.
- **4 Bağlantı:** Merchant Center + GA4 (Key Events içe aktarımı) + Search Console + İşletme Profili.
- **Kampanya 1 — Standard Shopping (`PAUSED`, bütçenin ~%60'ı):** Yeni hesapta arama terimi kontrolü ve negatif kelime temizliği için Performance Max yerine **Standard Shopping (Manuel TBM)** ile başlayın; 30+ gerçek `purchase` dönüşümü birikince PMax'e geçin.
- **Kampanya 2 — Arama Ağı (`PAUSED`, bütçenin ~%40'ı):** Yalnızca Google Arama Ağı (Görüntülü Reklam Ağı ve Arama Ortakları kapalı), tam `[ ]` ve sıralı `" "` eşlemeli yüksek satın alma niyetli kelimeler + marka kelimesi + Türkçe RSA başlık/açıklamaları.
- **Paylaşılan Negatif Liste:** `ücretsiz`, `bedava`, `pdf`, `şema`, `tamir nasıl yapılır`, `ikinci el`, `2. el`, `sahibinden`, `letgo`, `kiralık`, `iş ilanı`, `staj`, `casus`, `gizli`, `jammer`, `apk`.
- **Yeniden Pazarlama:** İlk 30 günde 1.000+ ziyaretçi / 100+ sepet terk kitlesi oluşunca ayrı açılır.

---

## 7. PERFORMANS, DUYARLILIK VE ERİŞİLEBİLİRLİK (CWV & A11Y)

- **Görseller & Fontlar:** React bileşenlerinde **0 ham `<img>`**; tüm görseller `next/image` (WebP/AVIF, doğru `sizes`, LCP hero görselinde `priority`), fontlar `next/font/google` (`display: "swap"`).
- **Erişilebilirlik (WCAG AA — Hedef Lighthouse A11y ≥ 95):**
  - Klavye skip linki (`<a href="#main-content" className="sr-only focus:not-sr-only ...">Ana içeriğe geç</a>`) + `<main id="main-content" tabIndex={-1}>`.
  - Küresel `:focus-visible` odak çerçevesi.
  - Tüm CTA butonları ve metinlerde **≥ 4.5:1 renk kontrastı** (ör. açık turuncu `#f97316` beyaz yazı üstünde 2.8:1'de kalır; `#c2410c` ile 5.18:1 WCAG AA sağlanır; beyaz üstünde `text-slate-400` yerine `text-slate-600`).
  - İkon-only bağlantılarda `aria-label`, metin içi linklerde `underline`, slider/mobil butonlarda en az `24×24px` (tercihen `28–44px`) dokunma alanı.
- **Duyarlılık:** `360 / 390 / 768 / 1024 / 1280 / 1440 / 1920 px` genişliklerinde **0 px yatay taşma**, mobil input'larda iOS zoom önlemek için `16px` font boyutu.
- **Hedef Lighthouse Skorları (`next start`):** Masaüstü Perf **95–100**, A11y **95+**, BP **100**, SEO **100** (`LCP < 1.5s`, `CLS < 0.05`); Mobil Perf **85+**, A11y **95+**, BP **100**, SEO **100**.

---

## 8. GÜVENLİK SERTLEŞTİRMESİ (P0)

- **`next.config.ts` Güvenlik Başlıkları & Ayarları:**
  - `poweredByHeader: false`, `productionBrowserSourceMaps: false`
  - `Content-Security-Policy` (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`, `base-uri 'self'`, yalnızca kullanılan CDN/analitik/ödeme hostlarına izin; `upgrade-insecure-requests` yalnızca HTTPS production'da)
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Oturum Çerezleri:** `HttpOnly: true`, `SameSite: "lax"`, HTTPS ortamda `Secure: true` (`__Secure-` öneki).
- **Çift Katmanlı Sunucu Yetkilendirmesi:** Yalnızca `middleware.ts`'e güvenmeyin; her `/admin` layout'unda, her `/api/admin/*` uç noktasında ve `/hesabim` sayfa bileşeninde doğrudan sunucu tarafı oturum/rol kontrolü ve `redirect` / `403` uygulayın.
- **XSS & `dangerouslySetInnerHTML`:** JSON-LD içinde `<` → `\u003c` kaçışı; zengin ürün/blog HTML'i için `sanitizeHtml()` (script, iframe, object, embed, `on*=` ve `javascript:` temizliği).
- **Rate Limiting:** Tüm kamuya açık yazma/auth uç noktalarına (`/api/auth/*`, `/api/contact`, `/api/newsletter`, `/api/reviews`, `/api/stock-alerts`, `/api/orders`, `/api/coupons/validate`) IP tabanlı kayan pencere hız sınırlayıcı (`HTTP 429` + `Retry-After`) ekleyin.
- **Bağımlılık Güvenliği:** `npm audit --omit=dev` ile 0 kritik zafiyet hedefleyin; kırıcı majör yükseltmeleri (`Next`, `Prisma`, `Zod`) ayrı bakım dalında test ederek yapın.

---

## 9. YAYIN SONRASI HAFTALIK TAKİP (30 / 60 / 90 GÜN)

- **Her Pazartesi (15 dk):** Search Console (gösterim, tık, konum, 404/kapsama), GA4 (`view_item → add_to_cart → begin_checkout → purchase` + WhatsApp/Form dönüşümleri), Merchant Center (onaylanan/reddedilen ürün uyarısı), Google Ads (arama terimleri → negatif liste güncellemesi, CPA/ROAS).
- **Aylık:** Yeni teknik rehber/SSS ekleme, en çok gösterim alan 20 sayfanın başlık/meta TBO optimizasyonu, ChatGPT/Perplexity/Gemini marka alıntı kontrolü.
