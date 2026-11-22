"use client";

import React from "react";
import { Cookie } from "lucide-react";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("digiguvenlik-open-cookie-settings"));
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-normal text-[#484848] hover:text-[#FF6000] hover:underline"
    >
      <Cookie className="h-4 w-4 text-[#FF6000]" />
      <span>Çerez Tercihlerini Yönet</span>
    </button>
  );
}
