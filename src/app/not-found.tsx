import Link from "next/link";
import { SearchX, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="hb-container py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#E5E5E5] bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-[#FF6000]">
          <SearchX className="h-10 w-10" />
        </div>
        <p className="text-[14px] font-extrabold tracking-widest text-[#FF6000] uppercase">
          404 • SAYFA BULUNAMADI
        </p>
        <h1 className="mt-2 text-[26px] font-bold text-[#212121]">
          Aradığınız sayfa bulunamadı
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[#666666]">
          İlgili ürün yayından kaldırılmış veya bağlantı adresi değişmiş olabilir. Ana sayfaya dönerek tüm güvenlik kameralarımızı ve ses kayıt cihazlarımızı inceleyebilirsiniz.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-6 py-3 text-[16px] font-bold text-white shadow-sm transition hover:bg-[#e55500]"
          >
            <Home className="h-5 w-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-[16px] font-bold text-[#212121] transition hover:border-[#FF6000] hover:text-[#FF6000]"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Tüm Ürünler</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
