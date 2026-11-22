import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_CONFIG.name} — ${SITE_CONFIG.slogan}`,
    short_name: SITE_CONFIG.name,
    description:
      "Gizli kamera, dinleme cihazları, ses dinleme cihazları ve ses kayıt cihazları. Ücretsiz kargo, gizli paketleme ve kapıda ödeme.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5F5",
    theme_color: "#FF6000",
    lang: "tr",
    icons: [
      {
        src: "/digi-guvenlik-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/digi-guvenlik-logo.png",
        sizes: "680x160",
        type: "image/png",
      },
    ],
  };
}
