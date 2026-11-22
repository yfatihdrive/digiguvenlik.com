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
      const link = `${SITE_CONFIG.url}/urun/${encodeURIComponent(p.slug)}?utm_source=epey&utm_medium=cpc`;
      const imageLink = getAbsoluteImageUrl(p.image);
      return `  <urun>
    <id>${escapeXml(p.id)}</id>
    <baslik>${escapeXml(sanitizeFeedText(p.name))}</baslik>
    <marka>${escapeXml(SITE_CONFIG.name)}</marka>
    <kategori>${escapeXml(p.category)}</kategori>
    <fiyat>${Number(p.price).toFixed(2)}</fiyat>
    <paraBirimi>TRY</paraBirimi>
    <stok>${escapeXml(p.stock)}</stok>
    <kargoUcreti>0.00</kargoUcreti>
    <url>${escapeXml(link)}</url>
    <resim>${escapeXml(imageLink)}</resim>
  </urun>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urunler>
${itemsXml}
</urunler>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
