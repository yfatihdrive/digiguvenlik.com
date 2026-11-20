"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Zap,
  MessageCircle,
  Phone,
  Heart,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Award,
  PackageCheck,
} from "lucide-react";
import { Product, SiteSettings } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import QuickOrderForm from "./QuickOrderForm";

interface ProductDetailClientProps {
  product: Product;
  settings: SiteSettings;
}

export default function ProductDetailClient({
  product,
  settings,
}: ProductDetailClientProps) {
  const { addToCart, favorites, toggleFavorite } = useShop();
  const [qty, setQty] = useState(1);
  const isFav = favorites.includes(product.id);

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  const havalePrice = Math.round(
    product.price * (1 - Number(settings.havaleDiscountRate || 10) / 100)
  );

  const waMessage = encodeURIComponent(
    `Merhaba ${settings.siteName}, "${product.name}" (${formatTL(
      product.price
    )} TL) ürününü sipariş vermek istiyorum. Yardımcı olur musunuz?\nÜrün Kodu: ${
      product.sku
    }`
  );

  const scrollToQuickOrder = () => {
    const el = document.getElementById("hizli-siparis");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Price & Campaign Box (Hepsiburada style) */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-2xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-normal text-[#9B9B9B] line-through">
                {formatTL(product.oldPrice)} TL
              </span>
              <span className="rounded bg-[#FA0000]/10 px-2 py-0.5 text-[15px] font-bold text-[#FA0000]">
                %{product.discountPercent} İndirim
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[30px] leading-[38px] font-bold tracking-[-0.02em] text-[#212121] sm:text-[34px]">
                {formatTL(product.price)}
              </span>
              <span className="text-[20px] font-bold text-[#212121]">TL</span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-[#EBF7E5] px-3.5 py-2 text-right">
            <span className="block text-[14px] font-semibold text-[#2E7D32]">
              Havale / EFT İle %{settings.havaleDiscountRate} İndirimli
            </span>
            <span className="text-[20px] font-bold text-[#2E7D32]">
              {formatTL(havalePrice)} TL
            </span>
          </div>
        </div>

        {/* Free Shipping & Cash on Delivery Banners */}
        <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-[#EBF7E5] px-3 py-2 text-[15px] font-bold text-[#2E7D32]">
            <Truck className="h-4 w-4" />
            <span>{settings.freeShippingText}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-[#212121] px-3 py-2 text-[15px] font-bold text-amber-400">
            <ShieldCheck className="h-4 w-4" />
            <span>{settings.codBannerTitle}</span>
          </div>
        </div>
      </div>

      {/* Highlights Bullet List */}
      <ul className="space-y-1.5 rounded-2xl border border-[#E5E5E5] bg-white p-4 text-[16px] font-normal text-[#484848]">
        {product.highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {/* Quantity + Add to Cart + Buy Now Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-gray-300 bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3.5 py-3 text-[18px] font-bold text-[#484848] hover:bg-gray-100"
          >
            −
          </button>
          <span className="min-w-10 text-center text-[16px] font-bold text-[#212121]">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3.5 py-3 text-[18px] font-bold text-[#484848] hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product, qty)}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FF6000] px-5 py-3.5 text-[17px] font-bold text-white shadow-sm transition hover:bg-[#e55500]"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Sepete Ekle</span>
        </button>

        <button
          type="button"
          onClick={scrollToQuickOrder}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-3.5 text-[17px] font-bold text-white shadow-sm transition hover:bg-[#1b5e20]"
        >
          <Zap className="h-5 w-5 fill-white" />
          <span>Hemen Al (Kapıda Ödeme)</span>
        </button>

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label="Favorilere Ekle"
          className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border transition ${
            isFav
              ? "border-rose-500 bg-rose-50 text-rose-600"
              : "border-gray-300 bg-white text-[#7B7B7B] hover:border-[#FF6000] hover:text-[#FF6000]"
          }`}
        >
          <Heart className={`h-5 w-5 ${isFav ? "fill-rose-600" : ""}`} />
        </button>
      </div>

      {/* 2. Üründe %30 İndirim Upsell Option (Luminous Animated Glowing Border) */}
      <div className="promo-glow-wrap">
        <span aria-hidden="true" className="promo-glow-beam" />
        <svg aria-hidden="true" className="promo-dash-svg">
          <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="14" ry="14" className="promo-dash-rect" />
        </svg>
        <div className="relative z-10 flex flex-col justify-between gap-3 rounded-[13px] bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-block animate-pulse rounded-full bg-gradient-to-r from-[#FF6000] to-[#ff8c00] px-3 py-0.5 text-[12px] font-extrabold text-white uppercase shadow-sm">
              🔥 2. ÜRÜNDE %30 İNDİRİM FIRSATI
            </span>
            <p className="mt-1.5 text-[15px] font-bold text-[#212121]">
              2 Adet Sepete Ekle, 2. Üründe{" "}
              <span className="font-extrabold text-[#2E7D32]">
                {formatTL(Math.round(product.price * 0.3))} TL
              </span>{" "}
              Anında İndirim Kazan!
            </p>
            <p className="text-[13px] font-medium text-[#666666]">
              Aynı üründen 2 adet veya farklı 2 ürün eklediğinizde 2. üründe %30 indirim otomatik uygulanır.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setQty(2);
              addToCart(product, 2);
            }}
            className="shrink-0 cursor-pointer rounded-xl bg-[#212121] px-4 py-2.5 text-[14px] font-extrabold text-white shadow-md transition hover:scale-105 hover:bg-[#FF6000]"
          >
            2 Adet Ekle (%30 İndirimli)
          </button>
        </div>
      </div>

      {/* Trust Panel & Direct WhatsApp / Support CTAs */}
      <div className="space-y-3 rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <div className="grid grid-cols-2 gap-2 text-[15px] font-semibold text-[#484848] sm:grid-cols-4">
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F5F5] p-2">
            <Truck className="h-4 w-4 shrink-0 text-[#FF6000]" />
            <span>Hızlı Teslimat</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F5F5] p-2">
            <Award className="h-4 w-4 shrink-0 text-[#FF6000]" />
            <span>Garanti Belgesi</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F5F5] p-2">
            <PackageCheck className="h-4 w-4 shrink-0 text-[#FF6000]" />
            <span>Güvenli Paketleme</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F5F5] p-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#FF6000]" />
            <span>Kapıda Ödeme</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={scrollToQuickOrder}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FF6000] px-3 py-2.5 text-[16px] font-bold text-white transition hover:bg-[#e55500]"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>Hızlı Sipariş Ver</span>
          </button>

          <a
            href={`https://wa.me/${settings.whatsapp}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 text-[16px] font-bold text-white transition hover:bg-[#1ebe5d]"
          >
            <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
            <span>WhatsApp Sipariş ({settings.whatsappDisplay})</span>
          </a>

          <a
            href={`tel:${settings.phone.replace(/\s+/g, "")}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#212121] px-3 py-2.5 text-[16px] font-bold text-white transition hover:bg-black"
          >
            <Phone className="h-4 w-4 text-[#FF6000]" />
            <span>Destek: {settings.phone}</span>
          </a>
        </div>
      </div>

      {/* Embedded Quick Order Form (#hizli-siparis) */}
      <QuickOrderForm
        items={[
          {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            quantity: qty,
            image: product.image,
          },
        ]}
        settings={settings}
        orderType="quick_order"
        allowQuantityChange={true}
      />
    </div>
  );
}
