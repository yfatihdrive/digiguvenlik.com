import crypto from "crypto";
import { cookies } from "next/headers";
import { readDb } from "./db";
import { User } from "./types";

const SECRET = process.env.AUTH_SECRET || "digi güvenlik-super-secret-key-2026";
export const COOKIE_NAME = "digiguvenlik_session";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createSessionToken(user: User): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  });
  const base64 = Buffer.from(payload, "utf-8").toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(base64).digest("base64url");
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
    const [base64, sig] = token.split(".");
    if (!base64 || !sig) return null;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(base64)
      .digest("base64url");
    if (sig !== expectedSig) return null;
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
