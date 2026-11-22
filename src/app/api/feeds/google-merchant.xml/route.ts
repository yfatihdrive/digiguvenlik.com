import { NextRequest, NextResponse } from "next/server";
import { SITE_CONFIG } from "@/config/site";
import {
  escapeXml,
  getAbsoluteImageUrl,
  getGoogleProductCategory,
  getInStockFeedProducts,
  sanitizeFeedText,
} from "@/lib/feed-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const modeParam = req.nextUrl.searchParams.get("mode");
  const mode = modeParam === "safe" ? "merchant-safe" : "organic";
  const products = getInStockFeedProducts();

  const itemsXml = products
    .map((p) => {
      const title = sanitizeFeedText(p.name, mode).slice(0, 150);
      const desc = sanitizeFeedText(
        p.shortDescription || p.seoDescription || p.name,
        mode
      ).slice(0, 4900);
      const link = `${SITE_CONFIG.url}/urun/${encodeURIComponent(p.slug)}?utm_source=google_merchant&utm_medium=cpc`;
      const imageLink = getAbsoluteImageUrl(p.image);
      const additionalImages = (p.images || [])
        .filter((img) => img && img !== p.image)
        .slice(0, 9)
        .map(
          (img) =>
            `      <g:additional_image_link>${escapeXml(getAbsoluteImageUrl(img))}</g:additional_image_link>`
        )
        .join("\n");

      const hasDiscount = p.oldPrice && p.oldPrice > p.price;
      const basePrice = hasDiscount ? p.oldPrice : p.price;
      const salePriceTag = hasDiscount
        ? `\n      <g:sale_price>${Number(p.price).toFixed(2)} TRY</g:sale_price>`
        : "";
      const mpn = p.sku || `DIGI-${p.id}`;
      const gCategory = getGoogleProductCategory(p.categorySlug || "");

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
${additionalImages ? additionalImages + "\n" : ""}      <g:availability>in_stock</g:availability>
      <g:price>${Number(basePrice).toFixed(2)} TRY</g:price>${salePriceTag}
      <g:brand>${escapeXml(SITE_CONFIG.name)}</g:brand>
      <g:mpn>${escapeXml(mpn)}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:condition>new</g:condition>
      <g:google_product_category>${escapeXml(gCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(p.category || "Güvenlik ve Ses Sistemleri")}</g:product_type>
      <g:shipping>
        <g:country>TR</g:country>
        <g:service>Ücretsiz Aynı Gün Kargo</g:service>
        <g:price>0.00 TRY</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)} — Ürün Kataloğu</title>
    <link>${escapeXml(SITE_CONFIG.url)}</link>
    <description>${escapeXml(SITE_CONFIG.slogan)}</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
