"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error.digest || "unknown");
  }, [error]);

  return (
    <div className="hb-container py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <p className="text-[14px] font-extrabold tracking-widest text-rose-600 uppercase">
          GEÇİCİ BİR HATA OLUŞTU
        </p>
        <h1 className="mt-2 text-[24px] font-bold text-[#212121]">
          Sayfa yüklenirken beklenmeyen bir sorun yaşandı
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[#666666]">
          Teknik ekibimiz konudan haberdardır. Lütfen sayfayı yeniden deneyin veya ana sayfaya dönün.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6000] px-6 py-3 text-[16px] font-bold text-white shadow-sm transition hover:bg-[#e55500]"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-[16px] font-bold text-[#212121] transition hover:border-[#FF6000] hover:text-[#FF6000]"
          >
            <Home className="h-5 w-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
