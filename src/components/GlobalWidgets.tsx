"use client";

import React, { useEffect } from "react";
import {
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { SiteSettings } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import QuickOrderForm from "./QuickOrderForm";
import WhatsAppAiBot from "./WhatsAppAiBot";

export default function GlobalWidgets({ settings }: { settings: SiteSettings }) {
  const {
    quickOrderProduct,
    closeQuickOrder,
    lightbox,
    closeLightbox,
    setLightboxIndex,
    toast,
  } = useShop();

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") {
        setLightboxIndex((lightbox.index + 1) % lightbox.images.length);
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex(
          (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, closeLightbox, setLightboxIndex]);

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-2xl border border-orange-200 bg-gray-900 px-4 py-3 text-[15px] font-bold text-white shadow-2xl">
          <CheckCircle2 className="h-5 w-5 text-[#FF6000]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Prominent Full-Screen 9:16 Lightbox Viewer (Identical on Mobile & Desktop) */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/92 p-3 backdrop-blur-md sm:p-5"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="flex w-full max-w-3xl items-center justify-between gap-2 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white sm:text-[16px]">
                {lightbox.title}
              </p>
              <p className="text-[13px] font-medium text-gray-300">
                Görsel {lightbox.index + 1} / {lightbox.images.length} • Değiştirmek için görsele tıklayın
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <a
                href={`/urun/${lightbox.slug}`}
                onClick={closeLightbox}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6000] px-3 py-2 text-[13px] font-bold text-white shadow-md transition hover:bg-[#e55500]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Ürüne Git</span>
              </a>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Kapat"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Center Prominent 9:16 Image Stage */}
          <div
            className="relative my-2 flex flex-1 items-center justify-center w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightbox.index - 1 + lightbox.images.length) %
                      lightbox.images.length
                  )
                }
                aria-label="Önceki görsel"
                className="absolute left-1 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition hover:bg-[#FF6000] sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div
              onClick={() =>
                setLightboxIndex((lightbox.index + 1) % lightbox.images.length)
              }
              title="Sonraki görsele geçmek için tıklayın"
              className="relative aspect-[9/16] h-[72dvh] max-h-[820px] max-w-[92vw] cursor-pointer overflow-hidden rounded-2xl border-2 border-[#FF6000] bg-white shadow-2xl transition-transform active:scale-[0.99] sm:h-[76vh]"
            >
              <img
                src={lightbox.images[lightbox.index]}
                alt={
                  lightbox.imageAlts?.[lightbox.index] ||
                  `${lightbox.title} — Görsel ${lightbox.index + 1}`
                }
                className="h-full w-full object-contain"
              />
            </div>

            {lightbox.images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightbox.index + 1) % lightbox.images.length)
                }
                aria-label="Sonraki görsel"
                className="absolute right-1 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition hover:bg-[#FF6000] sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Bottom 5-Thumbnail Strip */}
          {lightbox.images.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 pb-1"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`aspect-[9/16] h-14 cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition sm:h-16 ${
                    idx === lightbox.index
                      ? "border-[#FF6000] scale-105 shadow-lg"
                      : "border-white/30 opacity-65 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={lightbox.imageAlts?.[idx] || `${lightbox.title} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Order Modal */}
      {quickOrderProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeQuickOrder}
              aria-label="Kapat"
              className="absolute top-3 right-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/40"
            >
              <X className="h-5 w-5" />
            </button>
            <QuickOrderForm
              items={[
                {
                  productId: quickOrderProduct.id,
                  name: quickOrderProduct.name,
                  slug: quickOrderProduct.slug,
                  price: quickOrderProduct.price,
                  quantity: 1,
                  image: quickOrderProduct.image,
                },
              ]}
              settings={settings}
              orderType="quick_order"
              allowQuantityChange={true}
            />
          </div>
        </div>
      )}

      {/* Interactive WhatsApp AI Assistant (0 216 825 10 57) */}
      <WhatsAppAiBot />
    </>
  );
}
