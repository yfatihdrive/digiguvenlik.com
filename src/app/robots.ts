import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const disallowIndexing =
    process.env.ALLOW_INDEXING === "false" ||
    (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");

  if (disallowIndexing) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  const privateAndFilterPaths = [
    "/admin",
    "/api/",
    "/sepet",
    "/hesabim",
    "/giris",
    "/uye-ol",
    "/siparis-takip",
    "/*?*sort=",
    "/*?*q=",
    "/*?*minFiyat=",
    "/*?*filter=",
  ];

  const aiAndSearchBots = [
    "Googlebot",
    "Bingbot",
    "YandexBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Claude-SearchBot",
    "GPTBot",
    "ClaudeBot",
    "Google-Extended",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateAndFilterPaths,
      },
      ...aiAndSearchBots.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: privateAndFilterPaths,
      })),
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
