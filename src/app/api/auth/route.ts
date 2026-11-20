import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import {
  COOKIE_NAME,
  createSessionToken,
  getCurrentUser,
  hashPassword,
} from "@/lib/auth";
import { User } from "@/lib/types";

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
    const body = await req.json();
    const action = body.action;
    const db = readDb();

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    if (action === "login") {
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";
      const hashed = hashPassword(password);

      const user = db.users.find(
        (u) => u.email.toLowerCase() === email && u.passwordHash === hashed
      );
      if (!user) {
        return NextResponse.json(
          { error: "E-posta adresi veya şifre hatalı." },
          { status: 401 }
        );
      }

      const token = createSessionToken(user);
      const { passwordHash: _, ...safeUser } = user;
      void _;
      const res = NextResponse.json({ success: true, user: safeUser });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
      return res;
    }

    if (action === "register") {
      const firstName = (body.firstName || "").trim();
      const lastName = (body.lastName || "").trim();
      const email = (body.email || "").trim().toLowerCase();
      const phone = (body.phone || "").trim();
      const password = body.password || "";
      const city = (body.city || "").trim();
      const district = (body.district || "").trim();
      const address = (body.address || "").trim();

      if (!firstName || !lastName || !email || !password) {
        return NextResponse.json(
          { error: "Lütfen zorunlu alanları doldurun." },
          { status: 400 }
        );
      }

      if (db.users.some((u) => u.email.toLowerCase() === email)) {
        return NextResponse.json(
          { error: "Bu e-posta adresi ile kayıtlı bir üyelik zaten mevcut." },
          { status: 400 }
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
      const res = NextResponse.json({ success: true, user: safeUser });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
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
        firstName: body.firstName ?? db.users[idx].firstName,
        lastName: body.lastName ?? db.users[idx].lastName,
        phone: body.phone ?? db.users[idx].phone,
        city: body.city ?? db.users[idx].city,
        district: body.district ?? db.users[idx].district,
        address: body.address ?? db.users[idx].address,
      };
      if (body.newPassword && body.newPassword.length >= 4) {
        db.users[idx].passwordHash = hashPassword(body.newPassword);
      }
      writeDb(db);
      const { passwordHash: _, ...safeUser } = db.users[idx];
      void _;
      return NextResponse.json({ success: true, user: safeUser });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch (err) {
    console.error("Auth API error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
