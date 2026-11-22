"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";

const CONSENT_KEY = "digiguvenlik_cookie_consent_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveChoice = (choice: "accepted" | "rejected") => {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ status: choice, updatedAt: new Date().toISOString() })
      );
      window.dispatchEvent(
        new CustomEvent("digiguvenlik-cookie-consent", { detail: choice })
      );
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Çerez Tercihleri"
      className="fixed right-3 bottom-16 left-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:bottom-20 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6000]">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="text-[14px] leading-snug text-[#484848]">
            <p className="font-bold text-[#212121]">
              Çerez Kullanımı ve Gizlilik Tercihleriniz
            </p>
            <p className="mt-0.5">
              Sepet ve oturum işlevleri için zorunlu çerezler kullanılmaktadır. Analitik çerezler yalnızca onayınızla etkinleştirilir.{" "}
              <Link
                href="/kurumsal/cerez-politikasi"
                className="font-semibold text-[#FF6000] underline hover:text-[#e55500]"
              >
                Çerez Politikası
              </Link>
              {" · "}
              <Link
                href="/kurumsal/kvkk-veri-koruma"
                className="font-semibold text-[#FF6000] underline hover:text-[#e55500]"
              >
                KVKK Metni
              </Link>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => saveChoice("rejected")}
            className="min-h-[44px] cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2 text-[14px] font-bold text-[#484848] transition hover:bg-gray-100"
          >
            Reddet (Yalnızca Zorunlu)
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl bg-[#FF6000] px-4 py-2 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#e55500]"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Tümünü Kabul Et</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
