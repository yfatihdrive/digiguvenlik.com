import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
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
