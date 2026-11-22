import React from "react";
import { Metadata } from "next";
import {
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { getSettings } from "@/lib/db";
import ContactFormClient from "@/components/ContactFormClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim & Müşteri Hizmetleri Destek Hattı",
  description:
    "Digi Güvenlik müşteri hizmetleri, WhatsApp sipariş hattı (0 216 825 10 87), teknik destek ve adres bilgileri.",
  alternates: { canonical: "https://digiguvenlik.com/iletisim" },
};

export default function IletisimPage() {
  const settings = getSettings();

  return (
    <div className="hb-container py-10">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#FF6000] to-[#ff7a29] p-6 text-white sm:p-10">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase">
            7/24 Türkçe Müşteri Hizmetleri
          </span>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            İletişim &amp; Sipariş Destek Merkezi
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-orange-50">
            Ürün seçimi, telefon veya WhatsApp üzerinden kapıda ödemeli sipariş oluşturma ve kurulum desteği için uzman ekibimize hemen ulaşabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-10">
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
              "Merhaba, sitenizden ulaşıyorum. Bilgi ve sipariş desteği rica ediyorum."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 p-5 transition hover:bg-emerald-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-md">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-emerald-700 uppercase">
                WhatsApp Hızlı Sipariş &amp; Destek
              </span>
              <p className="mt-0.5 text-xl font-black text-gray-900">
                {settings.whatsappDisplay}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Tıklayarak doğrudan WhatsApp üzerinden müşteri temsilcimizle görüşmeye başlayın.
              </p>
            </div>
          </a>

          <a
            href={`tel:${settings.phone.replace(/\s+/g, "")}`}
            className="flex items-start gap-4 rounded-2xl border-2 border-orange-300 bg-orange-50/50 p-5 transition hover:bg-orange-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF6000] text-white shadow-md">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#FF6000] uppercase">
                Telefonla Sipariş &amp; Teknik Destek
              </span>
              <p className="mt-0.5 text-xl font-black text-gray-900">
                {settings.phone}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Hafta içi ve hafta sonu telefonla sipariş ve kurulum danışmanlığı.
              </p>
            </div>
          </a>

          <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-500 uppercase">
                Şirket Ünvanı &amp; Merkez Adresimiz
              </span>
              <p className="mt-0.5 text-sm font-black text-gray-900">
                {settings.companyName}
              </p>
              <p className="mt-1 text-xs text-gray-600">{settings.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-500 uppercase">
                Kurumsal E-Posta &amp; Çalışma Saatleri
              </span>
              <p className="mt-0.5 text-sm font-black text-gray-900">
                {settings.email}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                <Clock className="h-3.5 w-3.5 text-[#FF6000]" />
                <span>Pazartesi — Cumartesi: 09:00 – 21:00</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Online &amp; WhatsApp Sipariş: 7 Gün 24 Saat Aktif</span>
              </p>
            </div>
          </div>
        </div>
        <ContactFormClient />
      </div>
    </div>
  );
}
