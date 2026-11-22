import React from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import AccountClient from "@/components/AccountClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hesabım",
  robots: { index: false, follow: false },
};

export default function HesabimPage() {
  const products = getProducts();
  return <AccountClient allProducts={products} />;
}
