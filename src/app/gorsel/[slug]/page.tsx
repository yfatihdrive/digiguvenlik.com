import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/db";
import StandaloneViewerClient from "@/components/StandaloneViewerClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Görsel Bulunamadı" };
  return {
    title: `${product.name} — 9:16 Ürün Görsel Galerisi`,
    description: product.seoDescription,
  };
}

export default async function GorselViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ i?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const initialIndex = Math.max(
    0,
    Math.min(
      (product.images?.length || 1) - 1,
      Number(sp.i) || 0
    )
  );

  return (
    <StandaloneViewerClient
      product={product}
      initialIndex={initialIndex}
    />
  );
}
