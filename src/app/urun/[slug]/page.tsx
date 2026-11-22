import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Flame,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  FileText,
  Cpu,
  MessageSquare,
} from "lucide-react";
import {
  getProductBySlug,
  getProducts,
  getSettings,
} from "@/lib/db";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Ürün Bulunamadı" };
  }
  return {
    title: product.seoTitle,
    description: product.seoDescription,
    keywords: product.seoKeywords,
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const settings = getSettings();
  const allProducts = getProducts();

  // Related products in same category
  const relatedProducts = allProducts
    .filter(
      (p) => p.categorySlug === product.categorySlug && p.id !== product.id
    )
    .slice(0, 12);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: (product.images && product.images.length > 0 ? product.images : [product.image]).map((img) => `https://digiguvenlik.com${img}`),
    description: product.shortDescription,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: settings.siteName,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      url: `https://digiguvenlik.com/urun/${product.slug}`,
      priceCurrency: "TRY",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      seller: {
        "@type": "Organization",
        name: settings.companyName,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://digiguvenlik.com/" },
      { "@type": "ListItem", position: 2, name: product.category, item: `https://digiguvenlik.com/kategori/${product.categorySlug}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `https://digiguvenlik.com/urun/${product.slug}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <div className="hb-container space-y-10 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-[15px] font-medium text-[#7B7B7B]"
      >
        <Link href="/" className="hover:text-[#FF6000]">
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link href="/urunler" className="hover:text-[#FF6000]">
          Ürünler
        </Link>
        <span>/</span>
        <Link
          href={`/kategori/${product.categorySlug}`}
          className="text-[#484848] hover:text-[#FF6000] hover:underline"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 font-semibold text-[#212121]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Product Gallery & Specs Summary */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-36 space-y-5">
            <ProductGallery
              images={
                product.images && product.images.length > 0
                  ? product.images
                  : [product.image]
              }
              imageAlts={product.imageAlts}
              name={product.name}
              slug={product.slug}
              isBestseller={product.isBestseller}
              discountPercent={product.discountPercent}
            />

            {/* Technical Specs Quick Table under Gallery */}
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-2xs">
              <h3 className="mb-3 flex items-center gap-2 text-[16px] font-bold text-[#212121]">
                <Cpu className="h-4 w-4 text-[#FF6000]" />
                Öne Çıkan Teknik Özellikler
              </h3>
              <div className="divide-y divide-gray-100 text-[16px]">
                {product.specs.map((sp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="font-normal text-[#7B7B7B]">
                      {sp.label}
                    </span>
                    <span className="text-right font-semibold text-[#212121]">
                      {sp.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Buy Box & Quick Order Form */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-2xs sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/kategori/${product.categorySlug}`}
                className="text-[16px] font-bold text-[#FF6000] hover:underline"
              >
                Digi Güvenlik • {product.category}
              </Link>
              <span className="text-[15px] font-normal text-[#7B7B7B]">
                Ürün Kodu:{" "}
                <strong className="font-semibold text-[#484848]">{product.sku}</strong>
              </span>
            </div>

            <h1 className="mt-1.5 text-[20px] font-semibold leading-[26px] tracking-[-0.01em] text-[#212121] sm:text-[22px]">
              {product.name}
            </h1>

            {/* Rating & Stock Status */}
            <div className="mt-2.5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[16px] font-bold text-[#212121]">
                  {product.rating}
                </span>
                <div className="flex items-center text-[#F59F28]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#F59F28] text-[#F59F28]"
                    />
                  ))}
                </div>
                <a
                  href="#degerlendirmeler"
                  className="text-[15px] font-medium text-[#484848] hover:text-[#FF6000] hover:underline"
                >
                  ({product.reviewCount} Değerlendirme)
                </a>
              </div>

              <span className="inline-flex items-center gap-1 text-[15px] font-semibold text-[#2E7D32]">
                <CheckCircle2 className="h-4 w-4" />
                Stokta Hazır (Aynı Gün Kargo)
              </span>
            </div>

            <p className="mt-3 text-[16px] leading-[1.55] font-normal text-[#484848]">
              {product.shortDescription}
            </p>
          </div>

          {/* Client Interactive Buy Box & Inline Quick Order Form */}
          <ProductDetailClient product={product} settings={settings} />
        </div>
      </div>

      {/* %100 Unique SEO Description Sections (Accordion) */}
      <section className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-2xs sm:p-8">
        <div className="mb-5 flex items-center gap-2.5 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6000]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[#212121] sm:text-[22px]">
              Ürün Açıklaması ve Detaylı İnceleme
            </h2>
            <p className="text-[15px] font-normal text-[#7B7B7B]">
              {product.name} hakkında kullanım alanları, kurulum ve teknik detaylar
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {product.seoSections.map((sec, idx) => (
            <details
              key={idx}
              open={idx < 2}
              className="group overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] transition"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-3.5 text-[16px] font-bold text-[#212121] hover:text-[#FF6000]">
                <span>{sec.title}</span>
                <span className="text-[15px] font-semibold text-[#FF6000]">
                  Detay ▾
                </span>
              </summary>
              <div className="border-t border-[#E5E5E5] bg-white p-5">
                <div className="flex flex-col items-center gap-6">
                  <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-gray-200 bg-[#FAFAFA] shadow-md sm:max-w-[380px]">
                    <img
                      src={(product.images && product.images[idx % product.images.length]) || product.image}
                      alt={(product.imageAlts && product.imageAlts[idx % product.imageAlts.length]) || `${product.name} — ${sec.title}`}
                      loading="lazy"
                      className="aspect-[9/16] w-full object-contain"
                    />
                  </div>
                  <p className="w-full text-[16px] leading-[1.65] font-normal text-[#484848]">
                    {sec.content}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* Frequently Asked Questions (SSS) */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="mb-4 flex items-center gap-2 text-[18px] font-bold text-[#212121]">
            <HelpCircle className="h-5 w-5 text-[#FF6000]" />
            Sıkça Sorulan Sorular ({product.name})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {product.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4"
              >
                <p className="text-[16px] font-bold text-[#212121]">
                  {faq.question}
                </p>
                <p className="mt-1.5 text-[15px] leading-[1.55] font-normal text-[#484848]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section
        id="degerlendirmeler"
        className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-2xs sm:p-8"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#212121] sm:text-[22px]">
                Değerlendirmeler ({product.reviewCount})
              </h2>
              <p className="text-[15px] font-normal text-[#7B7B7B]">
                Ürünü satın alıp deneyimleyen gerçek müşterilerimizin yorumları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
            <div className="flex text-[#F59F28]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-[#F59F28] text-[#F59F28]"
                />
              ))}
            </div>
            <span className="text-[17px] font-bold text-[#212121]">
              {product.rating} / 5.0
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {product.reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex text-[#F59F28]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-[#F59F28] text-[#F59F28]"
                      />
                    ))}
                  </div>
                  <span className="text-[14px] font-normal text-[#9B9B9B]">
                    {rev.date}
                  </span>
                </div>
                <p className="mt-2.5 text-[16px] leading-[1.5] font-normal text-[#484848]">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-200/70 pt-2.5 text-[15px]">
                <span className="font-semibold text-[#212121]">
                  {rev.author} ({rev.city})
                </span>
                <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#2E7D32]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Ürünü Satın Aldı
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#212121]">
                Bu Ürünü İnceleyenler Bunlara da Baktı
              </h2>
            </div>
            <Link
              href={`/kategori/${product.categorySlug}`}
              className="text-[16px] font-bold text-[#FF6000] hover:underline"
            >
              Tümünü Gör →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
