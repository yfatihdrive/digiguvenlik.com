import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://digiguvenlik.company";
  const products = getProducts();
  const categories = getCategories();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/urunler`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/sss`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/kampanyalar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/kurumsal/gizlilik-politikasi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/kurumsal/teslimat-kosullari`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/kurumsal/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/kurumsal/mesafeli-satis`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/kurumsal/on-bilgilendirme`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/kurumsal/kvkk-veri-koruma`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/kurumsal/cerez-politikasi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/kurumsal/kullanim-sartlari`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/kategori/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productUrls: MetadataRoute.Sitemap = products.filter((p) => p.stock > 0).map((p) => ({
    url: `${baseUrl}/urun/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
