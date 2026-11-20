import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Truck,
  ShieldCheck,
  Award,
  PackageCheck,
  ArrowRight,
  Phone,
  MessageCircle,
  CheckCircle2,
  Mic,
  Radio,
  Wifi,
  Shield,
  Clock,
  PenTool,
  Key,
  Briefcase,
} from "lucide-react";
import { getCategories, getProducts, getSettings, formatPrice } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = getSettings();
  const categories = getCategories();
  const allProducts = getProducts();

  const bestsellers = allProducts.filter((p) => p.isBestseller).slice(0, 12);
  const superDeals = allProducts.slice(0, 12);
  const audioProducts = allProducts
    .filter(
      (p) =>
        p.categorySlug === "ses-kayit-cihazlari" ||
        p.categorySlug === "duyma-cihazlari"
    )
    .slice(0, 12);
  const wifiProducts = allProducts
    .filter(
      (p) =>
        p.categorySlug === "wifi-kameralar" ||
        p.categorySlug === "guvenlik-kameralar"
    )
    .slice(0, 12);

  const heroDeal = allProducts[0];

  const getCategoryIcon = (slug: string) => {
    if (slug.includes("ses-kayit")) return <Mic className="h-6 w-6" />;
    if (slug.includes("duyma")) return <Radio className="h-6 w-6" />;
    if (slug.includes("wifi")) return <Wifi className="h-6 w-6" />;
    if (slug.includes("saat")) return <Clock className="h-6 w-6" />;
    if (slug.includes("kalem")) return <PenTool className="h-6 w-6" />;
    if (slug.includes("anahtar")) return <Key className="h-6 w-6" />;
    if (slug.includes("aksesuar")) return <Briefcase className="h-6 w-6" />;
    return <Shield className="h-6 w-6" />;
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section (Hepsiburada Campaign Style) */}
      <section className="bg-gradient-to-b from-orange-100/70 via-orange-50/30 to-transparent pt-5">
        <div className="hb-container">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Main Campaign Banner */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6000] via-[#f25600] to-[#c93b00] p-6 text-white shadow-lg sm:p-9 lg:col-span-8 xl:col-span-9">
              <div className="relative z-10 max-w-2xl space-y-3.5">
                <div className="inline-flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[14px] font-bold tracking-wide text-[#FF6000] uppercase shadow-2xs">
                    ÖNCE TESLİM AL SONRA ÖDEME YAP
                  </span>
                  <span className="rounded-full bg-black/25 px-3 py-1 text-[14px] font-semibold text-white backdrop-blur-xs">
                    81 İle Ücretsiz &amp; Güvenli Kargo
                  </span>
                </div>

                <h1 className="text-[24px] font-bold leading-[1.22] tracking-[-0.02em] text-white sm:text-[34px]">
                  Yeni Nesil Akıllı Güvenlik Kameraları &amp; Profesyonel Ses Kayıt Çözümleri
                </h1>

                <p className="text-[16px] leading-[1.5] font-normal text-orange-50 sm:text-[16px]">
                  Mesafe sınırı olmaksızın kesintisiz erişim sunan SIM kartlı ses takip sistemleri, 30 güne kadar uzun pil ömürlü ses kayıt çözümleri ve kablosuz Wi-Fi güvenlik kameralarında{" "}
                  <strong className="font-semibold underline decoration-amber-300 decoration-2">
                    kapıda nakit veya kredi kartı ile güvenli ödeme ayrıcalığı.
                  </strong>
                </p>

              </div>

              {/* Decorative Right Visual on Desktop */}
              {heroDeal && (
                <div className="mt-6 hidden items-center justify-end xl:absolute xl:top-1/2 xl:right-6 xl:mt-0 xl:flex xl:-translate-y-1/2">
                  <div className="flex h-60 w-60 items-center justify-center rounded-full bg-white/95 p-6 shadow-2xl">
                    <img
                      src={heroDeal.image}
                      alt={heroDeal.name}
                      className="h-full w-full object-contain drop-shadow-md"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Spotlight Card: Günün Süper Teklifi */}
            {heroDeal && (
              <div className="flex flex-col justify-between rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm lg:col-span-4 xl:col-span-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded bg-[#FF6000] px-2.5 py-1 text-[14px] font-bold text-white">
                      <Sparkles className="h-3.5 w-3.5" /> Süper Fiyat, Süper Teklif
                    </span>
                    <span className="rounded bg-[#FA0000]/10 px-2 py-0.5 text-[14px] font-bold text-[#FA0000]">
                      %{heroDeal.discountPercent} İndirim
                    </span>
                  </div>

                  <Link
                    href={`/urun/${heroDeal.slug}`}
                    className="my-3 block w-full overflow-hidden rounded-xl bg-[#050b16] shadow-xs"
                  >
                    <img
                      src={heroDeal.image}
                      alt={heroDeal.name}
                      className="aspect-[9/14] w-full object-cover object-center transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </Link>

                  <Link href={`/urun/${heroDeal.slug}`}>
                    <h2 className="text-[16px] leading-[24px] font-semibold text-[#212121] hover:text-[#FF6000]">
                      {heroDeal.name}
                    </h2>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-[15px] leading-[22px] text-[#7B7B7B]">
                    {heroDeal.shortDescription}
                  </p>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-baseline justify-between rounded-lg bg-[#F5F5F5] px-3.5 py-2">
                    <div>
                      <span className="block text-[15px] text-[#9B9B9B] line-through">
                        {formatPrice(heroDeal.oldPrice)} TL
                      </span>
                      <span className="text-[24px] leading-tight font-bold text-[#212121]">
                        {formatPrice(heroDeal.price)}{" "}
                        <span className="text-[16px] font-bold">TL</span>
                      </span>
                    </div>
                    <span className="rounded bg-[#EBF7E5] px-2 py-1 text-[13px] font-bold text-[#2E7D32]">
                      Ücretsiz Kargo
                    </span>
                  </div>

                  <Link
                    href={`/urun/${heroDeal.slug}#hizli-siparis`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6000] py-2.5 text-[16px] font-bold text-white transition hover:bg-[#e55500]"
                  >
                    <span>Hemen Sipariş Ver</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4 Trust Badges Strip */}
      <section className="hb-container">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF6000]">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#212121]">
                Aynı Gün Ücretsiz Kargo
              </h3>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                81 İle Hızlı &amp; Güvenli Gönderim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#212121]">
                Kapıda Ödeme İmkanı
              </h3>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                Kapıda Nakit veya Kredi Kartı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#212121]">
                %100 Güvenli Paketleme
              </h3>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                Kutu içeriği dışarıdan görünmez
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#212121]">
                2 Yıl Resmi Garanti
              </h3>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                Türkçe Kılavuz &amp; Canlı Destek
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Grid (Hepsiburada Visual Bubbles) */}
      <section className="hb-container">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#212121] sm:text-[24px]">
              Kategorileri Keşfet
            </h2>
            <p className="text-[15px] font-normal text-[#7B7B7B]">
              İhtiyacınız olan güvenlik veya kayıt çözümünü tek tıkla filtreleyin
            </p>
          </div>
          <Link
            href="/urunler"
            className="text-[16px] font-bold text-[#FF6000] hover:underline"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-12">
          {categories
            .filter((c) => c.count > 0)
            .slice(0, 12)
            .map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                className="group flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white p-4 text-center shadow-2xs transition hover:border-[#FF6000] hover:shadow-sm"
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#FF6000] transition group-hover:bg-[#FF6000] group-hover:text-white">
                  {getCategoryIcon(cat.slug)}
                </div>
                <span className="line-clamp-1 text-[16px] font-semibold text-[#212121] group-hover:text-[#FF6000]">
                  {cat.name}
                </span>
                <span className="mt-0.5 text-[14px] font-normal text-[#9B9B9B]">
                  {cat.count} Ürün
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* EN ÇOK SATAN ÜRÜNLER */}
      <section className="hb-container">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6000] text-white">
              <Flame className="h-4 w-4 fill-white" />
            </span>
            <div>
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#212121] sm:text-[24px]">
                En Çok Satan Ürünler
              </h2>
              <p className="text-[15px] font-normal text-[#7B7B7B]">
                Müşterilerimizin en çok tercih ettiği, kapıda ödemeli popüler modeller
              </p>
            </div>
          </div>
          <Link
            href="/urunler"
            className="text-[16px] font-bold text-[#FF6000] hover:underline"
          >
            Tümünü Gör ({allProducts.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SÜPER FİYAT, SÜPER TEKLİF (Audio & Listening Showcase) */}
      <section className="hb-container">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-2xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6000] text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#212121] sm:text-[24px]">
                  Süper Fiyat, Süper Teklif — Ses Kayıt &amp; Duyma Cihazları
                </h2>
                <p className="text-[15px] font-normal text-[#7B7B7B]">
                  SIM kartlı mesafe sınırı olmayan duyma cihazları ve 30 güne varan ses kayıt çözümleri
                </p>
              </div>
            </div>
            <Link
              href="/kategori/ses-kayit-cihazlari"
              className="inline-flex items-center gap-1 text-[16px] font-bold text-[#FF6000] hover:underline"
            >
              <span>Tümü</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {audioProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* WIFI KAMERALAR & GÜVENLİK KAMERALARI SHOWCASE */}
      <section className="hb-container">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#212121] sm:text-[24px]">
              Kablosuz Wi-Fi &amp; Güvenlik Kameraları
            </h2>
            <p className="text-[15px] font-normal text-[#7B7B7B]">
              Cep telefonundan 7/24 canlı izlenebilen Full HD &amp; 4K güvenlik kameraları
            </p>
          </div>
          <Link
            href="/kategori/wifi-kameralar"
            className="text-[16px] font-bold text-[#FF6000] hover:underline"
          >
            Tüm Wi-Fi Kameraları Gör →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {wifiProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-7 py-3.5 text-[16px] font-bold text-white shadow-md transition hover:bg-[#e55500]"
          >
            <span>Tüm {allProducts.length} Ürünü Listele ve Karşılaştır</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Customer Support Banner (0 216 825 10 87) */}
      <section className="hb-container">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-[#212121] p-6 text-white shadow-lg sm:flex-row sm:p-8">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[14px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> TÜRKÇE TEKNİK DESTEK &amp; TELEFONLA SİPARİŞ
            </span>
            <h2 className="text-[22px] font-bold text-white sm:text-[24px]">
              Karar Veremediniz mi? Uzman Ekibimiz Yardımcı Olsun!
            </h2>
            <p className="max-w-2xl text-[16px] font-normal text-gray-300">
              İhtiyacınıza en uygun modeli seçmek, kapıda ödeme ile hemen sipariş oluşturmak veya kurulum desteği almak için bize ulaşın.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                "Merhaba, ürünleriniz hakkında bilgi almak ve sipariş vermek istiyorum."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-[16px] font-bold text-white shadow-md transition hover:bg-[#1ebe5d]"
            >
              <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
              <span>WhatsApp: {settings.whatsappDisplay}</span>
            </a>

            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-5 py-3 text-[16px] font-bold text-white transition hover:bg-gray-700"
            >
              <Phone className="h-4 w-4 text-[#FF6000]" />
              <span>Hemen Ara: {settings.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* %100 Original SEO Guide & Knowledge Base */}
      <section className="hb-container">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8">
          <span className="text-[14px] font-bold tracking-wider text-[#FF6000] uppercase">
            Digi Güvenlik Alışveriş Rehberi
          </span>
          <h2 className="mt-1 text-[20px] font-bold text-[#212121] sm:text-[22px]">
            Güvenlik Amaçlı Ses Duyma Cihazları, Ses Kayıt Cihazları ve Wi-Fi Kameralar Hakkında Merak Edilenler
          </h2>
          <p className="mt-1.5 text-[16px] leading-[1.6] text-[#484848]">
            Ev, ofis, depo, araç veya bakım süreçlerinde doğru güvenlik teknolojisini seçmek hem bütçenizi korur hem de kesintisiz performans almanızı sağlar. Aşağıdaki rehber başlıklarımızdan ihtiyacınıza en uygun kategoriyi belirleyebilirsiniz.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <details
              open
              className="group rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4"
            >
              <summary className="cursor-pointer list-none text-[16px] font-bold text-[#212121]">
                1. GSM Tabanlı Uzaktan Ses Duyma Cihazı Nasıl Çalışır?
              </summary>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#484848]">
                GSM tabanlı güvenlik amaçlı ses duyma cihazları, içerisine yerleştirilen standart bir SIM kart (Turkcell, Vodafone veya Türk Telekom) aracılığıyla hücresel şebekeye bağlanır. Wi-Fi bağlantısına ihtiyaç duymadan, Türkiye&apos;nin veya dünyanın neresinde olursanız olun cihazın içindeki hattı telefonunuzdan arayarak ortam sesini canlı ses takibi yapmanıza olanak tanır. VOX ses sensörlü modeller ise ortamda konuşma algıladığında sizi otomatik olarak arar.
              </p>
            </details>

            <details
              open
              className="group rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4"
            >
              <summary className="cursor-pointer list-none text-[16px] font-bold text-[#212121]">
                2. Profesyonel Ses Kayıt Cihazı Seçerken Nelere Dikkat Edilmeli?
              </summary>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#484848]">
                Uzun süreli arşivleme gereken senaryolarda cihazın pil kapasitesi, dahili hafızası ve VOX (ses aktivasyonlu kayıt) özelliği belirleyicidir. 15 gün ve 30 gün ses kayıt cihazları, sessiz anlarda uyku modunda kalarak yalnızca ortamda ses olduğunda kayıt yapar. USB bellek, kalem, çakmak veya powerbank formundaki modeller günlük ortamlarda dikkat çekmeden yüksek netlikli DSP mikrofon kaydı sunar.
              </p>
            </details>

            <details className="group rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <summary className="cursor-pointer list-none text-[16px] font-bold text-[#212121]">
                3. Kablosuz Wi-Fi IP Kameralar ile Canlı İzleme Avantajı
              </summary>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#484848]">
                Wi-Fi güvenlik kameraları; ampul, masa saati, duvar saati, priz veya adaptör gibi doğal formlarda tasarlanır. iOS ve Android uyumlu Türkçe mobil uygulaması sayesinde canlı görüntüyü anlık izleyebilir, hareket algılandığında cep telefonunuza bildirim alabilir ve Micro SD karttaki geçmiş kayıtları uzaktan izleyebilirsiniz.
              </p>
            </details>

            <details className="group rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <summary className="cursor-pointer list-none text-[16px] font-bold text-[#212121]">
                4. Kapıda Ödeme, Güvenli Paketleme ve Garanti Süreci
              </summary>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#484848]">
                Digi Güvenlik üzerinden oluşturduğunuz tüm siparişler ücretsiz kargo ve güvenli paketleme prensibiyle gönderilir; paket üzerinde ürün içeriğine dair hiçbir ibare bulunmaz. Kapıda nakit veya kapıda kredi kartı ile ödeme yapabilir, Havale/EFT ödemelerinde ise sepette anında %10 indirim kazanabilirsiniz.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
