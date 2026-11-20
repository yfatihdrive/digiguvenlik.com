"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { SiteSettings } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import QuickOrderForm from "./QuickOrderForm";
import { calculateSecondItemDiscount } from "@/lib/promo";

export default function CartClient({ settings }: { settings: SiteSettings }) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useShop();

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const secondItemDiscount = calculateSecondItemDiscount(cart);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-[#FF6000]">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="text-[24px] font-bold text-[#212121]">
            Sepetin şu an boş
          </h1>
          <p className="mt-2 text-[16px] font-normal text-[#7B7B7B]">
            İhtiyacınız olan güvenlik kamerası, ses kayıt veya uzaktan duyma cihazlarını hemen sepetinize ekleyebilirsiniz.
          </p>
          <Link
            href="/urunler"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-7 py-3 text-[16px] font-bold text-white shadow-sm transition hover:bg-[#e55500]"
          >
            <span>Alışverişe Başla</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hb-container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#212121]">
            Sepetim ({cart.reduce((s, i) => s + i.quantity, 0)} ürün)
          </h1>
          <p className="text-[16px] font-normal text-[#7B7B7B]">
            Sepetinizdeki ürünler için teslimat bilgilerinizi girerek kapıda ödemeli siparişinizi tamamlayabilirsiniz.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[15px] font-semibold text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" />
          <span>Sepeti Boşalt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Cart Items */}
        <div className="space-y-4 lg:col-span-6">
          {/* 2. Üründe %30 İndirim Kampanya Bannerı */}
          {totalQty === 1 && cart[0] ? (
            <div className="rounded-2xl border-2 border-dashed border-[#FF6000] bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4 shadow-2xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block rounded-full bg-[#FF6000] px-2.5 py-0.5 text-[12px] font-extrabold text-white uppercase">
                    🔥 2. ÜRÜNDE %30 İNDİRİM
                  </span>
                  <h2 className="mt-1 text-[17px] font-extrabold text-[#212121]">
                    1 Ürün Daha Ekle, 2. Üründe %30 İndirim Kazan!
                  </h2>
                  <p className="text-[14px] text-[#555555]">
                    Bu üründen 1 adet daha ekleyerek hemen{" "}
                    <strong className="text-[#2E7D32]">
                      {formatTL(Math.round(cart[0].price * 0.3))} TL
                    </strong>{" "}
                    tasarruf edebilir veya mağazadan farklı bir 2. ürün seçebilirsiniz.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(cart[0].productId, cart[0].quantity + 1)}
                    className="cursor-pointer rounded-xl bg-[#FF6000] px-4 py-2.5 text-[14px] font-extrabold text-white shadow-sm transition hover:bg-[#e55500]"
                  >
                    +1 Adet Daha Ekle (−{formatTL(Math.round(cart[0].price * 0.3))} TL)
                  </button>
                  <Link
                    href="/urunler"
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[14px] font-bold text-[#212121] hover:border-[#FF6000] hover:text-[#FF6000]"
                  >
                    <span>Başka Ürün Seç</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : secondItemDiscount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-4 py-3.5 text-emerald-900 shadow-2xs">
              <div>
                <p className="text-[16px] font-extrabold text-emerald-800">
                  🎉 2. Üründe %30 İndirim Uygulandı!
                </p>
                <p className="text-[14px] font-medium text-emerald-700">
                  Sepetinizde {totalQty} ürün bulunduğu için 2. üründe %30 indirim tutardan otomatik düşüldü.
                </p>
              </div>
              <span className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-[16px] font-black text-white shadow-xs">
                −{formatTL(secondItemDiscount)} TL
              </span>
            </div>
          ) : null}
          <div className="divide-y divide-gray-100 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-2xs sm:p-6">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/urun/${item.slug}`}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white p-2"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </Link>
                  <div>
                    <span className="text-[14px] font-semibold text-[#7B7B7B]">
                      {item.category}
                    </span>
                    <Link href={`/urun/${item.slug}`}>
                      <h3 className="text-[16px] leading-[24px] font-medium text-[#212121] hover:text-[#FF6000]">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[15px] text-[#9B9B9B] line-through">
                        {formatTL(item.oldPrice)} TL
                      </span>
                      <span className="text-[18px] font-bold text-[#212121]">
                        {formatTL(item.price)} TL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="px-3 py-1.5 text-[16px] font-bold text-[#484848] hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-[16px] font-bold text-[#212121]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="px-3 py-1.5 text-[16px] font-bold text-[#484848] hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="min-w-20 text-right text-[17px] font-bold text-[#212121]">
                    {formatTL(item.price * item.quantity)} TL
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label="Ürünü sil"
                    className="rounded-lg p-1.5 text-[#9B9B9B] hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-[#EBF7E5] p-3.5 text-[15px] font-semibold text-[#2E7D32]">
              <Truck className="h-5 w-5 shrink-0 text-[#2E7D32]" />
              <span>Sepetinizdeki tüm ürünlerde kargo tamamen ücretsizdir!</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3.5 text-[15px] font-semibold text-orange-900">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#FF6000]" />
              <span>Önce teslim alın, ödemeyi kapıda nakit veya kartla yapın!</span>
            </div>
          </div>
        </div>

        {/* Right: Order Completion Form */}
        <div className="lg:col-span-6">
          <QuickOrderForm
            items={cart.map((c) => ({
              productId: c.productId,
              name: c.name,
              slug: c.slug,
              price: c.price,
              quantity: c.quantity,
              image: c.image,
            }))}
            settings={settings}
            orderType="cart_order"
            allowQuantityChange={false}
            title="SEPET SİPARİŞİNİ TAMAMLA — TESLİMAT BİLGİLERİ"
          />
        </div>
      </div>
    </div>
  );
}
