"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  MapPin,
  PackageSearch,
  Heart,
  LayoutDashboard,
} from "lucide-react";
import { Category, SiteSettings } from "@/lib/types";
import { useShop } from "@/context/ShopContext";

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
}

interface SearchHit {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  image: string;
}

export default function Header({ settings, categories }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, user, favorites } = useShop();

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setCatDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          setHits(d.results || []);
          setShowDropdown(true);
        })
        .catch(() => {});
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (query.trim()) {
      router.push(`/urunler?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/urunler");
    }
  };

  const formatTL = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n));

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Main Header Row */}
      <div className="hb-container py-3">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          {/* Digi Güvenlik Brand Logo */}
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2.5" aria-label="Digi Güvenlik Ana Sayfa">
            <img
              src="/digi-guvenlik-icon.svg"
              alt="Digi Güvenlik Logo"
              className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-[18px] leading-none font-extrabold tracking-[-0.03em] sm:text-[28px]">
                  <span className="text-[#FF6000]">Digi</span>
                  <span className="text-[#212121]"> Güvenlik</span>
                </span>
                <span className="hidden rounded bg-[#FF6000] px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase sm:inline">
                  PRO
                </span>
              </div>
              <span className="mt-0.5 text-[10.5px] font-medium tracking-tight text-[#666666] sm:text-[13px]">
                Güvenlik &amp; Ses Teknolojileri
              </span>
            </div>
          </Link>

          {/* Hepsiburada-style Mega Search Bar */}
          <div ref={searchRef} className="relative hidden flex-1 md:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full items-center overflow-hidden rounded-lg border-2 border-[#FF6000] bg-white shadow-2xs focus-within:ring-2 focus-within:ring-[#FF6000]/20"
            >
              <div className="pl-3.5 text-[#9B9B9B]">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => hits.length > 0 && setShowDropdown(true)}
                placeholder="Ürün, kategori veya marka ara"
                className="w-full px-3 py-2.5 text-[16px] font-normal text-[#484848] placeholder:text-[#9B9B9B] focus:outline-none"
              />
              <button
                type="submit"
                className="cursor-pointer bg-[#FF6000] px-6 py-2.5 text-[16px] font-bold text-white transition hover:bg-[#e55500]"
              >
                ARA
              </button>
            </form>

            {/* Instant Search Results Dropdown */}
            {showDropdown && hits.length > 0 && (
              <div className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-[14px] font-bold text-[#7B7B7B] uppercase">
                  Popüler Arama Sonuçları
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {hits.map((hit) => (
                    <Link
                      key={hit.id}
                      href={`/urun/${hit.slug}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-orange-50/60"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={hit.image}
                          alt={hit.name}
                          className="h-11 w-11 rounded-lg border border-gray-100 bg-white object-contain p-1"
                        />
                        <div>
                          <p className="text-[16px] font-medium text-[#212121]">{hit.name}</p>
                          <p className="text-[14px] font-normal text-[#9B9B9B]">{hit.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] text-[#9B9B9B] line-through">
                          {formatTL(hit.oldPrice)} TL
                        </p>
                        <p className="text-[16px] font-bold text-[#FF6000]">
                          {formatTL(hit.price)} TL
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/urunler?q=${encodeURIComponent(query)}`}
                  onClick={() => setShowDropdown(false)}
                  className="block bg-orange-50 py-2.5 text-center text-[15px] font-bold text-[#FF6000] hover:bg-orange-100"
                >
                  Tüm Sonuçları Gör →
                </Link>
              </div>
            )}
          </div>

          {/* Right Action Widgets: Location, Account, Cart */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* Location / Free Shipping Widget */}
            <div className="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 xl:flex">
              <MapPin className="h-4 w-4 text-[#FF6000]" />
              <div className="leading-tight">
                <p className="text-[14px] font-normal text-[#7B7B7B]">Konum</p>
                <p className="text-[15px] font-bold text-[#FF6000]">81 İl Hızlı Kargo</p>
              </div>
            </div>

            {/* Admin Panel quick button if logged in as admin */}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                prefetch={false}
                className="flex items-center gap-1.5 rounded-lg border border-purple-600 bg-purple-50 px-3 py-2 text-[15px] font-bold text-purple-800 hover:bg-purple-100"
              >
                <LayoutDashboard className="h-4 w-4 text-purple-700" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}

            {/* Account Button (Hepsiburada style) */}
            <Link
              href={user ? "/hesabim" : "/giris"}
              prefetch={false}
              aria-label={user ? "Hesabım" : "Giriş Yap"}
              className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 transition hover:border-[#FF6000] sm:h-auto sm:px-3.5"
            >
              <User className="h-5 w-5 text-[#484848]" />
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-[16px] font-bold text-[#484848]">
                  {user ? "Hesabım" : "Giriş Yap"}
                </p>
                <p className="text-[14px] font-normal text-[#7B7B7B]">
                  {user ? `${user.firstName} ${user.lastName}` : "veya üye ol"}
                </p>
              </div>
            </Link>

            {/* Favorites Button */}
            <Link
              href="/hesabim?tab=favorites"
              prefetch={false}
              aria-label="Favorilerim"
              className="relative hidden h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-[#484848] hover:border-[#FF6000] hover:text-[#FF6000] sm:flex"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6000] text-[13px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart Button (Hepsiburada Grey Pill style) */}
            <Link
              href="/sepet"
              aria-label="Sepetim"
              className="relative flex h-10 items-center gap-1.5 rounded-lg bg-[#6b6b6b] px-2.5 py-2 text-white shadow-2xs transition hover:bg-[#555555] sm:h-auto sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              <span className="hidden text-[16px] font-bold sm:inline">Sepetim</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6000] px-1.5 text-[14px] font-bold text-white">
                {cartCount}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 md:hidden"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 flex md:hidden">
          <div className="flex w-full overflow-hidden rounded-xl border-2 border-[#FF6000] bg-white">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün veya kategori ara..."
              className="w-full px-3 py-2 text-sm text-gray-900 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#FF6000] px-4 py-2 text-xs font-extrabold text-white"
            >
              ARA
            </button>
          </div>
        </form>
      </div>

      {/* Signature Hepsiburada 5-Color Rainbow Strip */}
      <div className="grid h-1.5 w-full grid-cols-5">
        <div className="bg-[#FF6000]" />
        <div className="bg-[#49C7ED]" />
        <div className="bg-[#7723DB]" />
        <div className="bg-[#57B900]" />
        <div className="bg-[#F59F28]" />
      </div>

      {/* Category Navigation Bar */}
      <nav ref={catMenuRef} className="relative border-b border-gray-200 bg-white">
        <div className="hb-container flex items-center justify-between gap-1.5 overflow-x-auto py-2 no-scrollbar">
          {/* All Categories Trigger Button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setCatDropdownOpen((prev) => !prev)}
              aria-expanded={catDropdownOpen}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#FF6000] px-3.5 py-2 text-[16px] font-bold text-white shadow-2xs transition hover:bg-[#e55500]"
            >
              <Menu className="h-4 w-4" />
              <span>Tüm Kategoriler</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  catDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <Link
            href="/urunler"
            aria-current={pathname === "/urunler" ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-[16px] font-semibold transition ${
              pathname === "/urunler"
                ? "bg-orange-50 text-[#FF6000]"
                : "text-[#212121] hover:bg-orange-50 hover:text-[#FF6000]"
            }`}
          >
            Tüm Ürünler
          </Link>

          {categories.map((cat) => {
            const isCurrent = pathname === `/kategori/${cat.slug}`;
            return (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-[16px] font-semibold transition ${
                  isCurrent
                    ? "bg-orange-50 text-[#FF6000]"
                    : "text-[#484848] hover:bg-orange-50 hover:text-[#FF6000]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Categories Dropdown Rendered Outside overflow-x-auto so it is NEVER clipped */}
        {catDropdownOpen && (
          <div className="absolute top-full left-0 z-50 w-full px-4 pt-1 sm:left-4 sm:w-80 sm:px-0 lg:left-8">
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-2xl">
              <Link
                href="/urunler"
                onClick={() => setCatDropdownOpen(false)}
                className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 text-[16px] font-bold text-[#FF6000] hover:bg-orange-50"
              >
                <span>Tüm Ürünleri Gör</span>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[13px] font-bold text-[#FF6000]">
                  Tümü
                </span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  onClick={() => setCatDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-[16px] font-medium text-[#484848] hover:bg-orange-50 hover:font-semibold hover:text-[#FF6000]"
                >
                  <span>{cat.name}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[14px] font-semibold text-[#7B7B7B]">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-gray-200 bg-white px-4 py-4 shadow-xl md:hidden">
          <div className="mb-3 flex flex-col gap-2">
            <Link
              href={user ? "/hesabim" : "/giris"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-orange-50 p-3 text-sm font-extrabold text-[#FF6000]"
            >
              <span>
                {user
                  ? `Hesabım (${user.firstName} ${user.lastName})`
                  : "Giriş Yap / Üye Ol"}
              </span>
              <User className="h-4 w-4" />
            </Link>
            <Link
              href="/siparis-takip"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-gray-100 p-3 text-sm font-bold text-gray-800"
            >
              <span>Sipariş Takibi</span>
              <PackageSearch className="h-4 w-4" />
            </Link>
          </div>
          <p className="mb-2 text-xs font-extrabold text-gray-400 uppercase">
            Kategoriler
          </p>
          <div className="grid grid-cols-1 divide-y divide-gray-100">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 text-sm font-bold text-gray-700"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.count} ürün</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
