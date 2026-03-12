import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  GET /api/admin/teachers?schoolId=1
// ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get("schoolId") || "0");
    if (!schoolId)
      return NextResponse.json({ success: false, message: "schoolId required" }, { status: 400 });

    const page  = parseInt(searchParams.get("page")  || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const [data, countRes] = await Promise.all([
      db.query.teachers.findMany({
        where: eq(teachers.schoolId, schoolId),
        limit,
        offset,
      }),
      db.select({ count: sql<number>`COUNT(*)` })
        .from(teachers)
        .where(eq(teachers.schoolId, schoolId)),
    ]);

    return NextResponse.json({
      success: true,
      data,
      total: Number(countRes[0]?.count ?? 0),
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}