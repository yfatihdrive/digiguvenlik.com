import fs from "fs";
import path from "path";
import { DatabaseSchema, Product, Category, Order, User, Coupon, SiteSettings } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

let cachedDb: DatabaseSchema | null = null;
let lastMtimeMs = 0;

export function readDb(): DatabaseSchema {
  try {
    const stat = fs.statSync(DB_PATH);
    if (cachedDb && stat.mtimeMs === lastMtimeMs) {
      return cachedDb;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    cachedDb = JSON.parse(raw) as DatabaseSchema;
    lastMtimeMs = stat.mtimeMs;
    return cachedDb;
  } catch (err) {
    console.error("Failed reading db.json:", err);
    return {
      settings: {
        siteName: "Digi Güvenlik",
        siteSlogan: "Güvenlik ve İzleme Teknolojileri",
        phone: "0 216 825 10 57",
        whatsapp: "902168251087",
        whatsappDisplay: "0 216 825 10 87",
        supportPhone: "0 216 825 10 57",
        email: "siparis@digiguvenlik.company",
        notificationEmail: "siparis@digiguvenlik.company",
        address: "Sultan Orhan, İlyasbey Cd. No:21/C, 41400 Gebze / Kocaeli",
        companyName: "DİGİ GÜVENLİK TEKNOLOJİ A.Ş.",
        havaleDiscountRate: 10,
        bankAccountHolder: "LIFE TEKNOLOJİ TURİZM İNŞAAT REKLAM DIŞ TİC LTD ŞTİ.",
        bankIban: "TR43 0011 1000 0000 0089 5849 57",
        bankName: "QNB Finansbank",
        freeShippingText: "TÜM ÜRÜNLERDE ÜCRETSİZ KARGO",
        codBannerTitle: "ÖNCE TESLİM AL SONRA ÖDEME YAP",
        codBannerSub: "TÜM ÜRÜNLERDE KAPIDA ÖDEME KOLAYLIĞI",
        smtp: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          user: "",
          pass: "",
          from: "Digi Güvenlik Sipariş <siparis@digiguvenlik.company>",
        },
      },
      categories: [],
      products: [],
      coupons: [],
      users: [],
      orders: [],
    };
  }
}

export function writeDb(data: DatabaseSchema): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  const stat = fs.statSync(DB_PATH);
  cachedDb = data;
  lastMtimeMs = stat.mtimeMs;
}

export function getSettings(): SiteSettings {
  return readDb().settings;
}

export function getCategories(): Category[] {
  return readDb().categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return readDb().categories.find((c) => c.slug === slug);
}

export function getProducts(): Product[] {
  return readDb().products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return readDb().products.find((p) => p.slug === slug);
}

export function getProductById(id: number): Product | undefined {
  return readDb().products.find((p) => p.id === id);
}

export function getOrders(): Order[] {
  return readDb().orders;
}

export function getCoupons(): Coupon[] {
  return readDb().coupons;
}

export function getUsers(): User[] {
  return readDb().users;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
