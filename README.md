# Digi Güvenlik (`digiguvenlik.com`) E-Ticaret Platformu

Next.js 15 (App Router), React 19, TypeScript ve Tailwind CSS v4 ile geliştirilmiş, 291 ürünlü, kapıda ödeme & havale/EFT destekli, WhatsApp AI Asistanlı, Çarkı Çevir kupon sistemli ve 2. üründe %30 indirim kampanyalı e-ticaret platformudur.

## Kurulum ve Çalıştırma

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Ortam değişkenlerini hazırlayın
cp .env.example .env.local

# 3. Geliştirme sunucusunu başlatın
npm run dev

# 4. Production build ve başlatma
npm run build
npm run start
```

## Testler ve Doğrulama

```bash
# TypeScript tip kontrolü
npx tsc --noEmit

# Uçtan uca Playwright E2E, Responsive ve Axe-Core erişilebilirlik testleri
# (Yerel sunucunun http://localhost:3030 üzerinde çalıştığından emin olun)
npx playwright test
```

## Proje Yapısı
- `src/app/` — App Router sayfaları, SEO (`sitemap.ts`, `robots.ts`), hata sınırları (`not-found.tsx`, `error.tsx`) ve API uç noktaları (`api/*`)
- `src/components/` — Header, Footer, Ürün Galerisi (9:16 Lightbox), Hızlı Sipariş Formu, Sepet, Çarkı Çevir, WhatsApp AI Bot, Çerez Onayı, Admin Paneli
- `src/lib/` — Veritabanı (`db.ts`), Kimlik Doğrulama (`auth.ts`), E-posta (`mailer.ts`), Kampanya Hesaplayıcı (`promo.ts`), Türkçe Arama & XSS Yardımcıları (`text.ts`)
- `data/db.json` — Ürünler, kategoriler, kuponlar, kullanıcılar ve siparişler
- `tests/e2e/` — Kalıcı Playwright uçtan uca testleri
- `TEST_REPORT.md`, `TEST_INVENTORY.md`, `TEST_PROGRESS.md`, `NEEDED_FROM_ME.md` — Uçtan uca denetim raporları
