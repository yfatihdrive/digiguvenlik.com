import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/config/site";
import {
  escapeXml,
  getAbsoluteImageUrl,
  getInStockFeedProducts,
  sanitizeFeedText,
} from "@/lib/feed-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = getInStockFeedProducts();

  const itemsXml = products
    .map((p) => {
      const link = `${SITE_CONFIG.url}/urun/${encodeURIComponent(p.slug)}?utm_source=cimri&utm_medium=cpc`;
      const imageLink = getAbsoluteImageUrl(p.image);
      const desc = sanitizeFeedText(p.shortDescription || p.seoDescription || p.name).slice(0, 2000);
      return `  <MerchantItem>
    <merchantItemId>${escapeXml(p.id)}</merchantItemId>
    <merchantItemCategoryId>${escapeXml(p.categorySlug)}</merchantItemCategoryId>
    <merchantItemCategoryName>${escapeXml(p.category)}</merchantItemCategoryName>
    <brand>${escapeXml(SITE_CONFIG.name)}</brand>
    <model>${escapeXml(p.sku || `DIGI-${p.id}`)}</model>
    <itemTitle>${escapeXml(sanitizeFeedText(p.name))}</itemTitle>
    <description>${escapeXml(desc)}</description>
    <itemUrl>${escapeXml(link)}</itemUrl>
    <imageUrl>${escapeXml(imageLink)}</imageUrl>
    <priceEft>${Number(Math.round(p.price * 0.9)).toFixed(2)}</priceEft>
    <pricePlusTax>${Number(p.price).toFixed(2)}</pricePlusTax>
    <currency>TRY</currency>
    <stockStatus>${escapeXml(p.stock)}</stockStatus>
    <shippingFee>0.00</shippingFee>
    <shippingDay>1</shippingDay>
    <warrantyPeriod>24</warrantyPeriod>
  </MerchantItem>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<MerchantItems xmlns="http://www.cimri.com/schema/merchant/upload">
${itemsXml}
</MerchantItems>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
