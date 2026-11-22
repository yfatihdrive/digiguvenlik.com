import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

const LEGAL_PAGES: Record<
  string,
  { title: string; description: string; draft?: boolean; content: string[] }
> = {
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    description: "6502 sayılı kanun kapsamında Mesafeli Satış Sözleşmesi metni.",
    draft: true,
    content: [
      "İşbu Mesafeli Satış Sözleşmesi, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca alıcı ile satıcı arasında elektronik ortamda kurulmuştur.",
      "Sipariş verilen tüm ürünler 2 yıl resmi garanti kapsamında, faturalı ve orijinal kutusunda alıcının belirttiği teslimat adresine ücretsiz kargo ile sevk edilir.",
      "Alıcı, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içerisinde herhangi bir gerekçe göstermeksizin cayma, iade ve değişim hakkına sahiptir.",
      "Kapıda nakit ödeme, kapıda kredi kartı ile ödeme ve havale/EFT seçeneklerinde alıcının tüketici hakları eksiksiz olarak korunmaktadır.",
    ],
  },
  "on-bilgilendirme": {
    title: "Ön Bilgilendirme Formu",
    description: "Sipariş öncesi tüketici ön bilgilendirme formu.",
    draft: true,
    content: [
      "Bu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun gereğince sipariş öncesinde alıcının ürün özellikleri, vergiler dâhil toplam satış fiyatı, kargo ve cayma hakkı konularında bilgilendirilmesi amacıyla düzenlenmiştir.",
      "Tüm ürün fiyatlarına KDV dâhildir ve Türkiye genelinde kargo tamamen ücretsizdir.",
      "Alıcı teslim tarihinden itibaren 14 gün içinde cayma hakkını kullanabilir. Cayma bildirimi destek hattımız veya e-posta adresimiz üzerinden iletilebilir.",
      "Eksik Şirket Bilgileri (EKSİK VERİ): Vergi Dairesi, Vergi Kimlik No, MERSİS No ve KEP adresi hukuki inceleme sonrası eklenecektir.",
    ],
  },
  "kvkk-veri-koruma": {
    title: "KVKK ve Veri Koruma Aydınlatma Metni",
    description: "6698 sayılı KVKK kapsamında kişisel veri işleme aydınlatma metni.",
    draft: true,
    content: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında müşteri bilgilerinizin güvenliğine en üst düzeyde önem veriyoruz.",
      "Sipariş formunda paylaştığınız ad, soyad, telefon ve adres bilgileriniz yalnızca siparişinizin hazırlanması, kargo teslimatı, faturalandırma ve müşteri destek süreçleri amacıyla işlenir; yasal zorunluluklar ve kargo teslimatı dışında üçüncü kişilerle paylaşılmaz.",
      "KVKK'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme veya itiraz etme haklarınızı iletişim kanallarımız üzerinden kullanabilirsiniz.",
    ],
  },
  "cerez-politikasi": {
    title: "Çerez Politikası",
    description: "Sitede kullanılan zorunlu ve tercih çerezleri hakkında bilgilendirme.",
    draft: true,
    content: [
      "Web sitemizde alışveriş sepetinin korunması, oturum güvenliği ve temel site işlevlerinin çalışması amacıyla zorunlu çerezler kullanılmaktadır.",
      "Analitik veya pazarlama amaçlı çerezler, yalnızca çerez onay çubuğundan açık rıza verdiğiniz takdirde etkinleştirilir; 'Reddet (Yalnızca Zorunlu)' seçeneğiyle dilediğiniz zaman yalnızca zorunlu çerezlerle devam edebilirsiniz.",
      "Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz.",
    ],
  },
  "kullanim-sartlari": {
    title: "Kullanım, Teslimat ve İade Şartları",
    description: "Teslimat koşulları, garanti ve 14 gün iade/değişim şartları.",
    draft: true,
    content: [
      "Sitemizde satışa sunulan güvenlik kameraları, ses kayıt cihazları ve uzaktan duyma sistemleri; mülk güvenliği, iş yeri denetimi, kişisel güvenlik ve yasal çerçevedeki gözlem ihtiyaçları için tasarlanmıştır.",
      "Cihazların üçüncü kişilerin özel yaşamının ve kişisel verilerin korunmasını ihlal edecek biçimde izinsiz kullanılması 5237 sayılı Türk Ceza Kanunu ve 6698 sayılı KVKK uyarınca yasaktır; yasal kullanım sorumluluğu alıcıya aittir.",
      "Teslimatlar saat 16:00'ya kadar verilen siparişlerde aynı gün ücretsiz kargo ile yapılmaktadır. İade ve değişim talepleriniz için 0 216 825 10 57 destek hattımızdan 7/24 yardım alabilirsiniz.",
    ],
  },
  hakkimizda: {
    title: "Hakkımızda",
    description: "Digi Güvenlik kurumsal tanıtım ve iletişim bilgileri.",
    draft: true,
    content: [
      "Digi Güvenlik, Türkiye genelinde bireysel ve kurumsal kullanıcılar için yeni nesil akıllı güvenlik kameraları, uzun pil ömürlü dijital ses kayıt cihazları ve uzaktan ses takip teknolojileri sunmaktadır.",
      "Tüm ürünlerimiz 24 ay resmi garanti, ücretsiz kargo, özenli kapalı paketleme ve kapıda nakit/kredi kartı ödeme güvencesiyle gönderilmektedir.",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) {
    return { title: "Sayfa Bulunamadı", robots: { index: false, follow: false } };
  }
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `https://digiguvenlik.com/kurumsal/${slug}` },
  };
}

export default async function KurumsalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) {
    notFound();
  }
  const settings = getSettings();

  return (
    <div className="hb-container py-10">
      <article className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-xs sm:p-10">
        <span className="text-[13px] font-extrabold text-[#FF6000] uppercase">
          {settings.companyName} • Kurumsal Bilgilendirme
        </span>
        <h1 className="mt-1 text-[26px] font-extrabold text-[#212121]">
          {page.title}
        </h1>

        {page.draft && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-[14px] font-semibold text-amber-900">
            TASLAK — Hukuki inceleme gerektirir (Canlıya çıkış öncesi avukat / mali müşavir onayı ile şirket VKN, MERSİS ve KEP bilgileri eklenmelidir).
          </div>
        )}

        <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#484848]">
          {page.content.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-100 pt-5 text-[14px] text-[#666666]">
          <p>
            <strong>Ünvan:</strong> {settings.companyName}
          </p>
          <p>
            <strong>Adres:</strong> {settings.address}
          </p>
          <p>
            <strong>Telefon:</strong> {settings.phone} • <strong>E-posta:</strong>{" "}
            {settings.email}
          </p>
        </div>
      </article>
    </div>
  );
}
