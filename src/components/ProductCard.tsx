"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Zap,
  Star,
  Heart,
  Truck,
  Flame,
} from "lucide-react";
import { Product } from "@/lib/types";
import { useShop } from "@/context/ShopContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, openQuickOrder, favorites, toggleFavorite } = useShop();
  const isFav = favorites.includes(product.id);

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-[#E5E5E5] bg-white transition-all duration-200 hover:border-[#FF6000] hover:shadow-md">
      {/* Top Badges & Favorite */}
      <div className="relative">
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1 rounded bg-[#FF6000] px-2 py-0.5 text-[13px] font-bold tracking-normal text-white uppercase shadow-2xs">
              <Flame className="h-3 w-3 fill-white" /> En Çok Satan
            </span>
          )}
          <span className="inline-flex items-center rounded bg-[#FA0000] px-2 py-0.5 text-[13px] font-bold text-white shadow-2xs">
            %{product.discountPercent} İndirim
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          aria-label="Favorilere ekle"
          className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white/95 shadow-2xs transition ${
            isFav
              ? "border-rose-200 text-rose-600"
              : "border-gray-200 text-[#9B9B9B] hover:text-[#FF6000]"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-rose-600" : ""}`} />
        </button>

        {/* Product Image Container: Click navigates directly to the Product Detail Page */}
        <Link
          href={`/urun/${product.slug}`}
          className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden bg-white"
        >
          <img
            src={product.image}
            alt={product.imageAlts?.[0] || `${product.name} — Orijinal Ürün Görseli`}
            title={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Product Info Body (Hepsiburada exact typography) */}
      <div className="flex flex-1 flex-col justify-between p-3 pt-1.5">
        <div>
          <Link
            href={`/kategori/${product.categorySlug}`}
            className="text-[14px] font-semibold text-[#7B7B7B] hover:text-[#FF6000]"
          >
            {product.category}
          </Link>

          <Link href={`/urun/${product.slug}`} className="mt-0.5 block">
            <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-medium leading-[22px] text-[#484848] group-hover:text-[#212121]">
              <strong className="font-semibold text-[#212121]">Digi Güvenlik</strong>{" "}
              {product.name}
            </h3>
          </Link>

          {/* Rating Row (Hepsiburada style) */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center text-[#F59F28]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-[#F59F28] text-[#F59F28]"
                />
              ))}
            </div>
            <span className="text-[14px] font-semibold text-[#484848]">
              {product.rating}
            </span>
            <span className="text-[14px] font-normal text-[#9B9B9B]">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Price Box (Hepsiburada exact price typography) */}
        <div className="mt-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-normal text-[#9B9B9B] line-through">
                {formatTL(product.oldPrice)} TL
              </span>
              <span className="text-[14px] font-bold text-[#FA0000]">
                %{product.discountPercent}
              </span>
            </div>
            <div className="mt-0.5 text-[20px] leading-[26px] font-bold tracking-[-0.02em] text-[#212121]">
              {formatTL(product.price)}{" "}
              <span className="text-[16px] font-bold text-[#212121]">TL</span>
            </div>
          </div>

          {/* Free Shipping Pill */}
          <div className="mt-2 flex items-center gap-1 rounded bg-[#EBF7E5] px-2 py-1 text-[13px] font-semibold text-[#2E7D32]">
            <Truck className="h-3 w-3 shrink-0 text-[#2E7D32]" />
            <span className="truncate">Ücretsiz Kargo • Kapıda Ödeme</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => openQuickOrder(product)}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#2E7D32] px-2 py-2 text-[14px] font-bold text-white transition hover:bg-[#1b5e20]"
            >
              <Zap className="h-3 w-3 fill-white" />
              <span>Hızlı Sipariş</span>
            </button>
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#FF6000] px-2 py-2 text-[14px] font-bold text-white transition hover:bg-[#e55500]"
            >
              <ShoppingCart className="h-3 w-3" />
              <span>Sepete Ekle</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
