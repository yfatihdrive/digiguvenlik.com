import React from "react";
import { getProducts } from "@/lib/db";
import AccountClient from "@/components/AccountClient";

export const dynamic = "force-dynamic";

export default function HesabimPage() {
  const products = getProducts();
  return <AccountClient allProducts={products} />;
}
