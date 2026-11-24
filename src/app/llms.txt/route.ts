import { NextResponse } from "next/server";
import { getCategories, getProducts } from "@/lib/db";
import { SITE_CONFIG } from "@/config/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = getCategories();
  const products = getProducts();
  const inStockCount = products.filter((p) => p.stock > 0).length;

  const catLines = categories
    .filter((c) => c.count > 0)
    .map((c) => `- ${c.name} (${c.count} ürün): ${SITE_CONFIG.url}/kategori/${c.slug}`)
    .join("\n");

  const topProducts = products
    .filter((p) => p.isBestseller && p.stock > 0)
    .slice(0, 8)
    .map(
      (p) =>
        `- ${p.name} (${p.price} TL): ${SITE_CONFIG.url}/urun/${p.slug}`
    )
    .join("\n");

  const body = `# ${SITE_CONFIG.name} (${SITE_CONFIG.domain})
> ${SITE_CONFIG.slogan}

## Marka Özeti ve Resmi İletişim (NAP)
- Marka: ${SITE_CONFIG.name}
- Ticaret Unvanı: ${SITE_CONFIG.legalName}
- Web Sitesi: ${SITE_CONFIG.url}
- Adres: ${SITE_CONFIG.address.full}
- Telefon / Destek: ${SITE_CONFIG.phone}
- WhatsApp Destek: ${SITE_CONFIG.whatsappDisplay}
- E-posta: ${SITE_CONFIG.email}
- Çalışma Saatleri: ${SITE_CONFIG.workingHours}

## Kargo, Ödeme, Garanti ve İade Politikaları
- Kargo: Türkiye'nin 81 iline ücretsiz kargo; saat ${SITE_CONFIG.shipping.sameDayCutoff}'ya kadar verilen siparişlerde aynı gün kargo.
- Paketleme: %100 gizli paketleme (kargo üzerinde ürün içeriği yazmaz).
- Ödeme Seçenekleri: Kapıda Nakit Ödeme, Kapıda Kredi Kartı, Havale/EFT (%10 anında indirim).
- Garanti: Tüm ürünlerde ${SITE_CONFIG.shipping.warrantyMonths} ay (2 yıl) resmi garanti ve fatura.
- İade Hakkı: Teslimattan itibaren ${SITE_CONFIG.shipping.returnDays} gün içinde yasal cayma ve iade hakkı.
- Aktif Kampanyalar: 2. üründe %20 otomatik indirim, Çarkı Çevir ile 200–500 TL indirim kuponu.

## Ana Ürün Kategorileri (Toplam ${inStockCount} Stoklu Ürün)
${catLines}

## GPS Takip Uygulama Alanları (9 Sektör ve Kullanım Senaryosu)
- Binek Otomobil GPS Takibi: Gerçek zamanlı konum izleme, aşırı hız alarmı, kontak (ACC) algılama ve uzaktan yakıt/elektrik kesme ile araç güvenliği.
- Motosiklet GPS Takibi: Kompakt ve su geçirmez gövdeli kablolu GPS cihazları ile titreşim alarmı ve akü koruma (9–90V DC geniş voltaj).
- Bisiklet ve E-Bike GPS Takibi: Kolay gizlenebilir mini kablolu ve mıknatıslı konum belirleyiciler ile şehir içi çalınmaya karşı takip.
- Kişisel ve Personel Güvenliği (Çocuk, Yaşlı, Saha Ekibi): Tek tuş SOS acil çağrı butonu, çift yönlü sesli görüşme, TTS sesli anons ve WiFi destekli iç/dış mekan konumu.
- Evcil Hayvan (Kedi ve Köpek) GPS Takibi: Su, toz, düşme ve ısırmaya dayanıklı hafif akıllı tasma modülleri ile elektronik güvenli alan (Geofence) bildirimleri.
- Büyükbaş ve Küçükbaş Hayvan (Mera) Takibi: 12.000 mAh batarya ve entegre güneş panelli IP68 su geçirmez tasma cihazları ile kesintisiz sürü yönetimi.
- İş Makinesi ve Sabit Kıymet Koruması: 20.000 mAh / 10.000 mAh dev bataryalı veya 3 yıl bekleme süreli güçlü mıknatıslı kablosuz takip sistemleri.
- Lojistik ve Kargo Filo Takibi: Konteyner, tır, dorse ve soğuk zincir araçlarında 6 aylık geçmiş rota kaydı ve sökme (demontaj) alarmı.
- Tekne ve Deniz Aracı Güvenliği: Suya ve zorlu hava koşullarına dayanıklı dış/iç mekan marin GPS konum izleme.

## B2B Kurumsal Filo Yönetimi Çözümleri
- Canlı Uyarılar ve Alarmlar: Elektronik çit (bölge giriş/çıkış), aşırı hız, darbe/titreşim, cihaz sökme/kurcalama, tek tuş SOS ve harici akü voltaj düşüş bildirimleri.
- Çoklu Platform Yönetimi: iOS, Android mobil uygulama ve Web yönetim paneli üzerinden tek ekranda yüzlerce aracı canlı izleme, uzaktan açma/kapama ve motor kilitleme.
- Sürüş Günlüğü ve Veri Saklama: Son 6 aya ait kilometre, duraklama, hız ve güzergâh kayıtlarını dışa aktarma desteği.
- Kurumsal Toptan ve Filo Teklifleri: Filo ölçeğine özel kurulum ve toplu alım danışmanlığı için ${SITE_CONFIG.phone} veya WhatsApp ${SITE_CONFIG.whatsappDisplay}.

## Öne Çıkan Çok Satan Ürünler
${topProducts}

## Önemli Rehber ve Kurumsal Sayfalar
- Tüm Ürünler: ${SITE_CONFIG.url}/urunler
- Sıkça Sorulan Sorular (SSS): ${SITE_CONFIG.url}/sss
- Aktif Kampanyalar: ${SITE_CONFIG.url}/kampanyalar
- İletişim: ${SITE_CONFIG.url}/iletisim
- Hakkımızda: ${SITE_CONFIG.url}/kurumsal/hakkimizda
- Mesafeli Satış Sözleşmesi: ${SITE_CONFIG.url}/kurumsal/mesafeli-satis
- KVKK Aydınlatma Metni: ${SITE_CONFIG.url}/kurumsal/kvkk-veri-koruma

## Site Haritası ve Ürün Feedleri
- XML Sitemap: ${SITE_CONFIG.url}/sitemap.xml
- Robots: ${SITE_CONFIG.url}/robots.txt
- Google Merchant Feed: ${SITE_CONFIG.url}/api/feeds/google-merchant.xml
- Cimri Feed: ${SITE_CONFIG.url}/api/feeds/cimri.xml
- Akakçe Feed: ${SITE_CONFIG.url}/api/feeds/akakce.xml
- Epey Feed: ${SITE_CONFIG.url}/api/feeds/epey.xml
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
