// app/api/admin/admission-form/route.js
// Admission form ke liye classes aur sections fetch karta hai
//
// GET /api/admin/admission-form?schoolId=1             → { classes: [...] }
// GET /api/admin/admission-form?schoolId=1&classId=5  → { sections: [...] }

import { NextResponse } from "next/server";
import { db }           from "@/db/index";
import { classes, sections } from "@/db/schema";
import { eq, and, asc }     from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = Number(searchParams.get("schoolId"));
    const classId  = searchParams.get("classId");

    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json(
        { success: false, message: "schoolId is required" },
        { status: 400 }
      );
    }

    // ── Return sections for a specific class ──────────────
    if (classId) {
      const cid = Number(classId);
      const rows = await db
        .select({ id: sections.id, sectionName: sections.sectionName })
        .from(sections)
        .where(and(eq(sections.schoolId, schoolId), eq(sections.classId, cid)))
        .orderBy(asc(sections.sectionName));

      return NextResponse.json({
        success:  true,
        sections: rows.map(r => ({ id: r.id, section_name: r.sectionName })),
      });
    }

    // ── Return all classes ────────────────────────────────
    const rows = await db
      .select({ id: classes.id, className: classes.className })
      .from(classes)
      .where(eq(classes.schoolId, schoolId))
      .orderBy(asc(classes.className));

    return NextResponse.json({
      success: true,
      classes: rows.map(r => ({ id: r.id, class_name: r.className })),
    });

  } catch (error) {
    console.error("[GET /api/admin/admission-form]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}