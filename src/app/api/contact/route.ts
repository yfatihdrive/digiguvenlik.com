import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const contactRate = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const rec = contactRate.get(ip);
    if (rec && now < rec.resetAt && rec.count >= 5) {
      return NextResponse.json(
        { error: "Çok fazla mesaj gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }

    const body = await req.json();

    // Invisible Honeypot spam trap: bots filling "website" are silently ignored
    if (typeof body?.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Mesajınız alındı." });
    }

    const name = String(body?.name || "").trim().slice(0, 100);
    const phone = String(body?.phone || "").trim().slice(0, 30);
    const email = String(body?.email || "").trim().slice(0, 120);
    const message = String(body?.message || "").trim().slice(0, 1500);

    if (name.length < 2 || message.length < 5) {
      return NextResponse.json(
        { error: "Lütfen adınızı ve mesajınızı (en az 5 karakter) eksiksiz girin." },
        { status: 400 }
      );
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    if (!rec || now >= rec.resetAt) {
      contactRate.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    } else {
      rec.count += 1;
    }

    const logDir = path.join(process.cwd(), "data", "contact-logs");
    fs.mkdirSync(logDir, { recursive: true });
    const entry = {
      id: `MSG-${Date.now()}`,
      name,
      phone,
      email,
      message,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(
      path.join(logDir, `${entry.id}.json`),
      JSON.stringify(entry, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      {
        success: true,
        id: entry.id,
        message: "Mesajınız başarıyla iletildi. En kısa sürede dönüş yapılacaktır.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Mesaj işlenirken geçersiz istek formatı alındı." },
      { status: 400 }
    );
  }
}
