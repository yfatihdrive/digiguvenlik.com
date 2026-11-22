import { getProducts } from "@/lib/db";
import { Product } from "@/lib/types";
import { SITE_CONFIG } from "@/config/site";

export function escapeXml(unsafe: string | number | undefined | null): string {
  const str = String(unsafe ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function stripHtml(html: string | undefined | null): string {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Policy-safe sanitizer per Section 6.1:
 * Cleans up "orijinal uyumlu" / "orijinal kalite" to avoid Merchant Center counterfeit flags,
 * and optionally normalizes sensitive terms when mode="merchant-safe".
 */
export function sanitizeFeedText(
  text: string,
  mode: "organic" | "merchant-safe" = "organic"
): string {
  let out = stripHtml(text)
    .replace(/orijinal\s+uyumlu/gi, "birebir uyumlu")
    .replace(/orijinal\s+kalite/gi, "yüksek kalite");

  if (mode === "merchant-safe") {
    out = out
      .replace(/Gizli\s+Kamera(lar)?/gi, "Mini Güvenlik Kamerası")
      .replace(/Dinleme\s+Cihaz(ı|ları)/gi, "Akustik Ses Kayıt ve İzleme Cihazı")
      .replace(/Casus/gi, "Kompakt");
  }
  return out;
}

export function getInStockFeedProducts(): Product[] {
  return getProducts().filter((p) => Number(p.stock ?? 0) > 0 && Number(p.price ?? 0) > 0);
}

export function getAbsoluteImageUrl(imgPath: string): string {
  if (!imgPath) return `${SITE_CONFIG.url}/digi-guvenlik-logo.png`;
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) return imgPath;
  const clean = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
  return `${SITE_CONFIG.url}${clean}`;
}

export function getGoogleProductCategory(categorySlug: string): string {
  if (categorySlug.includes("ses") || categorySlug.includes("dinleme")) {
    return "Electronics > Audio > Audio Components > Voice Recorders";
  }
  return "Cameras & Optics > Cameras > Surveillance Cameras";
}
