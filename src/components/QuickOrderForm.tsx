"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  Banknote,
  CreditCard,
  Landmark,
  Tag,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { OrderItem, SiteSettings, Order } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import { calculateSecondItemDiscount } from "@/lib/promo";

interface QuickOrderFormProps {
  items: OrderItem[];
  settings: SiteSettings;
  orderType?: "quick_order" | "cart_order";
  allowQuantityChange?: boolean;
  onSuccessOrder?: (order: Order) => void;
  title?: string;
}

export default function QuickOrderForm({
  items: initialItems,
  settings,
  orderType = "quick_order",
  allowQuantityChange = true,
  onSuccessOrder,
  title = "HIZLI SİPARİŞ FORMU — KAPIDA ÖDEME KOLAYLIĞI",
}: QuickOrderFormProps) {
  const { user, clearCart, activeCoupon } = useShop();

  const [quantity, setQuantity] = useState<number>(initialItems[0]?.quantity || 1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Kapıda Nakit" | "Kapıda Kredi Kartı" | "Havale - EFT"
  >("Kapıda Nakit");
  const [notes, setNotes] = useState("");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Province / District data
  const [ilIlceMap, setIlIlceMap] = useState<Record<string, string[]>>({});
  const [copiedIban, setCopiedIban] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/data/turkiye-il-ilce.json")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setIlIlceMap(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeCoupon) {
      setAppliedCoupon({
        code: activeCoupon.code,
        discount: activeCoupon.discount,
        description: `Çark Hediyesi ${activeCoupon.discount} TL İndirim`,
      });
    }
  }, [activeCoupon]);

  useEffect(() => {
    if (user) {
      if (!firstName) setFirstName(user.firstName || "");
      if (!lastName) setLastName(user.lastName || "");
      if (!phone) setPhone(user.phone || "");
      if (!city && user.city) setCity(user.city);
      if (!district && user.district) setDistrict(user.district);
      if (!address && user.address) setAddress(user.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const effectiveItems: OrderItem[] =
    orderType === "quick_order" && initialItems.length === 1
      ? [{ ...initialItems[0], quantity }]
      : initialItems;

  const subtotal = effectiveItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const secondItemDiscount = calculateSecondItemDiscount(effectiveItems);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const afterCoupon = Math.max(0, subtotal - secondItemDiscount - couponDiscount);
  const havaleRate = Number(settings.havaleDiscountRate || 10);
  const havaleDiscount =
    paymentMethod === "Havale - EFT"
      ? Math.round((afterCoupon * havaleRate) / 100)
      : 0;
  const totalPayable = Math.max(0, afterCoupon - havaleDiscount);

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = (codeToUse ?? couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponInput(code);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discount: data.discount,
          description: data.description,
        });
        setCouponMsg({ text: data.message, ok: true });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ text: data.message || "Geçersiz kupon kodu.", ok: false });
      }
    } catch {
      setCouponMsg({ text: "Kupon kontrol edilemedi.", ok: false });
    }
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText(settings.bankIban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          customerFirstName: firstName,
          customerLastName: lastName,
          customerPhone: phone,
          customerEmail: user?.email || "",
          customerCity: city,
          customerDistrict: district,
          customerAddress: address,
          paymentMethod,
          couponCode: appliedCoupon?.code || "",
          notes,
          items: effectiveItems,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Sipariş gönderilirken bir hata oluştu.");
        setSubmitting(false);
        return;
      }

      setCompletedOrder(data.order);
      if (orderType === "cart_order") {
        clearCart();
      }
      if (onSuccessOrder) {
        onSuccessOrder(data.order);
      }
    } catch {
      setErrorMsg("Bağlantı hatası oluştu, lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  const provinces = Object.keys(ilIlceMap).sort((a, b) => a.localeCompare(b, "tr"));
  const districts = city && ilIlceMap[city] ? ilIlceMap[city] : [];

  if (completedOrder) {
    const waText = encodeURIComponent(
      `Merhaba ${settings.siteName}, #${completedOrder.id} numaralı siparişimi oluşturdum.\n` +
        `Ad Soyad: ${completedOrder.customerFirstName} ${completedOrder.customerLastName}\n` +
        `Ürün: ${completedOrder.items.map((i) => `${i.name} (${i.quantity} Adet)`).join(", ")}\n` +
        `Tutar: ${formatTL(completedOrder.totalAmount)} TL (${completedOrder.paymentMethod})\n` +
        `Adres: ${completedOrder.customerCity} / ${completedOrder.customerDistrict}`
    );

    return (
      <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
          Siparişiniz Başarıyla Alındı ve Maile İletildi
        </span>
        <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
          Teşekkürler, {completedOrder.customerFirstName}!
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Sipariş numaranız:{" "}
          <strong className="rounded bg-white px-2 py-0.5 font-mono text-base font-extrabold text-[#FF6000] shadow-xs">
            #{completedOrder.id}
          </strong>
        </p>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 text-left text-sm shadow-xs">
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-500">Alıcı:</span>
            <span className="font-bold text-gray-900">
              {completedOrder.customerFirstName} {completedOrder.customerLastName} (
              {completedOrder.customerPhone})
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-500">Teslimat Bölgesi:</span>
            <span className="font-bold text-gray-900">
              {completedOrder.customerCity} / {completedOrder.customerDistrict}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-500">Ödeme Yöntemi:</span>
            <span className="font-bold text-[#FF6000]">{completedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-2 text-base">
            <span className="font-bold text-gray-800">Ödenecek Tutar:</span>
            <span className="font-extrabold text-emerald-700">
              {formatTL(completedOrder.totalAmount)} ₺
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1ebe5d]"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp ile Hemen Onayla ({settings.whatsappDisplay})
          </a>
          <button
            type="button"
            onClick={() => setCompletedOrder(null)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Yeni Sipariş
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="hizli-siparis"
      className="overflow-hidden rounded-2xl border-2 border-[#FF6000] bg-white shadow-lg"
    >
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#FF6000] to-[#ff7a29] px-5 py-3.5 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 shrink-0" />
            <h2 className="text-[16px] font-bold tracking-tight uppercase sm:text-[17px]">
              {title}
            </h2>
          </div>
          <span className="hidden rounded-full bg-white/20 px-2.5 py-0.5 text-[14px] font-bold sm:inline-block">
            Ücretsiz Kargo
          </span>
        </div>
        <p className="mt-0.5 text-[15px] font-normal text-orange-50">
          Bilgilerinizi doldurun, siparişiniz anında sistemimize ve e-postamıza düşsün. Kapıda nakit veya kartla güvenle ödeyin!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[16px] font-semibold text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quantity selector if single product quick order */}
        {allowQuantityChange && orderType === "quick_order" && initialItems.length === 1 && (
          <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-2.5">
            <div>
              <p className="text-[14px] font-semibold text-[#7B7B7B] uppercase">Seçilen Ürün</p>
              <p className="line-clamp-1 text-[16px] font-bold text-[#212121]">
                {initialItems[0].name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-[#484848]">Adet:</span>
              <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-[17px] font-bold text-[#484848] hover:bg-gray-100"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-[16px] font-bold text-[#212121]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 py-1 text-[17px] font-bold text-[#484848] hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Name & Surname */}
        <div>
          <label className="mb-1.5 block text-[15px] font-bold text-[#212121]">
            Adınız Soyadınız <span className="text-[#FF6000]">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Adınız"
              className="w-full rounded-lg border border-gray-300 bg-[#FAFAFA] px-3.5 py-2.5 text-[16px] font-normal text-[#212121] transition focus:border-[#FF6000] focus:bg-white focus:outline-none"
            />
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Soyadınız"
              className="w-full rounded-lg border border-gray-300 bg-[#FAFAFA] px-3.5 py-2.5 text-[16px] font-normal text-[#212121] transition focus:border-[#FF6000] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="mb-1.5 block text-[15px] font-bold text-[#212121]">
            Telefon Numaranız <span className="text-[#FF6000]">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
            className="w-full rounded-lg border border-gray-300 bg-[#FAFAFA] px-3.5 py-2.5 text-[16px] font-normal text-[#212121] transition focus:border-[#FF6000] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Province & District & Street Address */}
        <div className="space-y-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-3.5">
          <div className="text-[15px] font-bold text-[#212121]">
            Sipariş Teslimat Adresiniz <span className="text-[#FF6000]">*</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[15px] font-medium text-[#484848]">İl</label>
              <select
                required
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDistrict("");
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[16px] font-normal text-[#212121] focus:border-[#FF6000] focus:outline-none"
              >
                <option value="">İl Seçin</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[15px] font-medium text-[#484848]">İlçe</label>
              <select
                required
                disabled={!city}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[16px] font-normal text-[#212121] disabled:bg-gray-100 disabled:text-[#9B9B9B] focus:border-[#FF6000] focus:outline-none"
              >
                <option value="">{city ? "İlçe Seçin" : "Önce İl Seçin"}</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[15px] font-medium text-[#484848]">
              Mahalle, Sokak, Bina ve Kapı No
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Mahalle, cadde/sokak, bina no, daire no veya teslim alacak kargo şubesi..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-[16px] font-normal text-[#212121] focus:border-[#FF6000] focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Üründe %30 İndirim Upsell / Applied Strip inside Order Form */}
        {allowQuantityChange && effectiveItems.length === 1 && quantity === 1 ? (
          <button
            type="button"
            onClick={() => setQuantity(2)}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-2 border-dashed border-[#FF6000] bg-orange-50 px-3.5 py-2.5 text-left transition hover:bg-orange-100"
          >
            <div>
              <p className="text-[14px] font-extrabold text-[#FF6000]">
                🔥 2. Üründe %30 İndirim Fırsatı!
              </p>
              <p className="text-[13px] font-medium text-[#484848]">
                2 adet almak için tıklayın, 2. üründe{" "}
                <strong className="text-[#2E7D32]">
                  {formatTL(Math.round(effectiveItems[0].price * 0.3))} TL
                </strong>{" "}
                anında indirim kazanın!
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-[#FF6000] px-3 py-1.5 text-[13px] font-extrabold text-white">
              +1 Ekle
            </span>
          </button>
        ) : secondItemDiscount > 0 ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-[14px] font-bold text-emerald-800">
            <span>🎉 2. Üründe %30 İndirim Uygulandı!</span>
            <span className="rounded-lg bg-emerald-600 px-2.5 py-0.5 text-white">
              −{formatTL(secondItemDiscount)} TL
            </span>
          </div>
        ) : null}

        {/* Active Wheel Coupon Auto-Applied Banner */}
        {appliedCoupon && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-[14px] font-bold text-emerald-800">
            <span>
              🎉 Çark Kuponunuz Uygulandı:{" "}
              <strong className="font-mono">{appliedCoupon.code}</strong>
            </span>
            <span className="rounded-lg bg-emerald-600 px-2.5 py-0.5 text-white">
              -{formatTL(appliedCoupon.discount)} TL
            </span>
          </div>
        )}

        {/* Payment Method Selection */}
        <div>
          <label className="mb-2 block text-[15px] font-bold text-[#212121]">
            Ödeme Yöntemi Seçin <span className="text-[#FF6000]">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {/* Kapıda Nakit */}
            <label
              className={`flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3 transition ${
                paymentMethod === "Kapıda Nakit"
                  ? "border-[#FF6000] bg-orange-50/70 shadow-2xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment_method"
                  value="Kapıda Nakit"
                  checked={paymentMethod === "Kapıda Nakit"}
                  onChange={() => setPaymentMethod("Kapıda Nakit")}
                  className="accent-[#FF6000]"
                />
                <Banknote className="h-5 w-5 text-[#FF6000]" />
                <span className="text-[15px] font-bold text-[#212121]">
                  Kapıda Nakit Ödeme
                </span>
              </div>
              <span className="mt-1.5 pl-6 text-[14px] font-normal text-[#7B7B7B]">
                Paketi teslim alırken nakit ödeyin
              </span>
            </label>

            {/* Kapıda Kredi Kartı */}
            <label
              className={`flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3 transition ${
                paymentMethod === "Kapıda Kredi Kartı"
                  ? "border-[#FF6000] bg-orange-50/70 shadow-2xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment_method"
                  value="Kapıda Kredi Kartı"
                  checked={paymentMethod === "Kapıda Kredi Kartı"}
                  onChange={() => setPaymentMethod("Kapıda Kredi Kartı")}
                  className="accent-[#FF6000]"
                />
                <CreditCard className="h-5 w-5 text-[#FF6000]" />
                <span className="text-[15px] font-bold text-[#212121]">
                  Kapıda Kredi Kartı
                </span>
              </div>
              <span className="mt-1.5 pl-6 text-[14px] font-normal text-[#7B7B7B]">
                Kuryede POS cihazı ile tek çekim
              </span>
            </label>

            {/* Havale / EFT */}
            <label
              className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3 transition ${
                paymentMethod === "Havale - EFT"
                  ? "border-[#2E7D32] bg-[#EBF7E5] shadow-2xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment_method"
                  value="Havale - EFT"
                  checked={paymentMethod === "Havale - EFT"}
                  onChange={() => setPaymentMethod("Havale - EFT")}
                  className="accent-[#2E7D32]"
                />
                <Landmark className="h-5 w-5 text-[#2E7D32]" />
                <span className="text-[15px] font-bold text-[#212121]">
                  Havale / EFT
                </span>
              </div>
              <div className="mt-1.5 pl-6">
                <span className="inline-block rounded bg-[#2E7D32] px-1.5 py-0.5 text-[13px] font-bold text-white">
                  %{havaleRate} ANINDA İNDİRİM
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Bank / IBAN Panel when Havale - EFT is selected */}
        {paymentMethod === "Havale - EFT" && (
          <div className="rounded-xl border border-emerald-300 bg-[#EBF7E5] p-3.5 text-[15px] text-emerald-950">
            <p className="font-bold text-[#2E7D32] uppercase">
              Havale / EFT Banka Hesap Bilgilerimiz (%{havaleRate} İndirimli)
            </p>
            <p className="mt-1">
              <strong>ALICI:</strong> {settings.bankAccountHolder}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-white p-2">
              <span className="font-mono text-[15px] font-bold text-[#212121]">
                {settings.bankIban}
              </span>
              <button
                type="button"
                onClick={handleCopyIban}
                className="inline-flex items-center gap-1 rounded bg-[#2E7D32] px-2.5 py-1 text-[14px] font-bold text-white hover:bg-[#1b5e20]"
              >
                {copiedIban ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> IBAN Kopyala
                  </>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[14px] text-[#2E7D32]">
              * Lütfen havale/EFT açıklama kısmına sipariş verdiğiniz <strong>telefon numaranızı</strong> yazınız.
            </p>
          </div>
        )}

        {/* Live Order Totals Box */}
        <div className="space-y-1.5 rounded-xl bg-[#212121] p-4 text-[16px] text-white">
          <div className="flex justify-between text-gray-300">
            <span>Ürünler Toplamı:</span>
            <span className="font-semibold text-white">{formatTL(subtotal)} TL</span>
          </div>
          {secondItemDiscount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>2. Üründe %30 İndirim:</span>
              <span className="font-bold">−{formatTL(secondItemDiscount)} TL</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Kupon İndirimi ({appliedCoupon?.code}):</span>
              <span className="font-bold">−{formatTL(couponDiscount)} TL</span>
            </div>
          )}
          {havaleDiscount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Havale / EFT İndirimi (%{havaleRate}):</span>
              <span className="font-bold">−{formatTL(havaleDiscount)} TL</span>
            </div>
          )}
          <div className="flex justify-between text-[15px] font-bold text-amber-400">
            <span>Kargo:</span>
            <span>ÜCRETSİZ KARGO (0 TL)</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-700 pt-2.5 text-[17px]">
            <span className="font-semibold">Ödenecek Tutar:</span>
            <span className="text-[22px] font-bold text-[#FF6000]">
              {formatTL(totalPayable)} TL
            </span>
          </div>
        </div>

        {/* Optional Order Notes */}
        <div>
          <label className="mb-1 block text-[15px] font-semibold text-[#484848]">
            Sipariş Notunuz <span className="font-normal text-[#9B9B9B]">(İsteğe Bağlı)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Varsa kargo veya teslimat notunuzu yazabilirsiniz..."
            className="w-full rounded-lg border border-gray-300 bg-[#FAFAFA] px-3.5 py-2 text-[16px] text-[#212121] focus:border-[#FF6000] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FF6000] px-6 py-3.5 text-[17px] font-bold text-white shadow-md transition hover:bg-[#e55500] disabled:opacity-60"
        >
          <ShieldCheck className="h-5 w-5" />
          {submitting
            ? "Siparişiniz Oluşturuluyor..."
            : `Siparişi Tamamla (${formatTL(totalPayable)} TL)`}
        </button>
      </form>
    </div>
  );
}
