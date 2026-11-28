"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Product } from "@/lib/types";
import { useShop } from "@/context/ShopContext";

export default function BlogProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useShop();

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  return (
    <div className="my-6 flex flex-col gap-4 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
      <Link
        href={`/urun/${product.slug}`}
        className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-2 sm:h-32 sm:w-32"
      >
        <img
          src={product.image}
          alt={product.name}
          title={product.name}
          width={128}
          height={128}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </Link>

      <div className="flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-extrabold text-[#FF6000] uppercase">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)} ({product.reviewCount} Değerlendirme)
          </span>
        </div>

        <Link
          href={`/urun/${product.slug}`}
          className="block text-[17px] font-extrabold text-[#212121] hover:text-[#FF6000]"
        >
          {product.name}
        </Link>

        <p className="line-clamp-2 text-[13px] text-[#555555]">{product.shortDescription}</p>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px] font-semibold text-emerald-700">
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" /> Ücretsiz Gizli Kargo
          </span>
          <span className="inline-flex items-center gap-1 text-[#FF6000]">
            <ShieldCheck className="h-3.5 w-3.5" /> Kapıda Ödeme &amp; 2 Yıl Garanti
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch justify-between gap-2 border-t border-orange-100 pt-3 sm:w-48 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
        <div>
          {product.oldPrice > product.price && (
            <span className="text-[13px] text-gray-400 line-through">
              {formatTL(product.oldPrice)} TL
            </span>
          )}
          <div className="text-[22px] font-black text-[#FF6000]">
            {formatTL(product.price)} TL
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            addToCart(product, 1);
            router.push("/sepet");
          }}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#FF6000] px-3.5 py-2.5 text-[14px] font-extrabold text-white shadow-sm transition hover:bg-[#e55500]"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Hemen Satın Al</span>
        </button>

        <Link
          href={`/urun/${product.slug}`}
          className="flex items-center justify-center gap-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-[13px] font-bold text-[#212121] transition hover:border-[#FF6000] hover:text-[#FF6000]"
        >
          <span>Ürünü İncele</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
