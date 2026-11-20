import React from "react";
import { Metadata } from "next";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetici (Admin) Paneli — Sipariş, Ürün ve Site Yönetimi",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
