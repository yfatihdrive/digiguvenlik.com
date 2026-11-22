import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getProducts } from "@/lib/db";
import { SITE_CONFIG } from "@/config/site";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const key =
      (process.env.INDEXNOW_API_KEY || "").trim() ||
      "digiguvenlik2026indexnowkey902168251057";

    let urlList: string[] = Array.isArray(body?.urls) ? body.urls : [];
    if (urlList.length === 0) {
      const cats = getCategories().map(
        (c) => `${SITE_CONFIG.url}/kategori/${c.slug}`
      );
      const prods = getProducts()
        .filter((p) => p.stock > 0)
        .slice(0, 50)
        .map((p) => `${SITE_CONFIG.url}/urun/${p.slug}`);
      urlList = [
        `${SITE_CONFIG.url}/`,
        `${SITE_CONFIG.url}/urunler`,
        `${SITE_CONFIG.url}/sss`,
        `${SITE_CONFIG.url}/kampanyalar`,
        ...cats,
        ...prods,
      ];
    }

    const payload = {
      host: SITE_CONFIG.domain,
      key,
      keyLocation: `${SITE_CONFIG.url}/indexnow-key.txt`,
      urlList: urlList.slice(0, 1000),
    };

    const endpoints = [
      "https://api.indexnow.org/indexnow",
      "https://yandex.com/indexnow",
    ];

    const results = await Promise.all(
      endpoints.map(async (ep) => {
        try {
          const r = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload),
          });
          return { endpoint: ep, status: r.status };
        } catch (err) {
          return { endpoint: ep, status: 0, error: String(err) };
        }
      })
    );

    return NextResponse.json({
      success: true,
      submittedCount: payload.urlList.length,
      results,
    });
  } catch {
    return NextResponse.json(
      { error: "IndexNow bildirimi başarısız oldu." },
      { status: 500 }
    );
  }
}
