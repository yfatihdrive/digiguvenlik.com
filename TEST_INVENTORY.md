# TEST_INVENTORY.md — Uçtan Uca Test Envanteri

**Durum Kodları:** `☐` Bekliyor | `✅` Geçti (kanıtlı) | `❌` Başarısız (bulgu ID) | `⏭️` Test Edilemedi (gerekçe)

## 1. Sayfalar ve Rotalar
| ID | Rota / Sayfa | Tür | Roller | Durum | Kanıt / Not |
|---|---|---|---|---|---|
| PG-01 | `/` (Ana Sayfa) | SSR | Ziyaretçi / Üye / Admin | ☐ | |
| PG-02 | `/urunler` (Tüm Ürünler & Filtreleme) | SSR + Client | Tümü | ☐ | |
| PG-03 | `/kategori/[slug]` (12 Kategori Sayfası) | SSR + Client | Tümü | ☐ | |
| PG-04 | `/urun/[slug]` (291 Ürün Detay Sayfası) | SSR + Client | Tümü | ☐ | |
| PG-05 | `/gorsel/[slug]` (Bağımsız 9:16 Görsel İzleyici) | SSR + Client | Tümü | ☐ | |
| PG-06 | `/sepet` (Sepet & Sipariş Tamamlama) | Client | Tümü | ☐ | |
| PG-07 | `/siparis-takip` (Sipariş Sorgulama) | Client | Ziyaretçi / Üye | ☐ | |
| PG-08 | `/giris` (Üye Girişi) | Client | Ziyaretçi | ☐ | |
| PG-09 | `/uye-ol` (Yeni Üyelik) | Client | Ziyaretçi | ☐ | |
| PG-10 | `/hesabim` (Hesabım, Profil, Siparişler, Favoriler) | Client | Üye / Admin | ☐ | |
| PG-11 | `/admin` (Yönetim Paneli) | SSR + Client | Admin | ☐ | |
| PG-12 | `/iletisim` (İletişim & Destek) | SSR | Tümü | ☐ | |
| PG-13 | `/kurumsal/[slug]` (Mesafeli Satış, KVKK, Kullanım Şartları) | SSR | Tümü | ☐ | |
| PG-14 | `/robots.txt` | Teknik SEO | Bot | ☐ | |
| PG-15 | `/sitemap.xml` | Teknik SEO | Bot | ☐ | |
| PG-16 | `404 Not Found` (Özel Hata Sayfası) | Hata | Tümü | ☐ | |
| PG-17 | `500 Error` (Özel Sunucu Hatası Sayfası) | Hata | Tümü | ☐ | |

## 2. API Uç Noktaları
| ID | Endpoint | Metod | Yetki | Durum | Kanıt / Not |
|---|---|---|---|---|---|
| API-01 | `/api/products/search` | GET | Açık | ☐ | Türkçe karakter toleransı dahil |
| API-02 | `/api/coupons/validate` | POST | Açık | ☐ | Kupon doğrulama & min. tutar |
| API-03 | `/api/orders` | GET | Oturum / Takip | ☐ | IDOR & PII sızıntı testi |
| API-04 | `/api/orders` | POST | Açık / Üye | ☐ | Fiyat manipülasyonu, stok, idempotency |
| API-05 | `/api/auth` | GET / POST | Açık / Üye | ☐ | Login, Register, Logout, Profile, Rate Limit |
| API-06 | `/api/admin` | GET / POST | Sadece Admin | ☐ | Yetkisiz erişim (401/403), ürün/sipariş/kupon/ayar CRUD |
| API-07 | `/api/ai-chat` | POST | Açık | ☐ | WhatsApp AI ürün arama & XSS/girdi testi |

## 3. Ana Bileşenler
| ID | Bileşen | Dosya | Durum | Kanıt / Not |
|---|---|---|---|---|
| CMP-01 | Header & Kategori Menüsü & Anlık Arama | `src/components/Header.tsx` | ☐ | |
| CMP-02 | Footer & Kurumsal Bağlantılar | `src/components/Footer.tsx` | ☐ | |
| CMP-03 | Ürün Kartı & Favori | `src/components/ProductCard.tsx` | ☐ | |
| CMP-04 | Ürün Galerisi & 9:16 Lightbox Popup | `src/components/ProductGallery.tsx` + `GlobalWidgets.tsx` | ☐ | |
| CMP-05 | Katalog Filtreleme & Sıralama | `src/components/CatalogBrowser.tsx` | ☐ | |
| CMP-06 | Hızlı Sipariş Formu & 2. Üründe %30 İndirim | `src/components/QuickOrderForm.tsx` | ☐ | |
| CMP-07 | Sepet Yönetimi & Kampanya Bannerı | `src/components/CartClient.tsx` | ☐ | |
| CMP-08 | Çarkı Çevir Kupon Sistemi (10sn + Sesli) | `src/components/SpinWheelCoupon.tsx` | ☐ | |
| CMP-09 | 3D WhatsApp Canlı Asistan Botu | `src/components/WhatsAppAiBot.tsx` | ☐ | |
| CMP-10 | Hesabım Ekranı | `src/components/AccountClient.tsx` | ☐ | |
| CMP-11 | Admin Dashboard | `src/components/AdminDashboardClient.tsx` | ☐ | |
| CMP-12 | Çerez Onay Bannerı (Cookie Consent) | (Kontrol / Eklenecek) | ☐ | |

## 4. Uçtan Uca Kullanıcı Akışları ve Roller
| ID | Akış | Rol | Durum | Kanıt / Not |
|---|---|---|---|---|
| FLW-01 | Ana Sayfa → Kategori → Filtre/Sırala → Arama (TR karakter) → Ürün Detay | Ziyaretçi | ☐ | |
| FLW-02 | Sepete Ekle → Adet Artır (2. Üründe %30 İndirim) → Sayfa Yenileme Kalıcılığı | Ziyaretçi | ☐ | |
| FLW-03 | Misafir Siparişi (İl/İlçe, Telefon, Sözleşme Onayı, Kapıda Ödeme / Havale) + Mail Logu | Ziyaretçi | ☐ | |
| FLW-04 | Çarkı Çevir → Kupon Kodu Kopyala / Sepete Uygula → Siparişte İndirim | Ziyaretçi | ☐ | |
| FLW-05 | Yeni Üyelik → Çıkış → Giriş → Profil Güncelle → Sipariş Geçmişi & Favoriler | Üye | ☐ | |
| FLW-06 | Admin Girişi → Ürün Ekle/Düzenle/Sil → Sipariş Durum Güncelle → Kupon Yönet | Admin | ☐ | |
| FLW-07 | Yetki Sınırı: Üyenin `/api/admin` ve `/admin` erişiminin engellenmesi | Üye | ☐ | |
| FLW-08 | Online Ödeme / Sanal POS & 3D Secure Testi | Tümü | ☐ | |

## 5. Kalite, Tasarım, Erişilebilirlik, Performans, SEO ve Yasal Kontroller
| ID | Denetim Alanı | Kapsam | Durum | Kanıt / Not |
|---|---|---|---|---|
| QA-01 | Build, TypeScript, ESLint, `npm audit` | Phase 1 | ☐ | |
| QA-02 | Güvenlik Başlıkları, XSS, Rate Limit, Cookie, Auth | Phase 2 | ☐ | |
| QA-03 | Responsive Görsel Testler (360, 390, 768, 1024, 1440 px) | Phase 4 | ☐ | |
| QA-04 | Erişilebilirlik (WCAG 2.2 AA, axe-core, Klavye/Focus) | Phase 5 | ☐ | |
| QA-05 | Lighthouse Performans & Core Web Vitals (Mobil & Masaüstü) | Phase 6 | ☐ | |
| QA-06 | Teknik SEO, SSR HTML, Canonical, `noindex`, JSON-LD | Phase 7 | ☐ | |
| QA-07 | Türkçe İmla, Para/Tarih Formatı, KVKK & Yasal Sayfalar | Phase 8 | ☐ | |
| QA-08 | Kod Kalitesi, `.env.example`, `README.md`, CI Betiği | Phase 9 | ☐ | |
| QA-09 | Canlıya Geçiş Kontrol Listesi | Phase 10 | ☐ | |
