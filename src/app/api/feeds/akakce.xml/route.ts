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
      const link = `${SITE_CONFIG.url}/urun/${encodeURIComponent(p.slug)}?utm_source=akakce&utm_medium=cpc`;
      const imageLink = getAbsoluteImageUrl(p.image);
      const desc = sanitizeFeedText(p.shortDescription || p.seoDescription || p.name).slice(0, 2000);
      return `  <product>
    <sku>${escapeXml(p.sku || `DIGI-${p.id}`)}</sku>
    <name>${escapeXml(sanitizeFeedText(p.name))}</name>
    <url>${escapeXml(link)}</url>
    <imgUrl>${escapeXml(imageLink)}</imgUrl>
    <description>${escapeXml(desc)}</description>
    <distributor>${escapeXml(SITE_CONFIG.legalName)}</distributor>
    <price>${Number(p.price).toFixed(2)}</price>
    <eftPrice>${Number(Math.round(p.price * 0.9)).toFixed(2)}</eftPrice>
    <currency>TL</currency>
    <quantity>${escapeXml(p.stock)}</quantity>
    <taxIncluded>1</taxIncluded>
    <shipPrice>0.00</shipPrice>
    <deliveryTime>1</deliveryTime>
    <brand>${escapeXml(SITE_CONFIG.name)}</brand>
    <category>${escapeXml(p.category)}</category>
  </product>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<products>
${itemsXml}
</products>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
