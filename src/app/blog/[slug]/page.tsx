import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, UserCheck, HelpCircle, ArrowLeft, Sparkles } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";
import { getProducts } from "@/lib/db";
import { SITE_CONFIG } from "@/config/site";
import BlogProductCard from "@/components/BlogProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Makale Bulunamadı" };

  const ogImg = post.featuredImage ? `${SITE_CONFIG.url}${post.featuredImage.url}` : undefined;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: [post.primaryKeyword, ...(post.secondaryKeywords || [])],
    alternates: { canonical: `${SITE_CONFIG.url}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.metaTitle,
      description: post.metaDescription,
      url: `${SITE_CONFIG.url}/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      images: ogImg ? [{ url: ogImg, width: 1200, height: 675, alt: post.featuredImage?.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: ogImg ? [ogImg] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const allProducts = getProducts();
  const productBySlug = new Map(allProducts.map((p) => [p.slug, p]));
  const relatedPosts = getBlogPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  // [[PRODUCT_CARD:slug]] yer tutucularını gerçek etkileşimli ürün kartlarına böl
  const segments = post.contentHtml.split(/(\[\[PRODUCT_CARD:[a-z0-9\-]+\]\])/gi);

  return (
    <article className="hb-container py-8">
      {post.schemaJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(post.schemaJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[14px] text-[#7B7B7B]">
          <Link href="/" className="hover:text-[#FF6000]">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#FF6000]">
            Blog
          </Link>
          <span>/</span>
          <Link href={`/kategori/${post.categorySlug}`} className="hover:text-[#FF6000]">
            {post.categoryName}
          </Link>
        </nav>

        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-2xs sm:p-10">
          {/* Header & Meta */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Link
              href={`/kategori/${post.categorySlug}`}
              className="rounded-full bg-orange-100 px-3 py-1 text-[13px] font-extrabold text-[#FF6000]"
            >
              {post.categoryName}
            </Link>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[13px] font-semibold text-slate-700">
              {post.wordCount} kelime
            </span>
          </div>

          <h1 className="text-[28px] leading-tight font-black tracking-tight text-[#212121] sm:text-[36px]">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-5 border-b border-gray-100 pb-5 text-[14px] text-[#666666]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#212121]">
              <UserCheck className="h-4 w-4 text-[#FF6000]" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#FF6000]" />
              Yayın: {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
              {post.updatedAt && post.updatedAt !== post.publishedAt
                ? ` · Güncelleme: ${new Date(post.updatedAt).toLocaleDateString("tr-TR")}`
                : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#FF6000]" />
              {post.readingMinutes} dk okuma
            </span>
          </div>

          {/* Öne Çıkan Görsel (Eager, Google Images Optimize) */}
          {post.featuredImage && (
            <figure className="my-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <img
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                title={post.featuredImage.alt}
                width={post.featuredImage.width || 1200}
                height={post.featuredImage.height || 675}
                loading="eager"
                className="h-auto w-full object-cover"
              />
              {post.featuredImage.caption && (
                <figcaption className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-center text-xs font-medium text-gray-600">
                  {post.featuredImage.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* GEO "Kısaca" Özeti */}
          {post.tldrSummary && (
            <div className="my-6 rounded-2xl border-l-4 border-[#FF6000] bg-orange-50/70 p-5">
              <div className="mb-1 flex items-center gap-1.5 text-[14px] font-extrabold text-[#FF6000] uppercase">
                <Sparkles className="h-4 w-4" />
                <span>Kısaca (Hızlı Özet)</span>
              </div>
              <p className="text-[16px] leading-relaxed font-medium text-[#212121]">
                {post.tldrSummary}
              </p>
            </div>
          )}

          {/* Makale İçeriği + Gömülü Etkileşimli Ürün Satın Alma Kartları */}
          <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-[#212121] prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-[23px] prose-h3:mt-5 prose-h3:text-[19px] prose-p:leading-relaxed prose-p:text-[#334155] prose-a:font-semibold prose-a:text-[#FF6000] prose-table:my-6 prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-slate-200 prose-td:p-3">
            {segments.map((seg, i) => {
              const cardMatch = seg.match(/^\[\[PRODUCT_CARD:([a-z0-9\-]+)\]\]$/i);
              if (cardMatch) {
                const prod = productBySlug.get(cardMatch[1]);
                return prod ? <BlogProductCard key={`card-${i}`} product={prod} /> : null;
              }
              return <div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: seg }} />;
            })}
          </div>

          {/* SSS Bölümü */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-10 border-t border-gray-200 pt-8">
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-[#FF6000]" />
                <h2 className="text-[24px] font-extrabold text-[#212121]">
                  Sıkça Sorulan Sorular
                </h2>
              </div>
              <div className="space-y-3">
                {post.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-200 bg-[#FAFAFA] p-4"
                  >
                    <h3 className="text-[17px] font-bold text-[#212121]">{faq.question}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[#484848]">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[15px] font-bold text-[#484848] hover:text-[#FF6000]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Tüm Blog Rehberlerine Dön</span>
            </Link>
            <Link
              href={`/kategori/${post.categorySlug}`}
              className="rounded-xl bg-[#FF6000] px-5 py-2.5 text-[15px] font-extrabold text-white hover:bg-[#e55500]"
            >
              {post.categoryName} Modellerini İncele →
            </Link>
          </div>
        </div>

        {/* İlgili Makaleler */}
        {relatedPosts.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-[22px] font-extrabold text-[#212121]">
              İlginizi Çekebilecek Diğer Rehberler
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-2xs transition hover:border-[#FF6000]"
                >
                  <span className="text-[12px] font-bold text-[#FF6000]">{rp.categoryName}</span>
                  <h3 className="mt-1 line-clamp-2 text-[16px] font-extrabold text-[#212121]">
                    {rp.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
