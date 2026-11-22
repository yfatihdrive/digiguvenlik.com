import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCategories, getSettings } from "@/lib/db";
import { ShopProvider } from "@/context/ShopContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalWidgets from "@/components/GlobalWidgets";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
    title: {
      default: "Digi Güvenlik — Gizli Kamera, Dinleme Cihazları & Ses Kayıt Cihazları",
      template: "%s | Digi Güvenlik",
    },
    description:
      "Digi Güvenlik ses dinleme cihazları ve dinleme cihazları, 30 gün ses kayıt cihazları, WiFi IP kameralar ve kompakt güvenlik çözümleri. Tüm Türkiye ücretsiz kargo, gizli paketleme ve kapıda ödeme kolaylığı.",
    keywords: [
      "ses dinleme cihazları ve dinleme cihazları",
      "ses kayıt cihazı",
      "uzaktan ses dinleme cihazı",
      "wifi gizli kamera",
      "mini gizli kamera",
      "ortam ses dinleme cihazı",
      "digi güvenlik",
      "kapıda ödeme gizli kamera",
    ],
    icons: {
      icon: "/digi-guvenlik-icon.svg",
      shortcut: "/digi-guvenlik-icon.svg",
      apple: "/digi-guvenlik-logo.png",
    },
    metadataBase: new URL("https://digiguvenlik.com"),
    alternates: {
      canonical: "https://digiguvenlik.com",
    },
    twitter: {
      card: "summary_large_image",
      title: "Digi Güvenlik — Gizli Kamera, Dinleme Cihazları & Ses Kayıt Cihazları",
      description:
        "Ücretsiz kargo, özenli kapalı paketleme ve kapıda nakit/kredi kartı ödeme ayrıcalığı.",
      images: ["/digi-guvenlik-logo.png"],
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: "https://digiguvenlik.com",
      siteName: "Digi Güvenlik",
      title: "Digi Güvenlik — Güvenlik ve Akıllı İzleme Teknolojileri",
      description:
        "Ücretsiz kargo, gizli paketleme ve kapıda nakit/kredi kartı ödeme avantajıyla gizli kameralar ve ses kayıt cihazları.",
      images: [
        {
          url: "/digi-guvenlik-logo.png",
          width: 640,
          height: 160,
          alt: "Digi Güvenlik Logo",
        },
      ],
    },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSettings();
  const categories = getCategories();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: settings.companyName,
        url: "https://digiguvenlik.com",
        logo: "https://digiguvenlik.com/digi-guvenlik-logo.png",
        telephone: settings.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressCountry: "TR",
        },
      },
      {
        "@type": "WebSite",
        name: settings.siteName,
        url: "https://digiguvenlik.com",
        inLanguage: "tr-TR",
      },
    ],
  };

  return (
    <html lang="tr" className={inter.variable}>
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-[#F5F5F5] text-[16px] leading-[1.45] font-normal text-[#484848] antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-xl focus:bg-[#FF6000] focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-white focus:shadow-lg"
        >
          Ana İçeriğe Geç
        </a>
        <ShopProvider>
          <Header settings={settings} categories={categories} />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer settings={settings} categories={categories} />
          <GlobalWidgets settings={settings} />
        </ShopProvider>
      </body>
    </html>
  );
}
