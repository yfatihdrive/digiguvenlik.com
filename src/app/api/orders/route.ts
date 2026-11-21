import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { sendOrderEmail } from "@/lib/mailer";
import { getCurrentUser } from "@/lib/auth";
import { Order, OrderItem } from "@/lib/types";
import { calculateSecondItemDiscount } from "@/lib/promo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id")?.trim();
  const phone = searchParams.get("phone")?.replace(/\D/g, "");

  const db = readDb();

  if (orderId || phone) {
    const matches = db.orders.filter((o) => {
      if (orderId && o.id.toLowerCase() === orderId.toLowerCase()) return true;
      if (phone && phone.length >= 7 && o.customerPhone.replace(/\D/g, "").includes(phone)) {
        return true;
      }
      return false;
    });
    return NextResponse.json({ orders: matches });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  if (user.role === "admin") {
    return NextResponse.json({ orders: db.orders });
  }

  const myOrders = db.orders.filter(
    (o) => o.userId === user.id || o.customerEmail === user.email
  );
  return NextResponse.json({ orders: myOrders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = readDb();
    const user = await getCurrentUser();

    const firstName = (body.customerFirstName || "").trim();
    const lastName = (body.customerLastName || "").trim();
    const phone = (body.customerPhone || "").trim();
    const email = (body.customerEmail || user?.email || "").trim();
    const city = (body.customerCity || "").trim();
    const district = (body.customerDistrict || "").trim();
    const address = (body.customerAddress || "").trim();
    const paymentMethod = body.paymentMethod || "Kapıda Nakit";
    const notes = (body.notes || "").trim();
    const couponCode = (body.couponCode || "").trim().toUpperCase();
    const orderType = body.orderType === "cart_order" ? "cart_order" : "quick_order";

    if (!firstName || !lastName || !phone || !city || !district || !address) {
      return NextResponse.json(
        { error: "Lütfen ad, soyad, telefon ve teslimat adresi alanlarını eksiksiz doldurun." },
        { status: 400 }
      );
    }

    const rawItems: OrderItem[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: "Sipariş için en az 1 ürün seçilmelidir." },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const validatedItems: OrderItem[] = rawItems.map((it) => {
      const dbProd = db.products.find((p) => p.id === Number(it.productId));
      const unitPrice = dbProd ? dbProd.price : Number(it.price) || 0;
      const qty = Math.max(1, Number(it.quantity) || 1);
      subtotal += unitPrice * qty;
      return {
        productId: dbProd ? dbProd.id : Number(it.productId),
        name: dbProd ? dbProd.name : it.name,
        slug: dbProd ? dbProd.slug : it.slug || "",
        price: unitPrice,
        quantity: qty,
        image: dbProd ? dbProd.image : it.image || "",
      };
    });

    // Check coupon
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
    const totalPromoAndCoupon = couponDiscount + secondItemDiscount;
    const afterCoupon = Math.max(0, subtotal - totalPromoAndCoupon);
    const havaleRate = Number(db.settings.havaleDiscountRate || 10);
    const havaleDiscount =
      paymentMethod === "Havale - EFT"
        ? Math.round((afterCoupon * havaleRate) / 100)
        : 0;

    const totalAmount = Math.max(0, afterCoupon - havaleDiscount);
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
      couponCode: secondItemDiscount > 0
        ? (appliedCoupon ? `${appliedCoupon} + 2.URUN%30` : "2.URUN%30")
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

    return NextResponse.json({
      success: true,
      order: newOrder,
      mailSent: mailRes.sent,
      mailNote: mailRes.error || "Sipariş bildirimi e-posta adresine iletildi.",
    });
  } catch (err) {
    console.error("Order POST error:", err);
    return NextResponse.json(
      { error: "Sipariş oluşturulurken bir hata meydana geldi." },
      { status: 500 }
    );
  }
}
