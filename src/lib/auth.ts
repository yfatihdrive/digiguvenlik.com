import crypto from "crypto";
import { cookies } from "next/headers";
import { readDb } from "./db";
import { User } from "./types";

const DEV_FALLBACK_SECRET = "digiguvenlik-local-dev-session-secret-change-in-prod";
const SECRET = process.env.AUTH_SECRET || DEV_FALLBACK_SECRET;

export const COOKIE_NAME = "digiguvenlik_session";

/**
 * Yeni şifreleri rastgele salt + scrypt ile hash'ler.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 32).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

/**
 * Hem yeni scrypt hash'lerini hem de mevcut seed SHA-256 hash'lerini
 * zamanlama saldırısına (timing attack) dayanıklı biçimde doğrular.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, hexHash] = parts;
    const derived = crypto.scryptSync(password, salt, 32);
    const expected = Buffer.from(hexHash, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  }
  // Legacy SHA-256 fallback (for existing seed accounts)
  const legacy = crypto.createHash("sha256").update(password).digest("hex");
  const a = Buffer.from(legacy, "utf-8");
  const b = Buffer.from(storedHash, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(user: User): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 gün
  });
  const base64 = Buffer.from(payload, "utf-8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(base64)
    .digest("base64url");
  return `${base64}.${sig}`;
}

export function verifySessionToken(token: string): {
  id: string;
  email: string;
  role: "admin" | "member";
  firstName: string;
  lastName: string;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64, sig] = parts;
    if (!base64 || !sig) return null;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(base64)
      .digest("base64url");
    const sigBuf = Buffer.from(sig, "utf-8");
    const expBuf = Buffer.from(expectedSig, "utf-8");
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const data = JSON.parse(Buffer.from(base64, "base64url").toString("utf-8"));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const decoded = verifySessionToken(token);
    if (!decoded) return null;
    const db = readDb();
    const user = db.users.find((u) => u.id === decoded.id);
    return user || null;
  } catch {
    return null;
  }
}
