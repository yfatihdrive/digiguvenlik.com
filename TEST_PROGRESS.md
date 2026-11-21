# TEST_PROGRESS.md — Denetim İlerleme Takibi

- **Proje:** Digi Güvenlik (`digiguvenlik.com`) E-Ticaret Platformu
- **Dal (Branch):** `qa/full-audit`
- **Son Güncelleme:** 2026-11-22
- **Aktif Aşama:** PHASE 0 Tamamlandı → PHASE 1 Başlıyor

## Aşama Durumları
| Aşama | Açıklama | Durum | Commit |
|---|---|---|---|
| PHASE 0 | Keşif, Mimari Harita ve Envanter (`TEST_INVENTORY.md`) | ✅ Tamamlandı | (hazırlanıyor) |
| PHASE 1 | Build, Statik Analiz, Bağımlılık Denetimi | ☐ Bekliyor | — |
| PHASE 2 | Backend, Veritabanı, Güvenlik, API & Mail Testleri | ☐ Bekliyor | — |
| PHASE 3 | Uçtan Uca E-Ticaret Akışları + Kalıcı Playwright E2E | ☐ Bekliyor | — |
| PHASE 4 | Frontend, Responsive (360–1440px) & Görsel Tasarım | ☐ Bekliyor | — |
| PHASE 5 | Erişilebilirlik (WCAG 2.2 AA & axe-core) | ☐ Bekliyor | — |
| PHASE 6 | Performans & Core Web Vitals (Lighthouse Önce/Sonra) | ☐ Bekliyor | — |
| PHASE 7 | SEO (Teknik, Sayfa İçi, SSR, JSON-LD) | ☐ Bekliyor | — |
| PHASE 8 | İçerik, Dil, Çerez Onayı ve Türkiye Yasal Uyumluluğu | ☐ Bekliyor | — |
| PHASE 9 | Kod Kalitesi, `.env.example`, `README.md`, Mimari | ☐ Bekliyor | — |
| PHASE 10 | Canlıya Geçiş Hazırlık Kontrol Listesi (Deploy Yok) | ☐ Bekliyor | — |

## Teknik Keşif Özeti (PHASE 0)
- **Framework / Yığın:** Next.js 15.2.3 (App Router), React 19, TypeScript 5.8.2, Tailwind CSS v4.0.15, Lucide Icons, Nodemailer 6.10.0
- **Veritabanı:** Dosya tabanlı JSON veritabanı (`data/db.json` — 291 ürün, 12 kategori, 7 kupon, 2 varsayılan kullanıcı, siparişler) + `public/data/turkiye-il-ilce.json`
- **Ödeme Yöntemleri:** Kapıda Nakit, Kapıda Kredi Kartı, Havale/EFT (%10 indirimli). Sanal POS (iyzico/PayTR/Stripe) henüz entegre değil.
- **E-posta:** Nodemailer (SMTP yapılandırılmadığında `data/mail-logs/<orderId>.html` dosyasına güvenli log kaydı alır; gerçek e-posta göndermez).
- **Ortam Değişkenleri (Kodda Tespit Edilen):** `AUTH_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ORDER_NOTIFICATION_EMAIL` (`.env.example` mevcut değil — Phase 9'da eklenecek).
- **Yerel Çalışma Ortamı:** `http://localhost:3030` (HTTP 200 doğrulandı), Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) ve Edge mevcut.
