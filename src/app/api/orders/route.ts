import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { sendOrderEmail } from "@/lib/mailer";
import { getCurrentUser } from "@/lib/auth";
import { Order, OrderItem } from "@/lib/types";
import { calculateSecondItemDiscount } from "@/lib/promo";

const ALLOWED_PAYMENT_METHODS: Order["paymentMethod"][] = [
  "Kapıda Nakit",
  "Kapıda Kredi Kartı",
  "Havale - EFT",
];

function maskName(name: string): string {
  const clean = (name || "").trim();
  if (clean.length <= 1) return "*";
  return `${clean[0]}${"*".repeat(Math.min(5, clean.length - 1))}`;
}

/**
 * Oturum açmamış sipariş takip sorgularında kişisel verileri (KVKK / PII) maskeler.
 */
function sanitizePublicOrder(o: Order) {
  return {
    id: o.id,
    orderType: o.orderType,
    customerFirstName: maskName(o.customerFirstName),
    customerLastName: maskName(o.customerLastName),
    customerPhone: "",
    customerEmail: "",
    customerCity: o.customerCity,
    customerDistrict: o.customerDistrict,
    customerAddress: "Güvenlik nedeniyle maskelenmiştir",
    items: o.items,
    subtotal: o.subtotal,
    couponCode: o.couponCode,
    couponDiscount: o.couponDiscount,
    havaleDiscount: o.havaleDiscount,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    notes: "",
    status: o.status,
    trackingNumber: o.trackingNumber,
    mailSent: o.mailSent,
    createdAt: o.createdAt,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id")?.trim();
  const phone = searchParams.get("phone")?.replace(/\D/g, "");

  const db = readDb();
  const user = await getCurrentUser();

  if (orderId || phone) {
    const matches = db.orders.filter((o) => {
      if (orderId && o.id.toLowerCase() === orderId.toLowerCase()) return true;
      if (
        phone &&
        phone.length >= 10 &&
        o.customerPhone.replace(/\D/g, "").endsWith(phone.slice(-10))
      ) {
        return true;
      }
      return false;
    });

    const responseOrders = matches.map((o) => {
      const isOwnerOrAdmin =
        user &&
        (user.role === "admin" ||
          o.userId === user.id ||
          (o.customerEmail && o.customerEmail === user.email));
      return isOwnerOrAdmin ? o : sanitizePublicOrder(o);
    });

    return NextResponse.json({ orders: responseOrders });
  }

  if (!user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  if (user.role === "admin") {
    return NextResponse.json({ orders: db.orders });
  }

  const myOrders = db.orders
    .filter((o) => o.userId === user.id || o.customerEmail === user.email)
    .map(({ mailPreviewHtml: _, ...rest }) => {
      void _;
      return rest;
    });
  return NextResponse.json({ orders: myOrders });
}

const orderIpWindow = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "127.0.0.1").split(",")[0].trim();
    const now = Date.now();
    const rec = orderIpWindow.get(ip);
    if (rec && now < rec.resetAt) {
      if (rec.count >= 15) {
        return NextResponse.json(
          { error: "Çok fazla sipariş isteği gönderildi. Lütfen birkaç dakika sonra tekrar deneyin." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
      rec.count += 1;
    } else {
      orderIpWindow.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    }
    const body = await req.json();
    const db = readDb();
    const user = await getCurrentUser();

    const firstName = String(body.customerFirstName || "").trim().slice(0, 80);
    const lastName = String(body.customerLastName || "").trim().slice(0, 80);
    const phone = String(body.customerPhone || "").trim().slice(0, 30);
    const email = String(body.customerEmail || user?.email || "")
      .trim()
      .slice(0, 120);
    const city = String(body.customerCity || "").trim().slice(0, 60);
    const district = String(body.customerDistrict || "").trim().slice(0, 60);
    const address = String(body.customerAddress || "").trim().slice(0, 400);
    const paymentMethod: Order["paymentMethod"] = ALLOWED_PAYMENT_METHODS.includes(
      body.paymentMethod
    )
      ? body.paymentMethod
      : "Kapıda Nakit";
    const notes = String(body.notes || "").trim().slice(0, 300);
    const couponCode = String(body.couponCode || "")
      .trim()
      .toUpperCase()
      .slice(0, 40);
    const orderType = body.orderType === "cart_order" ? "cart_order" : "quick_order";

    if (!firstName || !lastName || !phone || !city || !district || !address) {
      return NextResponse.json(
        {
          error:
            "Lütfen ad, soyad, telefon ve teslimat adresi alanlarını eksiksiz doldurun.",
        },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir cep telefonu numarası girin (en az 10 hane)." },
        { status: 400 }
      );
    }

    const rawItems: OrderItem[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 30) {
      return NextResponse.json(
        { error: "Sipariş için 1 ile 30 arasında geçerli ürün seçilmelidir." },
        { status: 400 }
      );
    }

    // 100% Server-Side Price & Stock Validation (Client price is NEVER trusted)
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];
    const stockDeductions: { productIndex: number; qty: number }[] = [];

    for (const it of rawItems) {
      const prodIdx = db.products.findIndex((p) => p.id === Number(it.productId));
      if (prodIdx === -1) {
        return NextResponse.json(
          { error: `Geçersiz ürün seçimi (ID: ${String(it.productId)}).` },
          { status: 400 }
        );
      }
      const dbProd = db.products[prodIdx];
      const qty = Math.floor(Number(it.quantity));
      if (!Number.isFinite(qty) || qty < 1 || qty > 50) {
        return NextResponse.json(
          { error: `${dbProd.name} için geçersiz adet (1-50 arası olmalıdır).` },
          { status: 400 }
        );
      }
      if (dbProd.stock < qty) {
        return NextResponse.json(
          {
            error:
              dbProd.stock <= 0
                ? `${dbProd.name} şu an stokta tükenmiştir.`
                : `${dbProd.name} için stok yetersizdir (Kalan stok: ${dbProd.stock} adet).`,
          },
          { status: 400 }
        );
      }

      subtotal += dbProd.price * qty;
      validatedItems.push({
        productId: dbProd.id,
        name: dbProd.name,
        slug: dbProd.slug,
        price: dbProd.price,
        quantity: qty,
        image: dbProd.image,
      });
      stockDeductions.push({ productIndex: prodIdx, qty });
    }

    // Check coupon (server-side)
    let couponDiscount = 0;
    let appliedCoupon = "";
    if (couponCode) {
      const foundCoupon = db.coupons.find(
        (c) => c.active && c.code.toUpperCase() === couponCode
      );
      if (foundCoupon && subtotal >= foundCoupon.minOrder) {
        appliedCoupon = foundCoupon.code;
        if (foundCoupon.type === "fixed") {
          couponDiscount = foundCoupon.value;
        } else {
          couponDiscount = Math.round((subtotal * foundCoupon.value) / 100);
        }
      }
    }

    const secondItemDiscount = calculateSecondItemDiscount(validatedItems);
    const totalPromoAndCoupon = Math.min(subtotal, couponDiscount + secondItemDiscount);
    const afterCoupon = Math.max(0, subtotal - totalPromoAndCoupon);
    const havaleRate = Number(db.settings.havaleDiscountRate || 10);
    const havaleDiscount =
      paymentMethod === "Havale - EFT"
        ? Math.round((afterCoupon * havaleRate) / 100)
        : 0;

    const totalAmount = Math.max(0, afterCoupon - havaleDiscount);

    // Idempotency guard: prevent duplicate orders on accidental double-click within 30 seconds
    const itemSig = validatedItems
      .map((i) => `${i.productId}:${i.quantity}`)
      .sort()
      .join(",");
    const nowMs = Date.now();
    const recentDuplicate = db.orders.find((o) => {
      const age = nowMs - new Date(o.createdAt).getTime();
      if (age < 0 || age > 30000) return false;
      const oSig = o.items
        .map((i) => `${i.productId}:${i.quantity}`)
        .sort()
        .join(",");
      return (
        o.customerPhone.replace(/\D/g, "") === phoneDigits &&
        oSig === itemSig &&
        o.totalAmount === totalAmount
      );
    });

    if (recentDuplicate) {
      return NextResponse.json(
        {
          success: true,
          deduplicated: true,
          order: recentDuplicate,
          mailSent: recentDuplicate.mailSent,
        },
        { status: 200 }
      );
    }

    // Atomic stock deduction
    for (const d of stockDeductions) {
      db.products[d.productIndex].stock = Math.max(
        0,
        db.products[d.productIndex].stock - d.qty
      );
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `DGV-${randomNum}`;

    const newOrder: Order = {
      id: orderId,
      orderType,
      userId: user ? user.id : null,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerPhone: phone,
      customerEmail: email,
      customerCity: city,
      customerDistrict: district,
      customerAddress: address,
      items: validatedItems,
      subtotal,
      couponCode:
        secondItemDiscount > 0
          ? appliedCoupon
            ? `${appliedCoupon} + 2.URUN%20`
            : "2.URUN%20"
          : appliedCoupon,
      couponDiscount: totalPromoAndCoupon,
      havaleDiscount,
      totalAmount,
      paymentMethod,
      notes,
      status: "Yeni Sipariş",
      trackingNumber: "",
      mailSent: false,
      createdAt: new Date().toISOString(),
    };

    const mailRes = await sendOrderEmail(newOrder, db.settings);
    newOrder.mailSent = mailRes.sent;
    newOrder.mailPreviewHtml = mailRes.html;

    db.orders.unshift(newOrder);
    writeDb(db);

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
        mailSent: mailRes.sent,
        mailInfo: mailRes.error || "E-posta başarıyla gönderildi.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order POST error:", err);
    return NextResponse.json(
      { error: "Sipariş oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
