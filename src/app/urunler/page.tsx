import React from "react";
import { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/db";
import CatalogBrowser from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tüm Ürünler — Gizli Kameralar, Ses Kayıt ve Dinleme Cihazları",
  description:
    "Digi Güvenlik gizli kameralar, uzaktan ses dinleme cihazları ve ses kayıt cihazları. 291 farklı model, ücretsiz kargo ve kapıda ödeme kolaylığıyla.",
  alternates: {
    canonical: "https://digiguvenlik.company/urunler",
  },
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

  const catalogJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://digiguvenlik.company/" },
          { "@type": "ListItem", position: 2, name: "Tüm Ürünler", item: "https://digiguvenlik.company/urunler" },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Tüm Ürünler — Gizli Kameralar, Ses Kayıt ve Dinleme Cihazları",
        url: "https://digiguvenlik.company/urunler",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: Math.min(20, products.length),
          itemListElement: products.slice(0, 20).map((p, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `https://digiguvenlik.company/urun/${p.slug}`,
            name: p.name,
          })),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd).replace(/</g, "\\u003c") }}
      />
      <CatalogBrowser
      products={products}
      categories={categories}
      activeCategorySlug="all"
      initialQuery={sp.q || ""}
      initialFilter={sp.filter || ""}
      pageTitle="Tüm Ürünler"
      pageDescription="İhtiyacınız olan modeli seçin; sepete ekleyin veya Hızlı Sipariş formu ile kapıda ödemeli olarak anında sipariş oluşturun."
      />
    </>
  );
}
