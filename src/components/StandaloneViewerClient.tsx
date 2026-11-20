"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { Product } from "@/lib/types";
import { useShop } from "@/context/ShopContext";

export default function StandaloneViewerClient({
  product,
  initialIndex = 0,
}: {
  product: Product;
  initialIndex?: number;
}) {
  const { addToCart, openQuickOrder } = useShop();
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length]);

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
      Math.round(n)
    );

  return (
    <div className="min-h-[85vh] bg-[#141720] px-3 py-5 text-white sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
        {/* Top Action Bar */}
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-xs">
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-bold text-white sm:text-[18px]">
              {product.name}
            </h1>
            <p className="text-[13px] text-gray-300">
              Görsel {index + 1} / {images.length} • Görsele tıklayarak diğer fotoğraflara geçebilirsiniz
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openQuickOrder(product)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#2E7D32] px-3.5 py-2 text-[14px] font-bold text-white hover:bg-[#1b5e20]"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>Hızlı Sipariş ({formatTL(product.price)} TL)</span>
            </button>
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#FF6000] px-3.5 py-2 text-[14px] font-bold text-white hover:bg-[#e55500]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Sepete Ekle</span>
            </button>
            <Link
              href={`/urun/${product.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-[14px] font-bold text-white hover:bg-white/25"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Ürün Sayfası</span>
            </Link>
          </div>
        </div>

        {/* Prominent Centered 9:16 Stage (Identical Mobile & Desktop) */}
        <div className="relative flex w-full items-center justify-center">
          {images.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setIndex((i) => (i - 1 + images.length) % images.length)
              }
              aria-label="Önceki görsel"
              className="absolute left-0 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-[#FF6000] sm:left-4"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <div
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            title="Sonraki görsel için tıklayın"
            className="relative aspect-[9/16] h-[72dvh] max-h-[820px] max-w-[92vw] cursor-pointer overflow-hidden rounded-2xl border-2 border-[#FF6000] bg-white shadow-2xl transition-transform active:scale-[0.99] sm:h-[76vh]"
          >
            <img
              src={images[index]}
              alt={
                product.imageAlts?.[index] ||
                `${product.name} — Görsel ${index + 1}`
              }
              className="h-full w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              aria-label="Sonraki görsel"
              className="absolute right-0 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-[#FF6000] sm:right-4"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
        </div>

        {/* 5-Thumbnail Switcher */}
        {images.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIndex(idx)}
                className={`aspect-[9/16] h-20 cursor-pointer overflow-hidden rounded-xl border-2 bg-white transition sm:h-24 ${
                  idx === index
                    ? "border-[#FF6000] scale-105 shadow-lg"
                    : "border-white/25 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={product.imageAlts?.[idx] || `${product.name} ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
