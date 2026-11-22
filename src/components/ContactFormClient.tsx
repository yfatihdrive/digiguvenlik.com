"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactFormClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // invisible honeypot
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message, website }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          ok: true,
          text: data.message || "Mesajınız başarıyla iletildi.",
        });
        setName("");
        setPhone("");
        setEmail("");
        setMessage("");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("digiguvenlik-analytics-event", {
              detail: { event: "generate_lead", form: "contact" },
            })
          );
        }
      } else {
        setStatus({
          ok: false,
          text: data.error || "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
        });
      }
    } catch {
      setStatus({ ok: false, text: "Bağlantı hatası oluştu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-100 bg-[#FAFAFA] p-6 sm:p-10"
    >
      <h2 className="text-[20px] font-bold text-[#212121]">
        Bize Mesaj Gönderin (Hızlı İletişim Formu)
      </h2>
      <p className="mt-1 text-[14px] text-[#666666]">
        Gizli kamera, dinleme cihazı veya ses kayıt cihazı seçimi için sorunuzu yazın; uzman ekibimiz en kısa sürede dönüş yapsın.
      </p>

      {/* Invisible Honeypot Field for Spam Bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1 block text-[14px] font-bold text-[#212121]"
          >
            Adınız Soyadınız <span className="text-[#FF6000]">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız Soyadınız"
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[16px] text-[#212121] focus:border-[#FF6000] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="contact-phone"
            className="mb-1 block text-[14px] font-bold text-[#212121]"
          >
            Telefon Numaranız
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[16px] text-[#212121] focus:border-[#FF6000] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1 block text-[14px] font-bold text-[#212121]"
          >
            E-Posta Adresiniz
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@eposta.com"
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[16px] text-[#212121] focus:border-[#FF6000] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="contact-message"
          className="mb-1 block text-[14px] font-bold text-[#212121]"
        >
          Mesajınız <span className="text-[#FF6000]">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={3}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ürünler, sipariş veya teknik destek talebinizi yazın..."
          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[16px] text-[#212121] focus:border-[#FF6000] focus:outline-none"
        />
      </div>

      {status && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl p-3.5 text-[14px] font-bold ${
            status.ok
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          {status.ok ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <div className="mt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6000] px-6 py-3 text-[16px] font-bold text-white shadow-sm transition hover:bg-[#e55500] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          <span>{loading ? "Gönderiliyor..." : "Mesajı Gönder"}</span>
        </button>
      </div>
    </form>
  );
}
