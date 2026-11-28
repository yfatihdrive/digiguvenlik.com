import React from "react";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Truck,
  Award,
  PackageCheck,
} from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";
import CookieSettingsButton from "./CookieSettingsButton";

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
}

export default function Footer({ settings, categories }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-[#E5E5E5] bg-white text-[#484848]">
      {/* Top Trust Strip (Hepsiburada style) */}
      <div className="border-b border-gray-100 bg-[#FAFAFA] py-6">
        <div className="hb-container grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6000]/10 text-[#FF6000]">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#212121]">
                Yarın Kapında &amp; Ücretsiz Kargo
              </h4>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                Tüm Türkiye&apos;ye aynı gün kargo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#212121]">
                Kapıda Ödeme Güvencesi
              </h4>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                Önce teslim al, kapıda nakit/kartla öde
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#212121]">
                2 Yıl Resmi Garanti
              </h4>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                Adınıza faturalı &amp; garanti belgeli
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#212121]">
                %100 Gizli Paketleme
              </h4>
              <p className="text-[14px] font-normal text-[#7B7B7B]">
                Paket içeriği dışarıdan belli olmaz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="hb-container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Contact */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/digi-guvenlik-icon.svg"
                alt="Digi Güvenlik Logo"
                className="h-10 w-10 shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[22px] leading-none font-extrabold tracking-[-0.03em]">
                    <span className="text-[#FF6000]">Digi</span>
                    <span className="text-[#212121]"> Güvenlik</span>
                  </span>
                  <span className="rounded bg-[#FF6000] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    TÜRKİYE
                  </span>
                </div>
                <span className="text-[12px] font-semibold text-[#7B7B7B]">
                  digiguvenlik.company
                </span>
              </div>
            </Link>
            <p className="text-[15px] leading-[1.6] font-normal text-[#7B7B7B]">
              {settings.companyName} güvencesiyle profesyonel gizli kameralar,
              uzaktan ses dinleme sistemleri ve dijital ses kayıt teknolojileri.
            </p>
            <div className="space-y-2 pt-2 text-[15px]">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 font-semibold text-[#212121] hover:text-[#FF6000]"
              >
                <Phone className="h-4 w-4 text-[#FF6000]" />
                <span>Çağrı Merkezi: {settings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-[#2E7D32] hover:underline"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>WhatsApp Sipariş: {settings.whatsappDisplay}</span>
              </a>
              <p className="flex items-start gap-2 font-normal text-[#7B7B7B]">
                <MapPin className="h-4 w-4 shrink-0 text-[#FF6000]" />
                <span>{settings.address}</span>
              </p>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h3 className="mb-3 text-[16px] font-bold text-[#212121]">
              Popüler Kategoriler
            </h3>
            <ul className="space-y-2 text-[15px] font-normal text-[#484848]">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="hover:text-[#FF6000] hover:underline"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: More Categories */}
          <div>
            <h3 className="mb-3 text-[16px] font-bold text-[#212121]">
              Özel Koleksiyonlar
            </h3>
            <ul className="space-y-2 text-[15px] font-normal text-[#484848]">
              {categories.slice(7).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="hover:text-[#FF6000] hover:underline"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/urunler?filter=bestseller"
                  className="font-semibold text-[#FF6000] hover:underline"
                >
                  En Çok Satan Ürünler
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Membership */}
          <div>
            <h3 className="mb-3 text-[16px] font-bold text-[#212121]">
              Müşteri Rehberi &amp; Kurumsal
            </h3>
            <ul className="space-y-2 text-[15px] font-normal text-[#484848]">
              <li>
                <Link href="/siparis-takip" className="hover:text-[#FF6000]">
                  Sipariş Takibi ve Sorgulama
                </Link>
              </li>
              <li>
                <Link href="/giris" className="hover:text-[#FF6000]">
                  Üye Girişi / Yeni Üyelik
                </Link>
              </li>
              <li>
                <Link href="/hesabim" prefetch={false} className="hover:text-[#FF6000]">
                  Hesabım ve Siparişlerim
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-[#FF6000]">
                  Sıkça Sorulan Sorular (SSS)
                </Link>
              </li>
              <li>
                <Link href="/kampanyalar" className="font-semibold text-[#FF6000] hover:underline">
                  Kampanyalar &amp; Fırsatlar
                </Link>
              </li>
              <li>
                <Link href="/blog" className="font-semibold text-[#212121] hover:text-[#FF6000]">
                  Blog &amp; Teknik Rehberler
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/hakkimizda" className="hover:text-[#FF6000]">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/on-bilgilendirme" className="hover:text-[#FF6000]">
                  Ön Bilgilendirme Formu
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/mesafeli-satis" className="hover:text-[#FF6000]">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/gizlilik-politikasi" className="hover:text-[#FF6000]">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/teslimat-kosullari" className="hover:text-[#FF6000]">
                  Teslimat Koşulları
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/cerez-politikasi" className="hover:text-[#FF6000]">
                  Çerez Politikası
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
              <li>
                <Link href="/kurumsal/kvkk-veri-koruma" className="hover:text-[#FF6000]">
                  KVKK ve Veri Koruma Politikası
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/kullanim-sartlari" className="hover:text-[#FF6000]">
                  Kullanım ve İade Şartları
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#FF6000]">
                  İletişim &amp; Destek Merkezi
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rainbow Strip + Copyright */}
      <div className="grid h-1 w-full grid-cols-5">
        <div className="bg-[#FF6000]" />
        <div className="bg-[#49C7ED]" />
        <div className="bg-[#7723DB]" />
        <div className="bg-[#57B900]" />
        <div className="bg-[#F59F28]" />
      </div>
      <div className="bg-gray-900 py-4 text-center text-xs text-gray-400">
        <div className="hb-container flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>© 2026 {settings.companyName}. Tüm hakları saklıdır.</p>
          <p className="text-[14px] text-gray-500">
            Güvenli Alışveriş • Kapıda Nakit &amp; Kredi Kartı • Ücretsiz Kargo
          </p>
        </div>
      </div>
    </footer>
  );
}
