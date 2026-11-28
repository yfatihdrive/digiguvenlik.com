import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { getBlogPosts } from "@/lib/blog";
import { SITE_CONFIG } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Güvenlik Teknolojileri & GPS Takip Blog Rehberi",
  description:
    "Gizli kameralar, 4G araç ve kişisel GPS takip cihazları, ses kayıt teknolojileri ve KVKK uyumlu kullanım hakkında uzman rehberleri.",
  alternates: { canonical: `${SITE_CONFIG.url}/blog` },
  openGraph: {
    title: "Digi Güvenlik Blog — Uzman İncelemeleri ve Seçim Rehberleri",
    description:
      "Doğru gizli kamera, dinleme ve GPS takip cihazı seçimi için kapsamlı teknik rehberler.",
    url: `${SITE_CONFIG.url}/blog`,
  },
};

const TOPIC_LABELS: Record<string, string> = {
  kategori_rehberi: "Kategori Rehberi",
  tek_urun_inceleme: "Ürün İncelemesi",
  urun_karsilastirma: "Karşılaştırma",
  nasil_secilir: "Nasıl Seçilir?",
  kullanim_ipuclari: "Kullanım İpuçları",
  sss_rehberi: "Soru & Cevap",
  mevsimsel_guncel: "Saha Rehberi",
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Digi Güvenlik Blog",
    url: `${SITE_CONFIG.url}/blog`,
    description:
      "Gizli kamera, GPS takip ve ses kayıt teknolojileri üzerine teknik makaleler.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_CONFIG.url}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="hb-container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mb-8 rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-2xs sm:p-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-[13px] font-extrabold text-[#FF6000]">
          <BookOpen className="h-4 w-4" />
          <span>TEKNİK REHBER &amp; İNCELEMELER</span>
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#212121] sm:text-[34px]">
          Digi Güvenlik Blog &amp; Uzman Rehberleri
        </h1>
        <p className="mt-2 max-w-3xl text-[16px] text-[#555555]">
          GPS araç takip cihazları, gizli kameralar, WiFi IP izleme sistemleri ve ses kayıt
          cihazları hakkında saha tecrübesine dayalı karşılaştırmalar, kurulum ipuçları ve
          seçim rehberleri.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-[18px] font-bold text-[#212121]">
            İlk günlük rehberlerimiz hazırlanıyor.
          </p>
          <p className="mt-2 text-[15px] text-[#666666]">
            Bu sırada tüm güvenlik ve GPS takip ürünlerimizi kataloğumuzdan inceleyebilirsiniz.
          </p>
          <Link
            href="/urunler"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-5 py-3 text-[15px] font-bold text-white hover:bg-[#e55500]"
          >
            <span>Ürünleri İncele</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-2xs transition hover:border-[#FF6000] hover:shadow-md"
            >
              {post.featuredImage && (
                <Link
                  href={`/blog/${post.slug}`}
                  className="aspect-video w-full overflow-hidden bg-gray-100"
                >
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    title={post.title}
                    width={post.featuredImage.width || 1200}
                    height={post.featuredImage.height || 675}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </Link>
              )}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-bold text-[#FF6000]">
                      {TOPIC_LABELS[post.topicType] || "Rehber"}
                    </span>
                    <span className="font-semibold text-[#7B7B7B]">{post.categoryName}</span>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-[19px] leading-snug font-extrabold text-[#212121] group-hover:text-[#FF6000]">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-2 line-clamp-3 text-[14px] text-[#555555]">
                    {post.tldrSummary || post.metaDescription}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[13px] text-[#7B7B7B]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingMinutes} dk okuma
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
