"use client";

import React from "react";

export default function GlobalRootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-6 font-sans text-[#212121]">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <p className="text-sm font-extrabold tracking-widest text-[#FF6000] uppercase">
            DİGİ GÜVENLİK
          </p>
          <h1 className="mt-2 text-2xl font-bold">Beklenmeyen Bir Hata Oluştu</h1>
          <p className="mt-3 text-base text-[#666666]">
            Geçici bir teknik sorun nedeniyle sayfa şu an görüntülenemiyor. Lütfen tekrar deneyin.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="cursor-pointer rounded-xl bg-[#FF6000] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55500]"
            >
              Sayfayı Yenile
            </button>
            <a
              href="/"
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-[#212121] hover:border-[#FF6000]"
            >
              Ana Sayfa
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
