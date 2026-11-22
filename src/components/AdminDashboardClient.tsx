"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Settings,
  Search,
  Plus,
  Trash2,
  Edit3,
  MessageCircle,
  Mail,
  CheckCircle2,
  Truck,
  Lock,
  Save,
  X,
  Send,
} from "lucide-react";
import {
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  SiteSettings,
} from "@/lib/types";
import { useShop } from "@/context/ShopContext";

interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "member";
  city: string;
  district: string;
  address: string;
  createdAt: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  "Yeni Sipariş",
  "Onaylandı",
  "Hazırlanıyor",
  "Kargoya Verildi",
  "Teslim Edildi",
  "İptal Edildi",
];

export default function AdminDashboardClient() {
  const { user, setUser, showToast } = useShop();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "products" | "users" | "coupons" | "settings"
  >("orders");

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Admin Login Form if not logged in
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  // Order filters & mail preview
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Product filters & editing modal
  const [prodSearch, setProdSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Coupon form
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"fixed" | "percent">("fixed");
  const [newCouponValue, setNewCouponValue] = useState(200);
  const [newCouponMin, setNewCouponMin] = useState(1000);
  const [newCouponDesc, setNewCouponDesc] = useState("");

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setCoupons(data.coupons || []);
        setUsers(data.users || []);
        setSettings(data.settings || null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user, fetchAdminData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: adminEmail,
        password: adminPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.user || data.user.role !== "admin") {
      setLoginErr(data.error || "Yönetici yetkisi bulunamadı.");
      return;
    }
    setUser(data.user);
    showToast("Yönetici paneline hoş geldiniz!");
  };

  const handleUpdateOrder = async (
    orderId: string,
    status: OrderStatus,
    trackingNumber: string
  ) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_order_status",
        orderId,
        status,
        trackingNumber,
      }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status, trackingNumber } : o
        )
      );
      showToast(`Sipariş #${orderId} güncellendi!`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_order", orderId }),
    });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(`Sipariş #${orderId} silindi.`, "info");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_product",
        product: editingProduct,
      }),
    });
    const data = await res.json();
    if (res.ok && data.product) {
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === data.product.id);
        if (exists) {
          return prev.map((p) => (p.id === data.product.id ? data.product : p));
        }
        return [data.product, ...prev];
      });
      setEditingProduct(null);
      showToast("Ürün başarıyla kaydedildi!");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_product", productId }),
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast("Ürün silindi.", "info");
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_coupon",
        coupon: {
          code: newCouponCode,
          type: newCouponType,
          value: newCouponValue,
          minOrder: newCouponMin,
          description: newCouponDesc || `${newCouponValue} İndirim`,
        },
      }),
    });
    const data = await res.json();
    if (res.ok && data.coupons) {
      setCoupons(data.coupons);
      setNewCouponCode("");
      setNewCouponDesc("");
      showToast("Kupon kaydedildi!");
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_coupon", code }),
    });
    const data = await res.json();
    if (res.ok && data.coupons) {
      setCoupons(data.coupons);
      showToast("Kupon silindi.", "info");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_settings", settings }),
    });
    if (res.ok) {
      showToast("Site ve E-Posta (SMTP) ayarları kaydedildi!");
    }
  };

  const handleTestSmtp = async () => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test_smtp" }),
    });
    const data = await res.json();
    showToast(data.message || "Test işlemi tamamlandı.", data.success ? "success" : "info");
  };

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6000] text-white">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-center text-xl font-black text-gray-900">
            Digi Güvenlik Yönetici (Admin) Girişi
          </h1>
          <p className="mt-1 text-center text-xs text-gray-500">
            Siparişleri, 291 ürünü, üyeleri ve mail ayarlarını yönetmek için giriş yapın.
          </p>

          {loginErr && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-extrabold text-gray-700 uppercase">
                Yönetici E-Posta
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-extrabold text-gray-700 uppercase">
                Şifre
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-[#FF6000] py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-[#e55500]"
            >
              YÖNETİM PANELİNE GİRİŞ YAP
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "İptal Edildi")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const newOrderCount = orders.filter((o) => o.status === "Yeni Sipariş").length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      `${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.customerCity.toLowerCase().includes(q)
    );
  });

  const filteredProducts = products
    .filter((p) => {
      const q = prodSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .slice(0, 60);

  return (
    <div className="hb-container py-6">
      {/* Top Admin Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gray-900 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6000] text-white">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black sm:text-xl">
              Digi Güvenlik E-Ticaret Yönetim Paneli
            </h1>
            <p className="text-xs text-gray-400">
              Siparişler, Ürün Kataloğu ({products.length} Ürün), Üyeler ve Mail Ayarları
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "orders", label: `Siparişler (${orders.length})`, icon: ShoppingBag },
            { id: "dashboard", label: "Özet & Ciro", icon: LayoutDashboard },
            { id: "products", label: `Ürünler (${products.length})`, icon: Package },
            { id: "users", label: `Üyeler (${users.length})`, icon: Users },
            { id: "coupons", label: `Kuponlar (${coupons.length})`, icon: Tag },
            { id: "settings", label: "Site & Mail Ayarları", icon: Settings },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                  active
                    ? "bg-[#FF6000] text-white shadow-sm"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center text-sm font-bold text-gray-500">
          Veriler yükleniyor...
        </div>
      ) : (
        <>
          {/* KPI Summary Strip */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase">
                Toplam Sipariş Cirosu
              </p>
              <p className="mt-1 text-2xl font-black text-[#FF6000]">
                {formatTL(totalRevenue)} ₺
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase">
                Yeni / Bekleyen Sipariş
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                {newOrderCount} Adet
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase">
                Aktif Ürün Sayısı
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {products.length} Ürün
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase">
                Kayıtlı Üye Sayısı
              </p>
              <p className="mt-1 text-2xl font-black text-blue-600">
                {users.length} Üye
              </p>
            </div>
          </div>

          {/* TAB 1: ORDERS MANAGEMENT */}
          {(activeTab === "orders" || activeTab === "dashboard") && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Gelen Siparişler ({filteredOrders.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Hızlı sipariş formundan ve sepetten gelen tüm siparişler anında buraya ve e-postanıza düşer.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Sipariş no, müşteri adı, tel..."
                      className="rounded-xl border border-gray-300 py-2 pr-3 pl-9 text-xs font-medium"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  >
                    <option value="all">Tüm Durumlar</option>
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const cleanPhone = ord.customerPhone.replace(/\D/g, "");
                  const waPhone = cleanPhone.startsWith("0")
                    ? "9" + cleanPhone
                    : cleanPhone.startsWith("90")
                    ? cleanPhone
                    : "90" + cleanPhone;

                  return (
                    <div
                      key={ord.id}
                      className="rounded-2xl border-2 border-gray-200 bg-gray-50/50 p-4 transition hover:border-orange-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="rounded-lg bg-[#FF6000] px-2.5 py-1 font-mono text-sm font-black text-white">
                            #{ord.id}
                          </span>
                          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold text-gray-700 border border-gray-200">
                            {ord.orderType === "quick_order"
                              ? "Hızlı Sipariş Formu"
                              : "Sepet Siparişi"}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            {new Date(ord.createdAt).toLocaleString("tr-TR")}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {ord.mailPreviewHtml && (
                            <button
                              type="button"
                              onClick={() => setPreviewHtml(ord.mailPreviewHtml || null)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>Mail Önizle</span>
                            </button>
                          )}

                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              `Merhaba ${ord.customerFirstName} ${ord.customerLastName}, Digi Güvenlik #${ord.id} numaralı siparişiniz hakkında bilgilendirme için yazıyoruz.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-extrabold text-white hover:bg-[#1ebe5d]"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Müşteriye WhatsApp Yaz</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Siparişi Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-12">
                        {/* Customer & Address Info */}
                        <div className="space-y-1 text-xs md:col-span-5">
                          <p className="font-extrabold text-gray-900 text-sm">
                            {ord.customerFirstName} {ord.customerLastName}
                          </p>
                          <p className="font-bold text-[#FF6000]">
                            Tel: {ord.customerPhone}
                          </p>
                          <p className="font-bold text-gray-800">
                            İl / İlçe: {ord.customerCity} / {ord.customerDistrict}
                          </p>
                          <p className="text-gray-600">
                            <strong>Açık Adres:</strong> {ord.customerAddress}
                          </p>
                          {ord.notes && (
                            <p className="rounded bg-amber-50 p-1.5 font-semibold text-amber-900 border border-amber-200">
                              <strong>Müşteri Notu:</strong> {ord.notes}
                            </p>
                          )}
                        </div>

                        {/* Ordered Items & Payment */}
                        <div className="space-y-1.5 text-xs md:col-span-4">
                          <p className="font-extrabold text-gray-700 uppercase">
                            Sipariş Edilen Ürünler:
                          </p>
                          {ord.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg bg-white p-2 border border-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={it.image}
                                  alt={it.name}
                                  className="h-8 w-8 object-contain"
                                />
                                <span className="font-bold text-gray-900">
                                  {it.name} × {it.quantity}
                                </span>
                              </div>
                              <span className="font-extrabold text-[#FF6000]">
                                {formatTL(it.price * it.quantity)} ₺
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-1">
                            <span className="rounded bg-orange-100 px-2 py-0.5 font-extrabold text-[#FF6000]">
                              {ord.paymentMethod}
                            </span>
                            <span className="text-base font-black text-gray-900">
                              Toplam: {formatTL(ord.totalAmount)} ₺
                            </span>
                          </div>
                        </div>

                        {/* Status & Tracking Update */}
                        <div className="flex flex-col justify-between gap-2 rounded-xl bg-white p-3 border border-gray-200 md:col-span-3">
                          <div>
                            <label className="mb-1 block text-[14px] font-extrabold text-gray-500 uppercase">
                              Sipariş Durumu
                            </label>
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrder(
                                  ord.id,
                                  e.target.value as OrderStatus,
                                  ord.trackingNumber
                                )
                              }
                              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-extrabold text-gray-900"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-[14px] font-extrabold text-gray-500 uppercase">
                              Kargo Takip No
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                defaultValue={ord.trackingNumber}
                                placeholder="Takip kodu..."
                                onBlur={(e) => {
                                  if (e.target.value !== ord.trackingNumber) {
                                    handleUpdateOrder(
                                      ord.id,
                                      ord.status,
                                      e.target.value
                                    );
                                  }
                                }}
                                className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Ürün Yönetimi ({products.length} Ürün)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Ürün fiyatlarını, indirimlerini, stoklarını düzenleyin veya yeni ürün ekleyin.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Ürün adı veya kod ara..."
                      className="rounded-xl border border-gray-300 py-2 pr-3 pl-9 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({
                        name: "",
                        category: "Ses Kayıt Cihazları",
                        categorySlug: "ses-kayit-cihazlari",
                        price: 3950,
                        oldPrice: 6450,
                        stock: 25,
                        image: "/uploads/products/uzaktan-ses-duyma-cihazi.png",
                        shortDescription: "",
                        isBestseller: true,
                      })
                    }
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#FF6000] px-4 py-2 text-xs font-extrabold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Yeni Ürün Ekle</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase">
                      <th className="p-3">Görsel</th>
                      <th className="p-3">Kod</th>
                      <th className="p-3">Ürün Adı</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Eski Fiyat</th>
                      <th className="p-3">Satış Fiyatı</th>
                      <th className="p-3">Stok</th>
                      <th className="p-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-orange-50/40">
                        <td className="p-2.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-12 w-12 rounded-lg border bg-white object-contain p-1"
                          />
                        </td>
                        <td className="p-2.5 font-mono font-bold text-gray-500">
                          {p.sku}
                        </td>
                        <td className="p-2.5 font-extrabold text-gray-900">
                          {p.name}
                        </td>
                        <td className="p-2.5 text-gray-600">{p.category}</td>
                        <td className="p-2.5 text-gray-400 line-through">
                          {formatTL(p.oldPrice)} ₺
                        </td>
                        <td className="p-2.5 font-black text-[#FF6000]">
                          {formatTL(p.price)} ₺
                        </td>
                        <td className="p-2.5 font-bold text-emerald-700">
                          {p.stock}
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(p)}
                              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-700 hover:border-[#FF6000] hover:text-[#FF6000]"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="rounded-lg border border-gray-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USERS MANAGEMENT */}
          {activeTab === "users" && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
              <h2 className="mb-4 text-lg font-black text-gray-900">
                Kayıtlı Üyeler ve Yöneticiler ({users.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase">
                      <th className="p-3">Ad Soyad</th>
                      <th className="p-3">E-Posta</th>
                      <th className="p-3">Telefon</th>
                      <th className="p-3">İl / İlçe</th>
                      <th className="p-3">Yetki</th>
                      <th className="p-3">Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-extrabold text-gray-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3 font-bold text-gray-800">{u.phone}</td>
                        <td className="p-3 text-gray-600">
                          {u.city || "-"} / {u.district || "-"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[13px] font-extrabold uppercase ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-[#FF6000]"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS MANAGEMENT */}
          {activeTab === "coupons" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-5">
                <h2 className="mb-4 text-base font-black text-gray-900">
                  Yeni İndirim Kuponu Oluştur
                </h2>
                <form onSubmit={handleAddCoupon} className="space-y-3.5 text-xs">
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      Kupon Kodu (Örn: BAHAR300)
                    </label>
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="BAHAR300"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-bold text-gray-700">
                        İndirim Türü
                      </label>
                      <select
                        value={newCouponType}
                        onChange={(e) =>
                          setNewCouponType(e.target.value as "fixed" | "percent")
                        }
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                      >
                        <option value="fixed">Sabit TL İndirimi</option>
                        <option value="percent">Yüzde (%) İndirimi</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-bold text-gray-700">
                        İndirim Değeri
                      </label>
                      <input
                        type="number"
                        required
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(Number(e.target.value))}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      Minimum Sepet Tutarı (TL)
                    </label>
                    <input
                      type="number"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      Kupon Açıklaması
                    </label>
                    <input
                      type="text"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      placeholder="Sana özel 300 TL indirim kuponu"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-xl bg-[#FF6000] py-3 font-extrabold text-white"
                  >
                    KUPONU EKLE
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-7">
                <h2 className="mb-4 text-base font-black text-gray-900">
                  Aktif İndirim Kuponları ({coupons.length})
                </h2>
                <div className="space-y-3">
                  {coupons.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 p-4"
                    >
                      <div>
                        <span className="rounded bg-orange-100 px-2.5 py-1 font-mono text-sm font-black text-[#FF6000]">
                          {c.code}
                        </span>
                        <p className="mt-1 text-xs font-bold text-gray-800">
                          {c.description} (Min. {c.minOrder} TL)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.code)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SITE, BANK & SMTP MAIL SETTINGS */}
          {activeTab === "settings" && settings && (
            <form
              onSubmit={handleSaveSettings}
              className="grid grid-cols-1 gap-6 lg:grid-cols-12"
            >
              {/* General & Bank Settings */}
              <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-6">
                <h2 className="text-base font-black text-gray-900">
                  Mağaza, WhatsApp &amp; Banka (IBAN) Ayarları
                </h2>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      Site / Marka Adı
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      Havale İndirim Oranı (%)
                    </label>
                    <input
                      type="number"
                      value={settings.havaleDiscountRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          havaleDiscountRate: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      Görünür Telefon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappDisplay}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          whatsappDisplay: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      WhatsApp Uluslararası No (90216...)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="mb-1 block font-bold text-gray-700">
                    Havale / EFT Alıcı Ünvanı
                  </label>
                  <input
                    type="text"
                    value={settings.bankAccountHolder}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankAccountHolder: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="text-xs">
                  <label className="mb-1 block font-bold text-gray-700">
                    IBAN Numarası
                  </label>
                  <input
                    type="text"
                    value={settings.bankIban}
                    onChange={(e) =>
                      setSettings({ ...settings, bankIban: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Email & SMTP Notification Settings */}
              <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-6">
                <h2 className="text-base font-black text-gray-900">
                  Sipariş E-Posta (Mail) &amp; SMTP Ayarları
                </h2>
                <p className="text-xs text-gray-500">
                  Hızlı sipariş formundan ve sepetten gelen siparişlerin anında mailinize düşmesi için alıcı e-posta ve SMTP bilgilerinizi buradan yapılandırabilirsiniz.
                </p>

                <div className="text-xs">
                  <label className="mb-1 block font-bold text-gray-700">
                    Siparişlerin Düşeceği E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={settings.notificationEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notificationEmail: e.target.value,
                      })
                    }
                    placeholder="siparis@digiguvenlik.company"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 font-bold text-[#FF6000]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      SMTP Sunucu (Host)
                    </label>
                    <input
                      type="text"
                      value={settings.smtp.host}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: { ...settings.smtp, host: e.target.value },
                        })
                      }
                      placeholder="smtp.gmail.com"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      SMTP Port (587 veya 465)
                    </label>
                    <input
                      type="number"
                      value={settings.smtp.port}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: {
                            ...settings.smtp,
                            port: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      SMTP Kullanıcı (E-Posta)
                    </label>
                    <input
                      type="text"
                      value={settings.smtp.user}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: { ...settings.smtp, user: e.target.value },
                        })
                      }
                      placeholder="ornek@gmail.com"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-gray-700">
                      SMTP Şifre / Uygulama Şifresi
                    </label>
                    <input
                      type="password"
                      value={settings.smtp.pass}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: { ...settings.smtp, pass: e.target.value },
                        })
                      }
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF6000] py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#e55500]"
                  >
                    <Save className="h-4 w-4" />
                    <span>TÜM AYARLARI KAYDET</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-900 px-4 py-3 text-xs font-extrabold text-white hover:bg-gray-800"
                  >
                    <Send className="h-4 w-4" />
                    <span>Test Maili Gönder</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* Product Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingProduct.id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-gray-700">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-gray-700">
                    Satış Fiyatı (TL)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 font-bold text-[#FF6000]"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-gray-700">
                    Eski Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        oldPrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-gray-700">
                    Stok Adedi
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock || 20}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-700">
                  Kategori
                </label>
                <select
                  value={editingProduct.categorySlug || "gizli-kameralar"}
                  onChange={(e) => {
                    const catObj = categories.find((c) => c.slug === e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      categorySlug: e.target.value,
                      category: catObj ? catObj.name : "Gizli Kameralar",
                    });
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-700">
                  Görsel Yolu (URL)
                </label>
                <input
                  type="text"
                  value={editingProduct.image || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, image: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-700">
                  Kısa Açıklama
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.shortDescription || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.isBestseller)}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      isBestseller: e.target.checked,
                    })
                  }
                  className="accent-[#FF6000]"
                />
                <span>En Çok Satan Ürün Olarak İşaretle</span>
              </label>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-xl bg-[#FF6000] py-3 text-sm font-extrabold text-white shadow-md"
              >
                ÜRÜNÜ KAYDET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Email HTML Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <span className="text-sm font-extrabold text-gray-900">
                Sipariş E-Posta (Mail) Bildirimi Önizlemesi
              </span>
              <button
                type="button"
                onClick={() => setPreviewHtml(null)}
                className="rounded-lg bg-gray-100 p-1.5 text-gray-700 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe sandbox="" srcDoc={previewHtml} title="Sipariş E-posta Önizleme" className="h-[72vh] w-full border-0 bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}
