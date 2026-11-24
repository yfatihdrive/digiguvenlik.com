import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/db";
import CatalogBrowser from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    return { title: "Kategori Bulunamadı" };
  }
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: {
      canonical: `https://digiguvenlik.company/kategori/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

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

  const childSlugs = new Set(
    categories.filter((c) => c.parentSlug === slug).map((c) => c.slug)
  );
  const categoryProducts = products
    .filter(
      (p) =>
        p.categorySlug === slug ||
        childSlugs.has(p.categorySlug) ||
        (slug === "gizli-kameralar" && p.categorySlug.includes("kamera"))
    )
    .slice(0, 20);

  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://digiguvenlik.company/" },
          { "@type": "ListItem", position: 2, name: category.name, item: `https://digiguvenlik.company/kategori/${category.slug}` },
        ],
      },
      {
        "@type": "CollectionPage",
        name: category.name,
        description: category.seoDescription || category.description,
        url: `https://digiguvenlik.company/kategori/${category.slug}`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: categoryProducts.length,
          itemListElement: categoryProducts.map((p, idx) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd).replace(/</g, "\\u003c") }}
      />
      <CatalogBrowser
      products={products}
      categories={categories}
      activeCategorySlug={slug}
      pageTitle={category.name}
      pageDescription={category.description}
      />
    </>
  );
}
