import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import {
  COOKIE_NAME,
  createSessionToken,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { User } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// In-memory brute-force rate limiter (10 failed login attempts / 15 min per key)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const rec = loginAttempts.get(key);
  if (!rec || now > rec.resetAt) {
    return true;
  }
  return rec.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const rec = loginAttempts.get(key);
  if (!rec || now > rec.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count += 1;
  }
}

function clearAttempts(key: string) {
  loginAttempts.delete(key);
}

function setSessionCookie(res: NextResponse, token: string, isHttps: boolean) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    sameSite: "lax",
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  const { passwordHash: _, ...safeUser } = user;
  void _;
  return NextResponse.json({ user: safeUser });
}

export async function POST(req: NextRequest) {
  try {
    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.url.startsWith("https://");
    const body = await req.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const db = readDb();

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    if (action === "login") {
      const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
      const password = String(body.password || "").slice(0, 128);
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
      const rateKey = `${ip}:${email}`;

      if (!checkRateLimit(rateKey)) {
        return NextResponse.json(
          {
            error:
              "Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.",
          },
          { status: 429 }
        );
      }

      if (!email || !password) {
        return NextResponse.json(
          { error: "E-posta adresi ve şifre zorunludur." },
          { status: 400 }
        );
      }

      const user = db.users.find(
        (u) => u.email.toLowerCase() === email && verifyPassword(password, u.passwordHash)
      );
      if (!user) {
        recordFailedAttempt(rateKey);
        return NextResponse.json(
          { error: "E-posta adresi veya şifre hatalı." },
          { status: 401 }
        );
      }

      clearAttempts(rateKey);
      const token = createSessionToken(user);
      const { passwordHash: _, ...safeUser } = user;
      void _;
      const res = NextResponse.json({ success: true, user: safeUser });
      setSessionCookie(res, token, isHttps);
      return res;
    }

    if (action === "register") {
      const firstName = String(body.firstName || "").trim().slice(0, 80);
      const lastName = String(body.lastName || "").trim().slice(0, 80);
      const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
      const phone = String(body.phone || "").trim().slice(0, 30);
      const password = String(body.password || "");
      const city = String(body.city || "").trim().slice(0, 60);
      const district = String(body.district || "").trim().slice(0, 60);
      const address = String(body.address || "").trim().slice(0, 400);

      if (!firstName || !lastName || !email || !password) {
        return NextResponse.json(
          { error: "Lütfen zorunlu alanları doldurun." },
          { status: 400 }
        );
      }

      if (!EMAIL_RE.test(email)) {
        return NextResponse.json(
          { error: "Lütfen geçerli bir e-posta adresi girin." },
          { status: 400 }
        );
      }

      if (password.length < 6 || password.length > 128) {
        return NextResponse.json(
          { error: "Şifreniz en az 6 karakter olmalıdır." },
          { status: 400 }
        );
      }

      if (db.users.some((u) => u.email.toLowerCase() === email)) {
        return NextResponse.json(
          { error: "Bu e-posta adresi ile kayıtlı bir üyelik zaten mevcut." },
          { status: 409 }
        );
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        firstName,
        lastName,
        email,
        phone,
        passwordHash: hashPassword(password),
        role: "member",
        city,
        district,
        address,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      writeDb(db);

      const token = createSessionToken(newUser);
      const { passwordHash: _, ...safeUser } = newUser;
      void _;
      const res = NextResponse.json({ success: true, user: safeUser }, { status: 201 });
      setSessionCookie(res, token, isHttps);
      return res;
    }

    if (action === "update_profile") {
      const current = await getCurrentUser();
      if (!current) {
        return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
      }
      const idx = db.users.findIndex((u) => u.id === current.id);
      if (idx === -1) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
      }
      db.users[idx] = {
        ...db.users[idx],
        firstName:
          typeof body.firstName === "string" && body.firstName.trim()
            ? body.firstName.trim().slice(0, 80)
            : db.users[idx].firstName,
        lastName:
          typeof body.lastName === "string" && body.lastName.trim()
            ? body.lastName.trim().slice(0, 80)
            : db.users[idx].lastName,
        phone:
          typeof body.phone === "string"
            ? body.phone.trim().slice(0, 30)
            : db.users[idx].phone,
        city:
          typeof body.city === "string"
            ? body.city.trim().slice(0, 60)
            : db.users[idx].city,
        district:
          typeof body.district === "string"
            ? body.district.trim().slice(0, 60)
            : db.users[idx].district,
        address:
          typeof body.address === "string"
            ? body.address.trim().slice(0, 400)
            : db.users[idx].address,
      };
      if (typeof body.newPassword === "string" && body.newPassword.length > 0) {
        if (body.newPassword.length < 6 || body.newPassword.length > 128) {
          return NextResponse.json(
            { error: "Yeni şifre en az 6 karakter olmalıdır." },
            { status: 400 }
          );
        }
        db.users[idx].passwordHash = hashPassword(body.newPassword);
      }
      writeDb(db);
      const { passwordHash: _, ...safeUser } = db.users[idx];
      void _;
      return NextResponse.json({ success: true, user: safeUser });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek formatı." }, { status: 400 });
  }
}
