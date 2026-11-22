import React from "react";
import { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/db";
import CatalogBrowser from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tüm Ürünler — Gizli Kameralar, Ses Kayıt ve Dinleme Cihazları",
  description:
    "Digi Güvenlik gizli kameralar, uzaktan ses dinleme cihazları ve ses kayıt cihazları. 291 farklı model, ücretsiz kargo ve kapıda ödeme kolaylığıyla.",
};

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const products = getProducts().map((p) => ({
    ...p,
    seoSections: [],
    faqs: [],
    reviews: [],
    specs: [],
    highlights: [],
    images: p.images?.slice(0, 1) || [p.image],
    imageAlts: p.imageAlts?.slice(0, 1) || [p.name],
  })); // slimProducts for fast RSC hydration
  const categories = getCategories();

  return (
    <CatalogBrowser
      products={products}
      categories={categories}
      activeCategorySlug="all"
      initialQuery={sp.q || ""}
      initialFilter={sp.filter || ""}
      pageTitle="Tüm Ürünler"
      pageDescription="İhtiyacınız olan modeli seçin; sepete ekleyin veya Hızlı Sipariş formu ile kapıda ödemeli olarak anında sipariş oluşturun."
    />
  );
}
