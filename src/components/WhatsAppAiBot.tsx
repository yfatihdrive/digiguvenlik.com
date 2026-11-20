"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  CheckCheck,
  Sparkles,
  ExternalLink,
  Headphones,
} from "lucide-react";

interface ChatProductCard {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  image: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  cards?: ChatProductCard[];
  waLink?: string;
  showWhatsAppCta?: boolean;
}

const BOT_WA_INTL = "902168251057";
const BOT_WA_DISPLAY = "0 216 825 10 57";

const QUICK_REPLIES = [
  "🔥 En çok satanlar",
  "🎙️ Uzaktan ses duyma cihazı",
  "💳 Kapıda ödeme & kargo",
  "🎁 200 TL indirim kuponu",
  "🛒 Sipariş vermek istiyorum",
  "👨‍💼 Temsilciye bağlan",
];

function nowTime() {
  return new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTL(n: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
    Math.round(n)
  );
}

export default function WhatsAppAiBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: `Merhaba! 👋 Ben Digi Güvenlik WhatsApp Yapay Zeka Asistanı.\n\nÜrünlerimiz, fiyatlar, kurulum, kapıda ödeme veya kargo hakkında her şeyi buradan sorabilirsiniz.\n\nSipariş vermek veya canlı temsilcimize bağlanmak isterseniz sizi hemen **${BOT_WA_DISPLAY}** WhatsApp hattımıza aktarabilirim.`,
      time: nowTime(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const currentSlug = pathname?.startsWith("/urun/")
    ? pathname.replace("/urun/", "").split("/")[0]
    : "";

  const sendMessage = async (textToSend?: string) => {
    const msg = (textToSend ?? input).trim();
    if (!msg || typing) return;

    setInput("");
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: msg,
      time: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          currentSlug,
        }),
      });
      const data = await res.json();

      // Short natural typing delay for authentic WhatsApp feel
      await new Promise((r) => setTimeout(r, 420));

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text:
          data.reply ||
          `Size yardımcı olmak için buradayım! Dilerseniz ${BOT_WA_DISPLAY} WhatsApp hattımızdan canlı temsilcimize bağlanabilirsiniz.`,
        time: nowTime(),
        cards: data.cards || [],
        waLink: data.waLink,
        showWhatsAppCta: data.showWhatsAppCta,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: `Bağlantıda kısa bir sorun oluştu. Doğrudan ${BOT_WA_DISPLAY} WhatsApp hattımızdan temsilcimize ulaşabilirsiniz.`,
          time: nowTime(),
          showWhatsAppCta: true,
          waLink: `https://wa.me/${BOT_WA_INTL}?text=${encodeURIComponent(msg)}`,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const renderFormattedText = (text: string) => {
    // Simple bold (**...**) and newline rendering
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      return (
        <p key={i} className={i > 0 ? "mt-1.5" : ""}>
          {parts.map((part, idx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={idx} className="font-bold text-gray-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={idx}
                  className="rounded bg-orange-100 px-1.5 py-0.5 font-mono font-bold text-[#FF6000]"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const directWaUrl = `https://wa.me/${BOT_WA_INTL}?text=${encodeURIComponent(
    currentSlug
      ? `Merhaba, sitenizdeki "${currentSlug}" ürünü hakkında bilgi almak ve sipariş vermek istiyorum.`
      : "Merhaba, sitenizden ulaşıyorum. Ürünler hakkında bilgi almak ve sipariş vermek istiyorum."
  )}`;

  return (
    <div className="fixed right-3 bottom-3 z-50 flex flex-col items-end sm:right-5 sm:bottom-5">
      {/* Authentic WhatsApp AI Chat Window */}
      {open && (
        <div className="mb-3 flex h-[80dvh] max-h-[640px] w-[calc(100vw-1.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#EFEAE2] shadow-2xl">
          {/* WhatsApp Header (#075E54) */}
          <div className="flex items-center justify-between bg-[#075E54] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
                <MessageCircle className="h-6 w-6 fill-white text-[#25D366]" />
                <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[#075E54] bg-emerald-400" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold">
                    Digi Güvenlik WhatsApp AI
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <p className="text-[12px] text-emerald-100">
                  {typing
                    ? "yazıyor..."
                    : `Çevrimiçi • ${BOT_WA_DISPLAY}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Canlı WhatsApp Temsilcisine Bağlan"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-[#25D366]"
              >
                <Phone className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sohbeti kapat"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Direct Live Representative Top Strip */}
          <a
            href={directWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#128C7E] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#0e7468]"
          >
            <span className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4" />
              Canlı Temsilci / WhatsApp Sipariş: {BOT_WA_DISPLAY}
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>

          {/* Messages Scroll Area */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug shadow-xs ${
                    m.sender === "user"
                      ? "rounded-tr-none bg-[#D9FDD3] text-gray-900"
                      : "rounded-tl-none bg-white text-gray-800"
                  }`}
                >
                  <div>{renderFormattedText(m.text)}</div>

                  {/* Product Recommendation Cards inside WhatsApp Bubble */}
                  {m.cards && m.cards.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {m.cards.map((c) => (
                        <Link
                          key={c.id}
                          href={`/urun/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-2 transition hover:border-[#FF6000] hover:bg-orange-50/40"
                        >
                          <img
                            src={c.image}
                            alt={c.name}
                            className="h-16 w-11 shrink-0 rounded-lg border border-gray-200 bg-white object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[13px] font-bold text-gray-900">
                              {c.name}
                            </p>
                            <div className="mt-0.5 flex items-baseline gap-1.5">
                              <span className="text-[12px] text-gray-400 line-through">
                                {formatTL(c.oldPrice)} ₺
                              </span>
                              <span className="text-[14px] font-black text-[#FF6000]">
                                {formatTL(c.price)} TL
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Handoff Button to 0 216 825 10 57 WhatsApp */}
                  {m.showWhatsAppCta && (
                    <a
                      href={m.waLink || directWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-[13px] font-extrabold text-white shadow-xs transition hover:bg-[#1ebe5d]"
                    >
                      <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
                      <span>WhatsApp Temsilcisine Bağlan ({BOT_WA_DISPLAY})</span>
                    </a>
                  )}

                  <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-gray-400">
                    <span>{m.time}</span>
                    {m.sender === "user" && (
                      <CheckCheck className="h-3.5 w-3.5 text-[#53BDEB]" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-tl-none bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 shadow-xs">
                  Asistan yazıyor...
                </div>
              </div>
            )}
          </div>

          {/* Quick Reply Chips */}
          <div className="flex gap-1.5 overflow-x-auto bg-[#F0F2F5] px-3 py-2 no-scrollbar border-t border-gray-200">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                type="button"
                onClick={() => sendMessage(qr)}
                className="shrink-0 cursor-pointer rounded-full border border-[#128C7E]/30 bg-white px-3 py-1 text-[12px] font-bold text-[#075E54] shadow-2xs transition hover:bg-[#25D366] hover:text-white"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* WhatsApp Message Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 bg-[#F0F2F5] px-3 py-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ürün veya sipariş sorunuzu yazın..."
              className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-[#25D366] focus:outline-none"
            />
            <button
              type="submit"
              disabled={typing || !input.trim()}
              aria-label="Gönder"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:bg-[#1ebe5d] disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating WhatsApp AI Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setUnread(0);
        }}
        className="group relative flex cursor-pointer items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl shadow-emerald-600/35 transition-all hover:scale-105 hover:bg-[#1ebe5d]"
      >
        {unread > 0 && !open && (
          <span className="absolute -top-1.5 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6000] text-[12px] font-extrabold text-white shadow-md">
            {unread}
          </span>
        )}
        <MessageCircle className="h-6 w-6 fill-white text-[#25D366]" />
        <div className="text-left leading-tight">
          <p className="flex items-center gap-1 text-[12px] font-bold uppercase opacity-95">
            <span>WhatsApp Canlı Asistan</span>
          </p>
          <p className="text-[15px] font-black tracking-tight">
            {BOT_WA_DISPLAY}
          </p>
        </div>
      </button>
    </div>
  );
}
