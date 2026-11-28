"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Truck,
  ShieldCheck,
  Award,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { Category, Product } from "@/lib/types";
import { normalizeTurkish } from "@/lib/text";
import ProductCard from "./ProductCard";

const INITIAL_COUNT = 36;
const LOAD_STEP = 24;

interface CatalogBrowserProps {
  products: Product[];
  categories: Category[];
  activeCategorySlug?: string;
  initialQuery?: string;
  initialFilter?: string;
  pageTitle: string;
  pageDescription: string;
}

export default function CatalogBrowser({
  products,
  categories,
  activeCategorySlug = "all",
  initialQuery = "",
  initialFilter = "",
  pageTitle,
  pageDescription,
}: CatalogBrowserProps) {
  const [search, setSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<
    "recommended" | "bestseller" | "price_asc" | "price_desc" | "discount"
  >(initialFilter === "bestseller" ? "bestseller" : initialFilter === "super" ? "discount" : "recommended");
  const [priceRange, setPriceRange] = useState<"all" | "under3500" | "3500to4500" | "over4500">("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && products.length > 0) {
      window.dispatchEvent(
        new CustomEvent("digi-track-event", {
          detail: {
            eventName: "view_item_list",
            params: {
              item_list_id: activeCategorySlug || "all",
              item_list_name: pageTitle,
            },
          },
        })
      );
    }
  }, [activeCategorySlug, pageTitle, products.length]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter (Note: parent categories include all child subcategories)
    if (activeCategorySlug && activeCategorySlug !== "all") {
      const childSlugs = new Set(
        categories
          .filter((c) => c.parentSlug === activeCategorySlug)
          .map((c) => c.slug)
      );
      if (activeCategorySlug === "indirimli-urunler") {
        list = list.filter((p) => p.discountPercent >= 35);
      } else if (activeCategorySlug === "gizli-kameralar") {
        list = list.filter(
          (p) =>
            p.categorySlug === "gizli-kameralar" ||
            childSlugs.has(p.categorySlug) ||
            p.categorySlug.includes("kamera")
        );
      } else {
        list = list.filter(
          (p) =>
            p.categorySlug === activeCategorySlug ||
            childSlugs.has(p.categorySlug)
        );
      }
    }

    // Turkish-character tolerant text search
    const q = normalizeTurkish(search);
    if (q) {
      const tokens = q.split(" ").filter(Boolean);
      list = list.filter((p) => {
        const hay = normalizeTurkish(
          `${p.name} ${p.category} ${p.sku} ${p.shortDescription}`
        );
        return tokens.every((t) => hay.includes(t));
      });
    }

    // Price range
    if (priceRange === "under3500") {
      list = list.filter((p) => p.price < 3500);
    } else if (priceRange === "3500to4500") {
      list = list.filter((p) => p.price >= 3500 && p.price <= 4500);
    } else if (priceRange === "over4500") {
      list = list.filter((p) => p.price > 4500);
    }

    // Sorting
    if (sortBy === "bestseller") {
      list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount);
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      list.sort((a, b) => b.discountPercent - a.discountPercent);
    }

    return list;
  }, [products, categories, activeCategorySlug, search, priceRange, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + LOAD_STEP, filteredProducts.length));
  }, [filteredProducts.length]);

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [activeCategorySlug]);

  useEffect(() => {
    if (!hasMore) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "600px 0px", threshold: 0 }
    );

    observer.observe(el);

    const rafId = window.requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 600) {
        loadMore();
      }
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [hasMore, visibleCount, loadMore]);

  return (
    <div className="hb-container py-6">
      {/* Page Header & Category Pills */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-2xs sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <nav className="mb-1.5 flex items-center gap-1.5 text-[15px] font-medium text-[#7B7B7B]">
              <Link href="/" className="hover:text-[#FF6000]">
                Ana Sayfa
              </Link>
              <span>/</span>
              <span className="font-semibold text-[#212121]">{pageTitle}</span>
            </nav>
            <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#212121] sm:text-[26px]">
              {pageTitle}{" "}
              <span className="text-[16px] font-normal text-[#7B7B7B]">
                ({filteredProducts.length} ürün)
              </span>
            </h1>
            <p className="mt-1 text-[16px] font-normal text-[#484848]">
              {pageDescription}
            </p>
          </div>

          {/* Trust Mini Badges */}
          <div className="flex flex-wrap gap-2 text-[14px] font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF7E5] px-3 py-1.5 text-[#2E7D32]">
              <Truck className="h-3.5 w-3.5" /> Ücretsiz Kargo
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-[#FF6000]">
              <ShieldCheck className="h-3.5 w-3.5" /> Kapıda Ödeme
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
              <Award className="h-3.5 w-3.5" /> 2 Yıl Garanti
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-purple-700">
              <PackageCheck className="h-3.5 w-3.5" /> Gizli Paketleme
            </span>
          </div>
        </div>

        {/* Category Filter Bar */}
        {(() => {
          const topCats = categories.filter((c) => !c.parentSlug && c.count > 0);
          const activeCatObj = categories.find((c) => c.slug === activeCategorySlug);
          const activeParentSlug = activeCatObj?.parentSlug
            ? activeCatObj.parentSlug
            : activeCategorySlug;
          const subCats = categories.filter((c) => c.parentSlug === activeParentSlug);

          return (
            <>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <Link
                  href="/urunler"
                  className={`rounded-lg px-3.5 py-2 text-[15px] font-semibold transition ${
                    activeCategorySlug === "all"
                      ? "bg-[#FF6000] text-white shadow-2xs"
                      : "bg-[#F5F5F5] text-[#484848] hover:bg-orange-50 hover:text-[#FF6000]"
                  }`}
                >
                  Tümü ({products.length})
                </Link>

                {topCats.map((cat) => {
                  const isActive =
                    activeCategorySlug === cat.slug || activeCatObj?.parentSlug === cat.slug;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/kategori/${cat.slug}`}
                      className={`rounded-lg px-3.5 py-2 text-[15px] font-semibold transition ${
                        isActive
                          ? "bg-[#FF6000] text-white shadow-2xs"
                          : "bg-[#F5F5F5] text-[#484848] hover:bg-orange-50 hover:text-[#FF6000]"
                      }`}
                    >
                      {cat.name}{" "}
                      <span className={isActive ? "text-orange-100" : "text-[#9B9B9B]"}>
                        ({cat.count})
                      </span>
                    </Link>
                  );
                })}
              </div>

              {subCats.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-orange-200 bg-orange-50/40 px-3 py-2.5 rounded-xl">
                  <span className="mr-1 text-[13px] font-extrabold tracking-wide text-[#FF6000] uppercase">
                    Alt Kategoriler:
                  </span>
                  <Link
                    href={`/kategori/${activeParentSlug}`}
                    className={`rounded-lg px-3 py-1.5 text-[14px] font-semibold transition ${
                      activeCategorySlug === activeParentSlug
                        ? "bg-[#FF6000] text-white shadow-2xs"
                        : "bg-white text-[#484848] border border-orange-200 hover:bg-orange-50 hover:text-[#FF6000]"
                    }`}
                  >
                    Tümü
                  </Link>
                  {subCats.map((sub) => {
                    const isSubActive = activeCategorySlug === sub.slug;
                    return (
                      <Link
                        key={sub.slug}
                        href={`/kategori/${sub.slug}`}
                        className={`rounded-lg px-3 py-1.5 text-[14px] font-semibold transition ${
                          isSubActive
                            ? "bg-[#FF6000] text-white shadow-2xs"
                            : "bg-white text-[#484848] border border-gray-200 hover:border-[#FF6000] hover:text-[#FF6000]"
                        }`}
                      >
                        {sub.name}{" "}
                        <span className={isSubActive ? "text-orange-100" : "text-[#9B9B9B]"}>
                          ({sub.count})
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}

        {/* Filter & Sort Toolbar (Hepsiburada style) */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-3">
          {/* Quick Search in Catalog */}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              placeholder="Sonuçlar içinde ara..."
              className="w-full rounded-lg border border-gray-200 bg-[#F5F5F5] py-2 pr-3 pl-9 text-[16px] font-normal text-[#212121] focus:border-[#FF6000] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#FF6000]" />
            <select
              aria-label="Fiyat Aralığı"
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value as typeof priceRange);
                setVisibleCount(INITIAL_COUNT);
              }}
              className="w-full rounded-lg border border-gray-200 bg-[#F5F5F5] px-3 py-2 text-[16px] font-medium text-[#484848] focus:border-[#FF6000] focus:bg-white focus:outline-none"
            >
              <option value="all">Tüm Fiyat Aralıkları</option>
              <option value="under3500">3.500 TL Altı Ürünler</option>
              <option value="3500to4500">3.500 TL - 4.500 TL Arası</option>
              <option value="over4500">4.500 TL ve Üzeri</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 shrink-0 text-[#FF6000]" />
            <select
              aria-label="Sıralama"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full rounded-lg border border-gray-200 bg-[#F5F5F5] px-3 py-2 text-[16px] font-medium text-[#484848] focus:border-[#FF6000] focus:bg-white focus:outline-none"
            >
              <option value="recommended">Akıllı Sıralama (Önerilen)</option>
              <option value="bestseller">Çok Satanlar</option>
              <option value="price_asc">En Düşük Fiyat</option>
              <option value="price_desc">En Yüksek Fiyat</option>
              <option value="discount">İndirim Oranı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {displayedProducts.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-base font-extrabold text-gray-800">
            Aradığınız kriterlere uygun ürün bulunamadı.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Filtreleri sıfırlayarak tüm {products.length} ürünümüzü inceleyebilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPriceRange("all");
              setSortBy("recommended");
            }}
            className="mt-4 rounded-xl bg-[#FF6000] px-5 py-2.5 text-xs font-extrabold text-white"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          {hasMore ? (
            <div ref={loadMoreRef} className="mt-8 flex flex-col items-center justify-center gap-2 py-4">
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-orange-200 bg-orange-50/70 px-5 py-2 text-[14px] font-semibold text-[#FF6000] transition hover:bg-[#FF6000] hover:text-white"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Diğer ürünler otomatik yükleniyor... ({filteredProducts.length - visibleCount} ürün kaldı)
                </span>
              </button>
            </div>
          ) : (
            filteredProducts.length > INITIAL_COUNT && (
              <p className="mt-8 text-center text-[13px] font-medium text-[#7B7B7B]">
                Tüm {filteredProducts.length} ürün listelendi
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}
