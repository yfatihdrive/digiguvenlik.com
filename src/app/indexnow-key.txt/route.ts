import { NextResponse } from "next/server";

export async function GET() {
  const key =
    (process.env.INDEXNOW_API_KEY || "").trim() ||
    "digiguvenlik2026indexnowkey902168251057";
  return new NextResponse(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
