import React from "react";
import { Metadata } from "next";
import { getSettings } from "@/lib/db";
import CartClient from "@/components/CartClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alışveriş Sepetim ve Sipariş Tamamlama",
  robots: { index: false, follow: false },
  description:
    "Sepetinizdeki ürünleri inceleyin, kapıda nakit, kredi kartı veya %10 indirimli havale/EFT ile siparişinizi hemen tamamlayın.",
};

export default function SepetPage() {
  const settings = getSettings();
  return <CartClient settings={settings} />;
}
