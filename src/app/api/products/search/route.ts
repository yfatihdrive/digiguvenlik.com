import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db";
import { normalizeTurkish } from "@/lib/text";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") || "").trim().slice(0, 100);
  const q = normalizeTurkish(raw);
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  const tokens = q.split(" ").filter(Boolean);
  const products = getProducts();
  const matched = products
    .filter((p) => {
      const hay = normalizeTurkish(`${p.name} ${p.category} ${p.sku}`);
      return tokens.every((t) => hay.includes(t));
    })
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
    }));

  return NextResponse.json({ results: matched });
}
