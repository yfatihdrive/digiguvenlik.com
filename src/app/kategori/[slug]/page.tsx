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

  return (
    <CatalogBrowser
      products={products}
      categories={categories}
      activeCategorySlug={slug}
      pageTitle={category.name}
      pageDescription={category.description}
    />
  );
}
