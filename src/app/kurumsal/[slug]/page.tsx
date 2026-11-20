import React from "react";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

const LEGAL_PAGES: Record<string, { title: string; content: string[] }> = {
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    content: [
      "İşbu Mesafeli Satış Sözleşmesi, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca alıcı ile DİGİ GÜVENLİK TEKNOLOJİ A.Ş. arasında elektronik ortamda kurulmuştur.",
      "Sipariş verilen tüm ürünler 2 yıl resmi garanti kapsamında, faturalı ve orijinal kutusunda alıcının belirttiği teslimat adresine ücretsiz kargo ile sevk edilir.",
      "Alıcı, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içerisinde herhangi bir gerekçe göstermeksizin cayma, iade ve değişim hakkına sahiptir.",
      "Kapıda nakit ödeme, kapıda kredi kartı ile ödeme ve havale/EFT seçeneklerinde alıcının tüketici hakları eksiksiz olarak korunmaktadır.",
    ],
  },
  "kvkk-veri-koruma": {
    title: "KVKK ve Veri Koruma Aydınlatma Metni",
    content: [
      "DİGİ GÜVENLİK TEKNOLOJİ A.Ş. olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında müşteri bilgilerinizin güvenliğine en üst düzeyde önem veriyoruz.",
      "Sipariş formunda paylaştığınız ad, soyad, telefon ve adres bilgileriniz yalnızca siparişinizin hazırlanması, kargo teslimatı ve müşteri destek süreçleri amacıyla kullanılır; üçüncü şahıs veya kurumlarla kesinlikle paylaşılmaz.",
      "Tüm siparişlerimiz %100 güvenli paketleme standartlarıyla gönderilmekte olup, kargo paketi üzerinde ürün içeriğine dair hiçbir ibare yer almamaktadır.",
    ],
  },
  "kullanim-sartlari": {
    title: "Kullanım ve İade Şartları",
    content: [
      "Sitemizde satışa sunulan güvenlik kameraları, ses kayıt cihazları ve uzaktan duyma sistemleri; mülk güvenliği, iş yeri denetimi, kişisel güvenlik ve yasal çerçevedeki gözlem ihtiyaçları için tasarlanmıştır.",
      "Cihazların üçüncü kişilerin özel yaşamın ve kişisel verilerin korunmasını ihlal edecek biçimde izinsiz kullanılması 5237 sayılı Türk Ceza Kanunu ve 6698 sayılı KVKK uyarınca yasaktır; kullanım sorumluluğu alıcıya aittir.",
      "İade veya değişim talepleriniz için 0 216 825 10 57 numaralı müşteri destek hattımızdan veya WhatsApp hattımızdan (0 216 825 10 87) 7/24 destek alabilirsiniz.",
    ],
  },
};

export default async function KurumsalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settings = getSettings();
  const page = LEGAL_PAGES[slug] || LEGAL_PAGES["mesafeli-satis"];

  return (
    <div className="hb-container py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs sm:p-10">
        <span className="text-xs font-extrabold text-[#FF6000] uppercase">
          {settings.companyName} • Kurumsal Bilgilendirme
        </span>
        <h1 className="mt-1 text-2xl font-black text-gray-900">{page.title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700">
          {page.content.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
