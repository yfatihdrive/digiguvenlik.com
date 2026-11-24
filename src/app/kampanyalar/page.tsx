import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Gift, Percent, Truck, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

export const metadata: Metadata = {
  title: "Aktif Kampanyalar ve İndirim Fırsatları",
  description:
    "Digi Güvenlik gizli kamera, dinleme cihazı ve ses kayıt cihazlarında 2. üründe %20 indirim, Çarkı Çevir 500 TL'ye varan kupon ve havale %10 indirim fırsatları.",
  alternates: { canonical: `${SITE_CONFIG.url}/kampanyalar` },
};

export default function KampanyalarPage() {
  const campaigns = [
    {
      icon: <Percent className="h-6 w-6" />,
      badge: "OTOMATİK UYGULANIR",
      title: "2. Üründe %20 İndirim Fırsatı",
      desc: "Sepetinize aynı üründen 2 adet veya farklı 2 ürün eklediğinizde 2. üründe anında %20 indirim otomatik olarak tutardan düşülür.",
      href: "/urunler",
      cta: "Ürünleri İncele",
      accent: "border-orange-300 bg-orange-50/60",
    },
    {
      icon: <Gift className="h-6 w-6" />,
      badge: "500 TL'YE VARAN KUPON",
      title: "Çarkı Çevir, Anında Kuponu Kap!",
      desc: "Sol alttaki Çarkı Çevir butonuna tıklayarak 200 TL, 300 TL, 400 TL veya 500 TL anında indirim kodu kazanın ve tek tıkla sepetinize uygulayın.",
      href: "/urunler",
      cta: "Alışverişe Başla",
      accent: "border-purple-300 bg-purple-50/60",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      badge: "EKSTRA %10 İNDİRİM",
      title: "Havale / EFT Ödemelerinde %10 İndirim",
      desc: "Sipariş formunda Havale / EFT ödeme yöntemini seçtiğinizde toplam tutar üzerinden anında %10 ek indirim kazanırsınız.",
      href: "/kategori/dinleme-cihazlari",
      cta: "Dinleme Cihazları",
      accent: "border-emerald-300 bg-emerald-50/60",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      badge: "81 İL ÜCRETSİZ",
      title: "Aynı Gün Ücretsiz Kargo & Gizli Paketleme",
      desc: "Saat 16:00'ya kadar verilen tüm siparişler aynı gün ücretsiz kargolanır ve dışarıdan içeriği belli olmayan gizli paketle teslim edilir.",
      href: "/kategori/gizli-kameralar",
      cta: "Gizli Kameralar",
      accent: "border-sky-300 bg-sky-50/60",
    },
  ];

  return (
    <div className="hb-container py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#FF6000] to-[#d94800] p-7 text-white shadow-md sm:p-10">
          <p className="text-[13px] font-extrabold tracking-widest uppercase text-amber-200">
            {SITE_CONFIG.name} • AKTİF FIRSATLAR
          </p>
          <h1 className="mt-1 text-[28px] font-extrabold sm:text-[34px]">
            Kampanyalar ve İndirim Fırsatları
          </h1>
          <p className="mt-2 max-w-2xl text-[16px] text-orange-50">
            Gizli kameralar, dinleme cihazları ve ses kayıt cihazlarında sepette otomatik uygulanan güncel indirimler.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {campaigns.map((c, i) => (
            <div
              key={i}
              className={`flex flex-col justify-between rounded-2xl border-2 p-6 shadow-2xs ${c.accent}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#FF6000] shadow-xs">
                    {c.icon}
                  </span>
                  <span className="rounded-full bg-[#212121] px-3 py-1 text-[11px] font-extrabold text-white">
                    {c.badge}
                  </span>
                </div>
                <h2 className="mt-4 text-[20px] font-bold text-[#212121]">
                  {c.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#484848]">
                  {c.desc}
                </p>
              </div>
              <Link
                href={c.href}
                className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-extrabold text-[#FF6000] hover:underline"
              >
                <span>{c.cta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
