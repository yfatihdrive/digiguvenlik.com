import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#FF6000",
  width: "device-width",
  initialScale: 1,
};

const isStagingNoindex =
  process.env.ALLOW_INDEXING === "false" ||
  (Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production");

export const metadata: Metadata = {
    robots: isStagingNoindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "_Rnrot5c6XbteumuxIJl2JZsXjnwYxD2gvvWO2rh34o",
      yandex: process.env.YANDEX_SITE_VERIFICATION || undefined,
      other: {
        "msvalidate.01": process.env.BING_SITE_VERIFICATION || "46D2139FF4AF0866240419F21C7791F0",
      },
    },
    title: {
      default: "Digi Güvenlik — Gizli Kamera, Dinleme Cihazları & Ses Kayıt Cihazları",
      template: "%s | Digi Güvenlik",
    },
    description:
      "Digi Güvenlik ses dinleme cihazları ve dinleme cihazları, 30 gün ses kayıt cihazları, WiFi IP kameralar ve kompakt gizli kamera çözümleri. Tüm Türkiye ücretsiz kargo, gizli paketleme ve kapıda ödeme kolaylığı.",
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
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/digi-guvenlik-icon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    metadataBase: new URL("https://digiguvenlik.company"),
    alternates: {
      canonical: "https://digiguvenlik.company",
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
      url: "https://digiguvenlik.company",
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
        "@type": ["Organization", "ElectronicsStore"],
        name: settings.companyName,
        alternateName: settings.siteName,
        url: "https://digiguvenlik.company",
        logo: "https://digiguvenlik.company/digi-guvenlik-logo.png",
        image: "https://digiguvenlik.company/digi-guvenlik-logo.png",
        telephone: settings.phone,
        email: settings.email,
        priceRange: "₺₺",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Sultan Orhan, İlyasbey Cd. No:21/C",
          addressLocality: "Gebze",
          addressRegion: "Kocaeli",
          postalCode: "41400",
          addressCountry: "TR",
        },
      },
      {
        "@type": "WebSite",
        name: settings.siteName,
        url: "https://digiguvenlik.company",
        inLanguage: "tr-TR",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://digiguvenlik.company/urunler?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-xl focus:bg-[#FF6000] focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-white focus:shadow-lg"
        >
          Ana İçeriğe Geç
        </a>
        <ShopProvider>
          <Header settings={settings} categories={categories} />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
          <Footer settings={settings} categories={categories} />
          <GlobalWidgets settings={settings} />
        </ShopProvider>
      </body>
    </html>
  );
}
