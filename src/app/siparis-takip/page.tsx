"use client";

import React, { useState } from "react";
import { PackageSearch, Truck, CheckCircle2, Clock } from "lucide-react";
import { Order } from "@/lib/types";

export default function SiparisTakipPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() && !phone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders?id=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(
          phone.trim()
        )}`
      );
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  return (
    <div className="hb-container py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF6000]">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl">
              Sipariş Takibi ve Sorgulama
            </h1>
            <p className="text-xs text-gray-500">
              Sipariş numaranız (Örn: DTX-904812) veya telefon numaranız ile siparişinizin durumunu anında sorgulayın.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Sipariş No (Örn: DTX-904812)"
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon Numaranız (05xx...)"
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-xl bg-[#FF6000] px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e55500]"
          >
            {loading ? "Sorgulanıyor..." : "SİPARİŞİ SORGULA"}
          </button>
        </form>

        {orders !== null && (
          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm font-semibold text-gray-600">
                Girdiğiniz bilgilere ait sipariş bulunamadı. Lütfen sipariş numaranızı veya telefon numaranızı kontrol edin.
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-2xl border-2 border-orange-200 bg-orange-50/30 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                    <div>
                      <span className="font-mono text-base font-black text-[#FF6000]">
                        #{ord.id}
                      </span>
                      <span className="ml-3 text-xs text-gray-500">
                        {new Date(ord.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-extrabold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {ord.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    <div>
                      <p className="text-gray-500">Alıcı &amp; Teslimat Adresi:</p>
                      <p className="font-bold text-gray-900">
                        {ord.customerFirstName} {ord.customerLastName} —{" "}
                        {ord.customerCity} / {ord.customerDistrict}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ödeme &amp; Toplam Tutar:</p>
                      <p className="font-extrabold text-[#FF6000]">
                        {formatTL(ord.totalAmount)} ₺ ({ord.paymentMethod})
                      </p>
                    </div>
                  </div>

                  {ord.trackingNumber && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      <span>Kargo Takip Numarası: {ord.trackingNumber}</span>
                    </div>
                  )}

                  <div className="mt-3 space-y-1.5 border-t border-gray-200 pt-3 text-xs">
                    {ord.items.map((it, i) => (
                      <div key={i} className="flex justify-between font-semibold">
                        <span>
                          {it.name} × {it.quantity} Adet
                        </span>
                        <span>{formatTL(it.price * it.quantity)} ₺</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
