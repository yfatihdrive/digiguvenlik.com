import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  const products = getProducts();
  const matched = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
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
