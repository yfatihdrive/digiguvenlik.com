import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://digiguvenlik.com";
  const products = getProducts();
  const categories = getCategories();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/urunler`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/siparis-takip`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/kategori/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/urun/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
