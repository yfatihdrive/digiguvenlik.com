"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "digiguvenlik_cookie_consent_v1";
const GTM_RE = /^GTM-[A-Z0-9]+$/;
const GA4_RE = /^G-[A-Z0-9]+$/;
const YM_RE = /^[0-9]{5,12}$/;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

export function pushAnalyticsEvent(
  eventName: string,
  params: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
  const rawYm = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID || "";
  if (YM_RE.test(rawYm) && typeof window.ym === "function") {
    window.ym(Number(rawYm), "reachGoal", eventName, params);
  }
}

export default function AnalyticsScripts() {
  const [consented, setConsented] = useState(false);

  const rawGtm = (process.env.NEXT_PUBLIC_GTM_ID || "GTM-K788SZ6D").trim();
  const rawGa4 = (process.env.NEXT_PUBLIC_GA_ID || "G-NK7Q4TZQJY").trim();
  const rawYm = (process.env.NEXT_PUBLIC_YANDEX_METRICA_ID || "").trim();

  const gtmId = GTM_RE.test(rawGtm) ? rawGtm : "";
  const ga4Id = GA4_RE.test(rawGa4) ? rawGa4 : "";
  const ymId = YM_RE.test(rawYm) ? rawYm : "";

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args as unknown as Record<string, unknown>);
    }
    window.gtag = window.gtag || gtag;

    // 1. Default Consent Mode v2 (denied until explicit user consent)
    window.gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500,
    });

    const applyConsentState = (status: string) => {
      if (status === "accepted") {
        setConsented(true);
        window.gtag?.("consent", "update", {
          ad_storage: "granted",
          analytics_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        });
      } else {
        setConsented(false);
        window.gtag?.("consent", "update", {
          ad_storage: "denied",
          analytics_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
    };

    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.status) applyConsentState(parsed.status);
      }
    } catch {
      // ignore
    }

    const onConsentChange = (e: Event) => {
      const choice = (e as CustomEvent<string>).detail;
      applyConsentState(choice);
    };

    const onCustomAnalytics = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail || {};
      const evtName = (detail.eventName || detail.event) as string | undefined;
      const params = (detail.params as Record<string, unknown>) || detail;
      if (typeof evtName === "string") {
        pushAnalyticsEvent(evtName, params);
      }
    };

    // Global delegate for tel: and wa.me clicks
    const onDocClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        pushAnalyticsEvent("contact_phone_click", { phone_href: href });
      } else if (href.includes("wa.me")) {
        pushAnalyticsEvent("contact_whatsapp_click", { wa_href: href });
      }
    };

    window.addEventListener("digiguvenlik-cookie-consent", onConsentChange);
    window.addEventListener("digiguvenlik-analytics-event", onCustomAnalytics);
    window.addEventListener("digi-track-event", onCustomAnalytics);
    document.addEventListener("click", onDocClick);

    return () => {
      window.removeEventListener("digiguvenlik-cookie-consent", onConsentChange);
      window.removeEventListener(
        "digiguvenlik-analytics-event",
        onCustomAnalytics
      );
      window.removeEventListener("digi-track-event", onCustomAnalytics);
      document.removeEventListener("click", onDocClick);
    };
  }, []);

  // KVKK Rule: Do NOT load any tracking script before explicit user consent
  if (!consented) return null;

  return (
    <>
      {gtmId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
      )}

      {ga4Id && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`,
            }}
          />
        </>
      )}

      {ymId && (
        <Script
          id="yandex-metrica"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${Number(
              ymId
            )},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false,ecommerce:"dataLayer"});`,
          }}
        />
      )}
    </>
  );
}
