# NEEDED_FROM_ME.md — İşletme Sahibinden Gereken Bilgiler ve Kararlar

Bu liste, geliştirme ortamında uydurulmaması gereken (yasal onay, gerçek firma bilgileri, canlı ortam anahtarları ve ödeme altyapısı gibi) ve sizin tarafınızdan sağlanması/onaylanması gereken maddeleri içerir.

## 1. Yasal Bilgiler & Şirket Kimliği (`MISSING DATA`)
- [ ] **Vergi Dairesi ve Vergi Kimlik Numarası (VKN)** (Kurumsal sayfalarda ve Mesafeli Satış Sözleşmesinde zorunlu)
- [ ] **MERSİS Numarası ve Ticaret Sicil Numarası**
- [ ] **KEP (Kayıtlı Elektronik Posta) Adresi**
- [ ] **Resmi Ticari Ünvan Uyumu:** Veritabanında şirket adı `DİGİ GÜVENLİK TEKNOLOJİ A.Ş.`, banka hesap alıcısı ise `LIFE TEKNOLOJİ TURİZM İNŞAAT REKLAM DIŞ TİC LTD ŞTİ.` olarak görünüyor — fatura ve sözleşmelerde hangisinin resmi ünvan olacağı netleştirilmelidir.
- [ ] **Yasal Metin Avukat Onayı:** KVKK Aydınlatma Metni, Gizlilik Politikası, Çerez Politikası, Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu, İade ve Cayma Hakkı metinleri ("TASLAK — Hukuki inceleme gerektirir" olarak işaretlenecektir).
- [ ] **ETBİS Kaydı:** E-ticaret faaliyeti başlamadan önce Elektronik Ticaret Bilgi Sistemi (ETBİS) kaydı ve vergi/muhasebe bildirimleri için mali müşavir / avukat onayı.

## 2. Canlı Ortam Anahtarları ve Entegrasyonlar
- [ ] **Güçlü `AUTH_SECRET`:** Canlı sunucuda en az 32 bayt rastgele kriptografik anahtar tanımlanmalıdır (`openssl rand -hex 32`).
- [ ] **SMTP E-posta Bilgileri:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ORDER_NOTIFICATION_EMAIL` (ve alan adı için `SPF`, `DKIM`, `DMARC` DNS kayıtları).
- [ ] **Online Ödeme Sağlayıcısı (İsteniyorsa):** Şu an sitede yalnızca Kapıda Nakit, Kapıda Kredi Kartı ve Havale/EFT aktif. Online kredi kartı ödemesi (iyzico / PayTR / Param) isteniyorsa sandbox ve canlı API anahtarları + 3D Secure test kartı onayı gereklidir.
- [ ] **Analitik ve Ölçüm Kimlikleri:** Google Search Console doğrulama kodu, GA4 Measurement ID (`NEXT_PUBLIC_GA_ID`), Google Tag Manager (`NEXT_PUBLIC_GTM_ID`) — yalnızca çerez onayı verildikten sonra yüklenecek şekilde bağlanabilir.

## 3. Ürün ve İçerik Doğrulamaları (`MISSING DATA`)
- [ ] **Gerçek Ürün Ölçüleri / Ağırlık / GTIN-MPN Barkodları:** JSON-LD `Product` şemasında `gtin`/`mpn` alanları mevcut veride yok; gerçek barkod/model kodları sağlanırsa zengin sonuç performansı artar.
- [ ] **Gerçek Müşteri Yorumları:** Veritabanındaki yorumlar başlangıç şablon verisidir; canlıya alınırken gerçek müşteri değerlendirmeleriyle değiştirilmesi önerilir (Google `AggregateRating` politikası gereği).
- [ ] **Admin & Demo Hesap Şifreleri:** Canlıya çıkmadan önce varsayılan `admin@digiguvenlik.company` (`admin123`) şifresi mutlaka güçlü bir şifreyle değiştirilmeli ve demo `musteri@digiguvenlik.company` hesabı kaldırılmalıdır.
