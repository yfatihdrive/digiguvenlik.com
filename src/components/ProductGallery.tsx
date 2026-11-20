"use client";

import React, { useState } from "react";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

interface ProductGalleryProps {
  images: string[];
  imageAlts?: string[];
  name: string;
  slug: string;
  isBestseller: boolean;
  discountPercent: number;
}

export default function ProductGallery({
  images,
  imageAlts,
  name,
  slug,
  isBestseller,
  discountPercent,
}: ProductGalleryProps) {
  const { openLightbox } = useShop();
  const validImages = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);

  const currentSrc = validImages[activeIndex] || "";
  const currentAlt =
    imageAlts?.[activeIndex] || `${name} — Ürün Görseli ${activeIndex + 1}`;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleMainImageClick = () => {
    const nextIdx =
      validImages.length > 1 ? (activeIndex + 1) % validImages.length : 0;
    setActiveIndex(nextIdx);
    openLightbox({
      images: validImages,
      imageAlts,
      title: name,
      slug,
      index: nextIdx,
    });
  };

  const handleThumbClick = (idx: number) => {
    setActiveIndex(idx);
    openLightbox({
      images: validImages,
      imageAlts,
      title: name,
      slug,
      index: idx,
    });
  };

  return (
    <div className="space-y-3">
      {/* Main 9:16 Mobile-Friendly Portrait Stage */}
      <div
        onClick={handleMainImageClick}
        title="Görseli değiştirmek, 9:16 öne çıkarmak ve yeni sayfada açmak için tıklayın"
        className="group relative mx-auto flex aspect-[9/16] max-h-[680px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-2xs transition hover:border-[#FF6000]"
      >
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isBestseller && (
            <span className="inline-flex items-center gap-1 rounded bg-[#FF6000] px-2.5 py-1 text-[14px] font-bold text-white uppercase shadow-2xs">
              <Flame className="h-3.5 w-3.5 fill-white" /> En Çok Satan
            </span>
          )}
          <span className="inline-flex items-center rounded bg-[#FA0000] px-2.5 py-1 text-[14px] font-bold text-white shadow-2xs">
            %{discountPercent} İndirim
          </span>
        </div>

        {/* Top-Right Fullscreen Popup Indicator */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/65 text-white backdrop-blur-xs transition group-hover:bg-[#FF6000]">
            <Maximize2 className="h-4 w-4" />
          </span>
        </div>

        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Önceki görsel"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[#212121] shadow-md transition hover:border-[#FF6000] hover:text-[#FF6000]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Sonraki görsel"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[#212121] shadow-md transition hover:border-[#FF6000] hover:text-[#FF6000]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/65 px-3 py-1 text-[13px] font-bold text-white">
              {activeIndex + 1} / {validImages.length}
            </span>
          </>
        )}

        <img
          src={currentSrc}
          alt={currentAlt}
          title={currentAlt}
          className="h-full w-full object-contain transition-all duration-200 group-hover:scale-[1.02]"
        />
      </div>

      {/* 5-Thumbnail Mobile-Friendly 9:16 Strip */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {validImages.map((imgSrc, idx) => {
            const isActive = idx === activeIndex;
            const thumbAlt =
              imageAlts?.[idx] || `${name} — Görsel ${idx + 1}`;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleThumbClick(idx)}
                className={`relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl border-2 bg-white transition ${
                  isActive
                    ? "border-[#FF6000] ring-2 ring-[#FF6000]/25"
                    : "border-[#E5E5E5] opacity-80 hover:border-gray-400 hover:opacity-100"
                }`}
              >
                <img
                  src={imgSrc}
                  alt={thumbAlt}
                  title={thumbAlt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
