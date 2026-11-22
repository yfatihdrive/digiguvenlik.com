import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Phone, MessageCircle, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular (SSS) | Gizli Kamera & Dinleme Cihazları",
  description:
    "Digi Güvenlik gizli kameralar, dinleme cihazları, ses kayıt cihazları, kapıda ödeme, gizli paketleme, kargo ve 24 ay garanti hakkında en çok sorulan sorular ve net cevapları.",
  alternates: { canonical: `${SITE_CONFIG.url}/sss` },
};

const FAQ_ITEMS = [
  {
    q: "Siparişlerde kapıda nakit veya kredi kartı ile ödeme yapabilir miyim?",
    a: "Evet. Digi Güvenlik'te tüm gizli kamera, dinleme cihazı ve ses kayıt cihazı siparişlerinizde kargonuzu kapıda teslim alırken nakit veya kredi kartı ile güvenle ödeme yapabilirsiniz. Havale/EFT ödemelerinde ayrıca %10 anında indirim uygulanır.",
  },
  {
    q: "Kargo paketinde ürün içeriği dışarıdan belli olur mu?",
    a: "Hayır. Tüm siparişler %100 gizli paketleme standartlarıyla hazırlanır. Kargo paketi ve sevk etiketi üzerinde ürün adı, görseli veya içeriğine dair hiçbir bilgi yer almaz.",
  },
  {
    q: "SIM kartlı uzaktan ses dinleme cihazları mesafe sınırı olmadan çalışır mı?",
    a: "Evet. GSM SIM kartlı dinleme cihazları cep telefonu şebekesi üzerinden çalıştığı için mesafe sınırı yoktur. Türkiye'nin veya dünyanın herhangi bir yerinden cihazdaki numarayı arayarak ortam sesini canlı dinleyebilirsiniz.",
  },
  {
    q: "30 gün ve 15 gün ses kayıt cihazları bilgisayarsız veya telefonda dinlenebilir mi?",
    a: "Evet. Ses kayıt cihazlarımız USB / Type-C üzerinden bilgisayar, Mac ve OTG destekli telefonlarda program kurulumu gerektirmeden WAV/MP3 formatında anında dinlenebilir.",
  },
  {
    q: "Wi-Fi gizli kameralar cep telefonundan canlı izlenebilir mi?",
    a: "Evet. Wi-Fi gizli kameralar ev veya ofis internetine bağlandıktan sonra iOS ve Android uygulaması üzerinden mesafe sınırı olmaksızın canlı izlenebilir, hareket algılandığında telefonunuza bildirim gönderir.",
  },
  {
    q: "Kargo ücreti ne kadar ve siparişim kaç günde teslim edilir?",
    a: "Tüm Türkiye'ye (81 il) kargo tamamen ücretsizdir. Saat 16:00'ya kadar verilen siparişler aynı gün kargoya teslim edilir ve genellikle 1–2 iş günü içinde adresinize ulaşır.",
  },
  {
    q: "Ürünler garantili mi? İade ve değişim hakkım var mı?",
    a: "Tüm ürünlerimiz 24 ay (2 yıl) Digi Güvenlik resmi garantili ve adınıza faturalıdır. Teslim tarihinden itibaren 14 gün içinde yasal cayma, iade ve değişim hakkınız bulunmaktadır.",
  },
  {
    q: "2. üründe %30 indirim ve Çarkı Çevir kuponu nasıl kullanılır?",
    a: "Sepetinize aynı üründen 2 adet veya farklı 2 ürün eklediğinizde 2. üründe %30 indirim otomatik olarak uygulanır. Ayrıca Çarkı Çevir ile kazandığınız 200–500 TL indirim kodunu tek tıkla sepetinize tanımlayabilirsiniz.",
  },
];

export default function SssPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const safeJson = JSON.stringify(faqJsonLd).replace(/</g, "\\u003c");

  return (
    <div className="hb-container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson }}
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6000]">
              <HelpCircle className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[13px] font-extrabold tracking-wide text-[#FF6000] uppercase">
                {SITE_CONFIG.name} • Destek Merkezi
              </p>
              <h1 className="text-[26px] font-extrabold text-[#212121] sm:text-[30px]">
                Sıkça Sorulan Sorular (SSS)
              </h1>
            </div>
          </div>

          <p className="mt-3 text-[16px] text-[#555555]">
            Gizli kameralar, dinleme cihazları, ses kayıt cihazları, kapıda ödeme, gizli paketleme ve garanti süreçleri hakkında merak edilen tüm soruların net yanıtları.
          </p>

          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                open={idx < 3}
                className="group overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA]"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-[16px] font-bold text-[#212121] hover:text-[#FF6000]">
                  <span>{item.q}</span>
                  <span className="shrink-0 text-[14px] font-bold text-[#FF6000]">
                    Yanıt ▾
                  </span>
                </summary>
                <div className="border-t border-[#E5E5E5] bg-white px-5 py-4 text-[16px] leading-relaxed text-[#484848]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 shrink-0 text-[#FF6000]" />
              <div>
                <p className="text-[16px] font-bold text-[#212121]">
                  Başka bir sorunuz mu var?
                </p>
                <p className="text-[14px] text-[#555555]">
                  7/24 teknik destek ve sipariş danışmanlığı için bize hemen ulaşın.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={`tel:${SITE_CONFIG.phoneHref}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#212121] px-4 py-2.5 text-[14px] font-bold text-white hover:bg-black"
              >
                <Phone className="h-4 w-4" />
                <span>{SITE_CONFIG.phone}</span>
              </a>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-[14px] font-bold text-white hover:bg-[#1ebe5d]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Destek</span>
              </a>
              <Link
                href="/urunler"
                className="inline-flex items-center rounded-xl bg-[#FF6000] px-4 py-2.5 text-[14px] font-bold text-white hover:bg-[#e55500]"
              >
                Ürünleri İncele
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
