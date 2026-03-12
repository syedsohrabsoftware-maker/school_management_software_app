import { db } from "@/db";
import { students, classes, sections, sessions } from "@/db/schema";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  GET /api/admin/search?schoolId=1&q=Rahul
//  Replaces: search_students_api.php
// ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get("schoolId") || "0");
    const q        = searchParams.get("q")?.trim() || "";

    if (!schoolId || q.length < 2)
      return NextResponse.json({ success: true, data: [] });

    const keyword = `%${q}%`;

    const results = await db
      .select({
        id:           students.id,
        name:         students.name,
        folio_no:     students.folioNo,
        father_name:  students.fatherName,
        mobile:       students.mobile,
        class_name:   classes.className,
        section_name: sections.sectionName,
        session_year: sessions.sessionYear,
      })
      .from(students)
      .leftJoin(classes,   eq(students.classId,   classes.id))
      .leftJoin(sections,  eq(students.sectionId, sections.id))
      .leftJoin(sessions,  eq(students.sessionId, sessions.id))
      .where(
        and(
          eq(students.schoolId, schoolId),
          or(
            ilike(students.name,    keyword),
            ilike(students.folioNo, keyword),
            ilike(students.mobile,  keyword),
          ),
        ),
      )
      .limit(20);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("[Search API]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}