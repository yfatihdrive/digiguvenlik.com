import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendOrderEmail } from "@/lib/mailer";
import { OrderStatus, Product } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }
  const db = readDb();
  const safeUsers = db.users.map(({ passwordHash: _, ...u }) => {
    void _;
    return u;
  });
  return NextResponse.json({
    settings: db.settings,
    orders: db.orders,
    products: db.products,
    categories: db.categories,
    coupons: db.coupons,
    users: safeUsers,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const action = body.action;
    const db = readDb();

    if (action === "update_order_status") {
      const { orderId, status, trackingNumber } = body;
      const idx = db.orders.findIndex((o) => o.id === orderId);
      if (idx === -1) {
        return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
      }
      if (status) db.orders[idx].status = status as OrderStatus;
      if (trackingNumber !== undefined) db.orders[idx].trackingNumber = trackingNumber;
      writeDb(db);
      return NextResponse.json({ success: true, order: db.orders[idx] });
    }

    if (action === "delete_order") {
      const { orderId } = body;
      db.orders = db.orders.filter((o) => o.id !== orderId);
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === "save_product") {
      const prod: Partial<Product> = body.product;
      if (!prod || !prod.name) {
        return NextResponse.json({ error: "Ürün adı zorunludur." }, { status: 400 });
      }
      const price = Number(prod.price) || 0;
      const oldPrice = Number(prod.oldPrice) || price + 1500;
      const discountPercent = Math.max(
        5,
        Math.min(80, Math.round(((oldPrice - price) / oldPrice) * 100))
      );

      if (prod.id) {
        const idx = db.products.findIndex((p) => p.id === Number(prod.id));
        if (idx !== -1) {
          db.products[idx] = {
            ...db.products[idx],
            name: prod.name,
            price,
            oldPrice,
            discountPercent,
            stock: Number(prod.stock ?? db.products[idx].stock),
            category: prod.category || db.products[idx].category,
            categorySlug: prod.categorySlug || db.products[idx].categorySlug,
            image: prod.image || db.products[idx].image,
            shortDescription: prod.shortDescription || db.products[idx].shortDescription,
            isBestseller: Boolean(prod.isBestseller),
            isSuperDeal: Boolean(prod.isSuperDeal),
          };
          writeDb(db);
          return NextResponse.json({ success: true, product: db.products[idx] });
        }
      }

      const maxId = db.products.reduce((m, p) => Math.max(m, p.id), 0);
      const newId = maxId + 1;
      const slug =
        prod.slug ||
        prod.name
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
          `-${newId}`;

      const newProduct: Product = {
        id: newId,
        sku: `DGV-${1000 + newId}`,
        slug,
        name: prod.name,
        category: prod.category || "Gizli Kameralar",
        categorySlug: prod.categorySlug || "gizli-kameralar",
        price,
        oldPrice,
        discountPercent,
        stock: Number(prod.stock ?? 25),
        rating: 4.9,
        reviewCount: 12,
        image: prod.image || "/uploads/products/uzaktan-ses-duyma-cihazi.png",
        images: [prod.image || "/uploads/products/uzaktan-ses-duyma-cihazi.png"],
        isBestseller: Boolean(prod.isBestseller),
        isFeatured: true,
        isSuperDeal: Boolean(prod.isSuperDeal),
        shortDescription:
          prod.shortDescription ||
          `${prod.name}, yüksek performanslı ve kullanımı kolay profesyonel güvenlik çözümüdür.`,
        highlights: [
          "Yüksek çözünürlüklü sensör ve net ses/görüntü kalitesi",
          "Kolay kurulum ve Türkçe kullanım kılavuzu",
          "2 Yıl Digi Güvenlik Garantisi ve Ücretsiz Kargo",
          "Kapıda Nakit veya Kredi Kartı ile Ödeme Kolaylığı",
        ],
        specs: [
          { label: "Ürün Kodu", value: `DGV-${1000 + newId}` },
          { label: "Kategori", value: prod.category || "Gizli Kameralar" },
          { label: "Garanti Süresi", value: "24 Ay Digi Güvenlik Garantili" },
        ],
        seoTitle: `${prod.name} Fiyatı ve Özellikleri | Digi Güvenlik`,
        seoDescription: `${prod.name} ücretsiz kargo ve kapıda ödeme imkanıyla Digi Güvenlik'te.`,
        seoKeywords: `${prod.name.toLowerCase()}, digi güvenlik`,
        seoSections: [
          {
            title: `${prod.name} Nedir?`,
            content:
              prod.shortDescription ||
              `${prod.name}, bireysel ve kurumsal güvenlik ihtiyaçları için geliştirilmiş yeni nesil bir cihazdır.`,
          },
        ],
        faqs: [
          {
            question: "Kargo ücretsiz mi, kapıda ödeme var mı?",
            answer: "Evet, tüm Türkiye'ye ücretsiz kargo ve kapıda ödeme imkanı mevcuttur.",
          },
        ],
        reviews: [],
      };

      db.products.unshift(newProduct);
      writeDb(db);
      return NextResponse.json({ success: true, product: newProduct });
    }

    if (action === "delete_product") {
      const { productId } = body;
      db.products = db.products.filter((p) => p.id !== Number(productId));
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === "save_coupon") {
      const { code, type, value, minOrder, description } = body.coupon;
      const cleanCode = (code || "").trim().toUpperCase();
      if (!cleanCode) {
        return NextResponse.json({ error: "Kupon kodu gerekli." }, { status: 400 });
      }
      db.coupons = db.coupons.filter((c) => c.code.toUpperCase() !== cleanCode);
      db.coupons.unshift({
        code: cleanCode,
        type: type === "percent" ? "percent" : "fixed",
        value: Number(value) || 100,
        minOrder: Number(minOrder) || 0,
        active: true,
        description: description || `${value} İndirim Kuponu`,
      });
      writeDb(db);
      return NextResponse.json({ success: true, coupons: db.coupons });
    }

    if (action === "delete_coupon") {
      const { code } = body;
      db.coupons = db.coupons.filter((c) => c.code !== code);
      writeDb(db);
      return NextResponse.json({ success: true, coupons: db.coupons });
    }

    if (action === "save_settings") {
      db.settings = {
        ...db.settings,
        ...body.settings,
        smtp: {
          ...db.settings.smtp,
          ...(body.settings?.smtp || {}),
        },
      };
      writeDb(db);
      return NextResponse.json({ success: true, settings: db.settings });
    }

    if (action === "test_smtp") {
      const dummyOrder = db.orders[0];
      if (!dummyOrder) {
        return NextResponse.json({ error: "Örnek sipariş bulunamadı." }, { status: 400 });
      }
      const res = await sendOrderEmail(dummyOrder, db.settings);
      return NextResponse.json({
        success: res.sent,
        message: res.sent
          ? `Test e-postası ${db.settings.notificationEmail} adresine başarıyla gönderildi!`
          : res.error || "E-posta gönderilemedi.",
      });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch (err) {
    console.error("Admin API error:", err);
    return NextResponse.json({ error: "İşlem sırasında hata oluştu." }, { status: 500 });
  }
}
