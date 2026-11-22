/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/kategori/guvenlik-kameralar", destination: "/kategori/gizli-kameralar", permanent: true },
      { source: "/kategori/anahtarlik-guvenlik-kameralar", destination: "/kategori/anahtarlik-gizli-kameralar", permanent: true },
      { source: "/kategori/kalem-guvenlik-kameralar", destination: "/kategori/kalem-gizli-kameralar", permanent: true },
      { source: "/kategori/wifi-kameralar", destination: "/kategori/wifi-gizli-kameralar", permanent: true },
      { source: "/kategori/masa-saati-guvenlik-kameralar", destination: "/kategori/masa-saati-gizli-kameralar", permanent: true },
      { source: "/kategori/duvar-saati-guvenlik-kameralar", destination: "/kategori/duvar-saati-gizli-kameralar", permanent: true },
      { source: "/kategori/kol-saati-guvenlik-kameralar", destination: "/kategori/kol-saati-gizli-kameralar", permanent: true },
      { source: "/kategori/online-wifi-kameralar", destination: "/kategori/online-wifi-gizli-kameralar", permanent: true },
      { source: "/kategori/duyma-cihazlari", destination: "/kategori/dinleme-cihazlari", permanent: true },
      { source: "/kategori/aksesuar-guvenlik-kameralar", destination: "/kategori/aksesuar-gizli-kameralar", permanent: true },
      { source: "/urun/uzaktan-ses-duyma-cihazi", destination: "/urun/uzaktan-ses-dinleme-cihazi", permanent: true },
      { source: "/urun/arac-ici-online-duyma-cihazi", destination: "/urun/arac-ici-online-dinleme-cihazi", permanent: true },
      { source: "/urun/elbiseye-takilan-duyma-cihazi", destination: "/urun/elbiseye-takilan-dinleme-cihazi", permanent: true },
      { source: "/urun/powerbank-ortam-duyma-cihazi", destination: "/urun/powerbank-ortam-dinleme-cihazi", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        source: "/uploads/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
