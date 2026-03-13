// app/api/admin/photo/route.ts
// ─────────────────────────────────────────────────────────────
// Proxy route: client → Next.js API → Hostinger server → image
// Usage: <img src="/api/admin/photo?file=rohan.jpg" />
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

// Hostinger ka direct file path (jo tumhare browser me kaam karta hai)
const REMOTE_BASE = "https://srv1339-files.hstgr.io/0357ff87d58127d0/files/public_html/public/uploads";

// .env me HOSTINGER_TOKEN ya HOSTINGER_COOKIE daalo agar auth chahiye
// Abhi direct fetch try karta hai
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file || file.includes("..") || file.includes("/")) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const remoteUrl = `${REMOTE_BASE}/${file}`;
    const res = await fetch(remoteUrl);

    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type":  contentType,
        "Cache-Control": "public, max-age=86400", // 1 din cache
      },
    });
  } catch (err) {
    console.error("[photo proxy]", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}