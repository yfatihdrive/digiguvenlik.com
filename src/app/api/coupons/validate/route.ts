import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";

const couponAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "127.0.0.1").split(",")[0].trim();
    const now = Date.now();
    const rec = couponAttempts.get(ip);
    if (rec && now < rec.resetAt) {
      if (rec.count >= 25) {
        return NextResponse.json(
          { valid: false, message: "Çok fazla kupon denemesi yaptınız. Lütfen biraz bekleyin." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
      rec.count += 1;
    } else {
      couponAttempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }
    const { code, subtotal } = await req.json();
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      return NextResponse.json({ valid: false, message: "Lütfen bir kupon kodu girin." });
    }
    const db = readDb();
    const coupon = db.coupons.find(
      (c) => c.active && c.code.toUpperCase() === cleanCode
    );
    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Geçersiz veya süresi dolmuş indirim kodu.",
      });
    }
    const sub = Number(subtotal) || 0;
    if (sub > 0 && sub < coupon.minOrder) {
      return NextResponse.json({
        valid: false,
        message: `Bu kupon en az ${coupon.minOrder} ₺ tutarındaki siparişlerde geçerlidir.`,
      });
    }
    const discount =
      coupon.type === "fixed"
        ? coupon.value
        : Math.round((sub * coupon.value) / 100);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.description,
      message: `${coupon.description} uygulandı!`,
    });
  } catch {
    return NextResponse.json({ valid: false, message: "Kupon doğrulanamadı." });
  }
}
