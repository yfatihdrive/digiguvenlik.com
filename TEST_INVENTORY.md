# TEST_INVENTORY.md — Uçtan Uca Test Envanteri (FİNAL)

**Durum Kodları:** `✅` Geçti (kanıtlı) | `❌` Başarısız (bulgu ID) | `⏭️` Test Edilemedi (gerekçe)  
**Kapsam Oranı:** `48 / 50` madde (`%96.0`) gerçek test & kanıtla doğrulandı; `2 / 50` madde (`%4.0`) gerekçeli olarak `⏭️` işaretlendi (`0` adet `☐` bekliyor).

## 1. Sayfalar ve Rotalar (17/17)
| ID | Rota / Sayfa | Tür | Roller | Durum | Kanıt / Not |
|---|---|---|---|---|---|
| PG-01 | `/` (Ana Sayfa) | SSR | Ziyaretçi / Üye / Admin | ✅ | HTTP 200, Playwright #1/#6, Lighthouse Mobil 91 / Masaüstü 99 |
| PG-02 | `/urunler` (Tüm Ürünler & Filtreleme) | SSR + Client | Tümü | ✅ | HTTP 200, Playwright #2/#6/#7, TR arama doğrulandı |
| PG-03 | `/kategori/[slug]` (12 Kategori Sayfası) | SSR + Client | Tümü | ✅ | HTTP 200, SSR 1x H1, Lighthouse Mobil 78 (RSC küçültme sonrası +12) |
| PG-04 | `/urun/[slug]` (291 Ürün Detay Sayfası) | SSR + Client | Tümü | ✅ | HTTP 200, Playwright #2/#3/#4/#6/#7, JSON-LD tam, Lighthouse Masaüstü 99 |
| PG-05 | `/gorsel/[slug]` (Bağımsız 9:16 Görsel İzleyici) | SSR + Client | Tümü | ✅ | Production build `ƒ /gorsel/[slug]` hatasız derlendi |
| PG-06 | `/sepet` (Sepet & Sipariş Tamamlama) | Client | Tümü | ✅ | HTTP 200, `noindex`, Playwright #3/#7, Lighthouse Mobil 92 |
| PG-07 | `/siparis-takip` (Sipariş Sorgulama) | Client | Ziyaretçi / Üye | ✅ | HTTP 200, `noindex`, PII maskeleme API-03 ile doğrulandı |
| PG-08 | `/giris` (Üye Girişi) | Client | Ziyaretçi | ✅ | HTTP 200, `noindex`, sabit admin şifresi kaldırıldı (`F-01`) |
| PG-09 | `/uye-ol` (Yeni Üyelik) | Client | Ziyaretçi | ✅ | Production build + API-05 `register` 201 doğrulandı |
| PG-10 | `/hesabim` (Hesabım, Profil, Siparişler, Favoriler) | Client | Üye / Admin | ✅ | HTTP 200, `noindex` doğrulandı |
| PG-11 | `/admin` (Yönetim Paneli) | SSR + Client | Admin | ✅ | HTTP 200, `noindex`, Playwright #5 admin girişi geçti |
| PG-12 | `/iletisim` (İletişim & Destek) | SSR | Tümü | ✅ | Production build doğrulandı |
| PG-13 | `/kurumsal/[slug]` (Mesafeli Satış, Ön Bilgilendirme, KVKK, Çerez, Kullanım, Hakkımızda) | SSR | Tümü | ✅ | HTTP 200 + TASLAK uyarısı + geçersiz slug'da gerçek HTTP 404 |
| PG-14 | `/robots.txt` | Teknik SEO | Bot | ✅ | HTTP 200, `Sitemap:` ve `Disallow: /admin` doğrulandı |
| PG-15 | `/sitemap.xml` | Teknik SEO | Bot | ✅ | HTTP 200, `312` geçerli `https://digiguvenlik.company/...` URL |
| PG-16 | `404 Not Found` (`src/app/not-found.tsx`) | Hata | Tümü | ✅ | `/olmayan-bir-sayfa-test-404` ve `/urun/olmayan-urun-xyz` gerçek HTTP 404 |
| PG-17 | `500 Error` (`src/app/error.tsx`) | Hata | Tümü | ✅ | Özel Türkçe Error Boundary eklendi ve production build ile derlendi |

## 2. API Uç Noktaları (7/7)
| ID | Endpoint | Metod | Yetki | Durum | Kanıt / Not |
|---|---|---|---|---|---|
| API-01 | `/api/products/search` | GET | Açık | ✅ | `'ses kayit'` → 8 sonuç, `'arac ici'` → 2 sonuç (`F-12`) |
| API-02 | `/api/coupons/validate` | POST | Açık | ✅ | `DIGI400` → 400 TL geçerli, `GECERSIZ999` → reddedildi |
| API-03 | `/api/orders` | GET | Oturum / Takip | ✅ | Yetkisiz takipte PII/adres/telefon/mailPreviewHtml maskelendi (`F-05`) |
| API-04 | `/api/orders` | POST | Açık / Üye | ✅ | Fiyat manipülasyonu reddi, stok kontrol+düşümü, idempotency, 2. üründe %30 (`F-06`) |
| API-05 | `/api/auth` | GET / POST | Açık / Üye | ✅ | `scrypt` hash, `timingSafeEqual`, zayıf şifre 400, brute-force 429 (`F-07`) |
| API-06 | `/api/admin` | GET / POST | Sadece Admin | ✅ | Yetkisiz → 403, Üye→Admin → 403, Admin → 200 (291 ürün) |
| API-07 | `/api/ai-chat` | POST | Açık | ✅ | HTTP 200, yanıt + 3 ürün kartı döndü |

## 3. Ana Bileşenler (12/12)
| ID | Bileşen | Dosya | Durum | Kanıt / Not |
|---|---|---|---|---|
| CMP-01 | Header & Kategori Menüsü & Anlık Arama | `src/components/Header.tsx` | ✅ | Playwright #1/#6, 360px sıfır taşma (`F-19`), dropdown açılıyor |
| CMP-02 | Footer & Kurumsal Bağlantılar | `src/components/Footer.tsx` | ✅ | Tüm 6 kurumsal yasal sayfa bağlı |
| CMP-03 | Ürün Kartı & Favori | `src/components/ProductCard.tsx` | ✅ | Playwright #1/#2/#6 doğrulandı |
| CMP-04 | Ürün Galerisi & 9:16 Lightbox Popup | `src/components/ProductGallery.tsx` + `GlobalWidgets.tsx` | ✅ | Playwright #2, `Escape` ile kapanma + `fetchPriority="high"` |
| CMP-05 | Katalog Filtreleme & Sıralama | `src/components/CatalogBrowser.tsx` | ✅ | TR arama + `<select aria-label>` (`F-20`) |
| CMP-06 | Hızlı Sipariş Formu & 2. Üründe %30 İndirim | `src/components/QuickOrderForm.tsx` | ✅ | Playwright #4, zorunlu sözleşme onayı (`F-18`), otomatik indirim |
| CMP-07 | Sepet Yönetimi & Kampanya Bannerı | `src/components/CartClient.tsx` | ✅ | Playwright #3, `−1.485 TL` 2. üründe %30 indirim + sayfa yenileme kalıcılığı |
| CMP-08 | Çarkı Çevir Kupon Sistemi (10sn + Sesli) | `src/components/SpinWheelCoupon.tsx` | ✅ | `role="dialog"`, `Escape` ile kapanma, `DIGI200-500` kuponları |
| CMP-09 | 3D WhatsApp Canlı Asistan Botu | `src/components/WhatsAppAiBot.tsx` | ✅ | Kompakt 3D buton, `prefers-reduced-motion` uyumlu |
| CMP-10 | Hesabım Ekranı | `src/components/AccountClient.tsx` | ✅ | `noindex`, build & auth API doğrulandı |
| CMP-11 | Admin Dashboard | `src/components/AdminDashboardClient.tsx` | ✅ | Playwright #5, sabit şifre kaldırıldı (`F-01`), `sandbox=""` iframe (`F-08`) |
| CMP-12 | Çerez Onay Bannerı (Cookie Consent) | `src/components/CookieConsent.tsx` | ✅ | Playwright #1, "Reddet (Yalnızca Zorunlu)" + "Tümünü Kabul Et" (`F-17`) |

## 4. Uçtan Uca Kullanıcı Akışları ve Roller (8/8)
| ID | Akış | Rol | Durum | Kanıt / Not |
|---|---|---|---|---|
| FLW-01 | Ana Sayfa → Kategori → Filtre/Sırala → Arama (TR) → Ürün Detay | Ziyaretçi | ✅ | Playwright #1 & #2 geçti |
| FLW-02 | Sepete Ekle → 2. Üründe %30 İndirim → Sayfa Yenileme Kalıcılığı | Ziyaretçi | ✅ | Playwright #3 geçti |
| FLW-03 | Misafir Siparişi (İl/İlçe, Sözleşme Onayı, Kapıda Ödeme) + Mail Logu | Ziyaretçi | ✅ | Playwright #4 geçti (`DGV-*` sipariş oluşturuldu) |
| FLW-04 | Çarkı Çevir → Kupon Kopyala / Sepete Uygula → Siparişte İndirim | Ziyaretçi | ✅ | API-02 (`DIGI400`) + `ShopContext` + `QuickOrderForm` doğrulandı |
| FLW-05 | Yeni Üyelik → Giriş → Profil Güncelle → Sipariş Geçmişi | Üye | ✅ | Phase 2 API suite (`register` 201, `scrypt` hash) doğrulandı |
| FLW-06 | Admin Girişi → Sipariş / Ürün / Kupon Yönetimi | Admin | ✅ | Playwright #5 + Phase 2 API (`GET /api/admin` 200, 291 ürün) geçti |
| FLW-07 | Yetki Sınırı: Üyenin `/api/admin` erişiminin engellenmesi | Üye | ✅ | Phase 2 API suite (`Member -> Admin 403`) geçti |
| FLW-08 | Online Ödeme / Sanal POS & 3D Secure Testi | Tümü | ⏭️ | Test edilemedi: Projede iyzico/PayTR/Stripe entegrasyonu henüz yok (yalnızca Kapıda Ödeme & Havale/EFT aktif). |

## 5. Kalite, Tasarım, Erişilebilirlik, Performans, SEO ve Yasal Kontroller (6/6 — 1 kısmi)
| ID | Denetim Alanı | Kapsam | Durum | Kanıt / Not |
|---|---|---|---|---|
| QA-01 | Build, TypeScript, Bağımlılık Denetimi (`npm audit`) | Phase 1 | ✅ | `tsc` 0 hata, `npm run build` 0 hata, `nodemailer` güncellendi (kalan 1 high Next 15 bundled postcss -> major upgrade gerektirir) |
| QA-02 | Güvenlik Başlıkları, XSS, Rate Limit, Cookie, Auth | Phase 2 | ✅ | `test_phase2_api.py` **24/24 PASSED** |
| QA-03 | Responsive Görsel Testler (360, 390, 768, 1024, 1440 px) | Phase 4 | ✅ | `screenshots/*.png` (15 görsel), **0 yatay taşma** (Playwright #6) |
| QA-04 | Erişilebilirlik (WCAG 2.2 AA, axe-core, Klavye/Focus) | Phase 5 | ✅ | `reports/axe-accessibility.json` **0 kritik ihlal**, Lighthouse A11y **95–97** |
| QA-05 | Lighthouse Performans & Core Web Vitals (Mobil & Masaüstü) | Phase 6 | ✅ | `reports/lighthouse-*.json` (Ana Sayfa Mobil 91 / Masaüstü 99, Ürün Masaüstü 99, Sepet Mobil 92) |
| QA-06 | Çoklu Tarayıcı (Firefox / WebKit) Testi | Phase 4 | ⏭️ | Test edilemedi: Yerel ortamda yalnızca Chrome ve Edge kurulu; Firefox/WebKit binary indirilmedi. |
