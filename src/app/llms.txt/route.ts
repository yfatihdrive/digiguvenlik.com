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
- Aktif Kampanyalar: 2. üründe %30 otomatik indirim, Çarkı Çevir ile 200–500 TL indirim kuponu.

## Ana Ürün Kategorileri (Toplam ${inStockCount} Stoklu Ürün)
${catLines}

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
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
