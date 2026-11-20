"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { Order, Product } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import ProductCard from "./ProductCard";

export default function AccountClient({
  allProducts,
}: {
  allProducts: Product[];
}) {
  const router = useRouter();
  const { user, setUser, favorites, logout, showToast } = useShop();

  const [tab, setTab] = useState<"orders" | "favorites" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone);
      setCity(user.city || "");
      setDistrict(user.district || "");
      setAddress(user.address || "");

      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => setOrders(d.orders || []))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    } else {
      setLoadingOrders(false);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_profile",
        firstName,
        lastName,
        phone,
        city,
        district,
        address,
        newPassword: newPassword || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setUser(data.user);
      setNewPassword("");
      showToast("Profil bilgileriniz güncellendi!");
    }
  };

  const favProducts = allProducts.filter((p) => favorites.includes(p.id));
  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xs">
          <h1 className="text-xl font-black text-gray-900">
            Hesabınızı ve Siparişlerinizi Görmek İçin Giriş Yapın
          </h1>
          <p className="mt-2 text-xs text-gray-500">
            Üye girişi yaparak geçmiş siparişlerinizi takip edebilir ve kayıtlı teslimat adreslerinizi yönetebilirsiniz.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/giris"
              className="rounded-xl bg-[#FF6000] px-6 py-3 text-sm font-extrabold text-white"
            >
              Giriş Yap / Üye Ol
            </Link>
            <Link
              href="/siparis-takip"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700"
            >
              Üyeliksiz Sipariş Sorgula
            </Link>
          </div>

          {favProducts.length > 0 && (
            <div className="mt-10 text-left">
              <h2 className="mb-4 text-lg font-black text-gray-900">
                Favori Ürünleriniz ({favProducts.length})
              </h2>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {favProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hb-container py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="space-y-3 lg:col-span-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6000] text-lg font-black text-white">
                {user.firstName[0]}
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>

            <nav className="mt-4 space-y-1.5 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setTab("orders")}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-3 transition ${
                  tab === "orders"
                    ? "bg-[#FF6000] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Siparişlerim ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTab("favorites")}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-3 transition ${
                  tab === "favorites"
                    ? "bg-[#FF6000] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Favorilerim ({favProducts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTab("profile")}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-3 transition ${
                  tab === "profile"
                    ? "bg-[#FF6000] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Profil &amp; Adres Bilgilerim</span>
              </button>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex w-full items-center gap-2.5 rounded-xl bg-purple-600 px-3.5 py-3 text-white shadow-xs hover:bg-purple-700"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Yönetici (Admin) Paneli</span>
                </Link>
              )}

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-3 text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış Yap</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="lg:col-span-9">
          {tab === "orders" && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-lg font-black text-gray-900">
                Siparişlerim ({orders.length})
              </h2>
              {loadingOrders ? (
                <p className="text-sm text-gray-500">Yükleniyor...</p>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center">
                  <p className="text-sm font-bold text-gray-700">
                    Henüz kayıtlı bir siparişiniz bulunmuyor.
                  </p>
                  <Link
                    href="/urunler"
                    className="mt-3 inline-block rounded-xl bg-[#FF6000] px-5 py-2.5 text-xs font-extrabold text-white"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-gray-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <span className="font-mono text-sm font-black text-[#FF6000]">
                            #{ord.id}
                          </span>
                          <span className="ml-3 text-xs text-gray-400">
                            {new Date(ord.createdAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {ord.status}
                        </span>
                      </div>

                      {ord.trackingNumber && (
                        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                          <Truck className="h-4 w-4" />
                          <span>Kargo Takip No: {ord.trackingNumber}</span>
                        </div>
                      )}

                      <div className="mt-3 divide-y divide-gray-100 text-xs">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={it.image}
                                alt={it.name}
                                className="h-10 w-10 rounded border object-contain p-0.5"
                              />
                              <span className="font-bold text-gray-800">
                                {it.name} × {it.quantity}
                              </span>
                            </div>
                            <span className="font-extrabold text-gray-900">
                              {formatTL(it.price * it.quantity)} ₺
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex justify-between border-t border-gray-100 pt-2.5 text-sm font-black">
                        <span>Toplam ({ord.paymentMethod}):</span>
                        <span className="text-[#FF6000]">
                          {formatTL(ord.totalAmount)} ₺
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "favorites" && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-lg font-black text-gray-900">
                Favori Ürünlerim ({favProducts.length})
              </h2>
              {favProducts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Henüz favorilerinize ürün eklemediniz.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {favProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-lg font-black text-gray-900">
                Profil ve Kayıtlı Teslimat Adresim
              </h2>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">
                      Ad
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">
                      Soyad
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">
                      İl
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">
                      İlçe
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">
                    Açık Adres
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">
                    Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-[#FF6000] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#e55500]"
                >
                  BİLGİLERİMİ KAYDET
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
