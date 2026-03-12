// app/api/admin/class-sections/route.js

import { NextResponse } from "next/server";
import { db }                                    from "@/db/index";
import { students, classes, sections, sessions } from "@/db/schema";
import { and, eq, isNotNull }                    from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ── 1. Validate ────────────────────────────────────────────────────────
    const schoolId = Number(searchParams.get("schoolId"));
    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json(
        { success: false, message: "schoolId is required" },
        { status: 400 }
      );
    }

    const filterByActiveSession = searchParams.get("activeSession") === "true";

    // ── 2. Resolve active session id ───────────────────────────────────────
    let activeSessionId = null;

    if (filterByActiveSession) {
      const [activeSession] = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(
          and(
            eq(sessions.schoolId, schoolId),
            eq(sessions.isActive, 1)
          )
        )
        .limit(1);

      if (!activeSession) {
        return NextResponse.json(
          { success: false, message: "No active session found for this school" },
          { status: 404 }
        );
      }

      activeSessionId = activeSession.id;
    }

    // ── 3. Build conditions ────────────────────────────────────────────────
    const conditions = [
      eq(students.schoolId, schoolId),
      eq(students.status, "Active"),
      isNotNull(students.classId),
      isNotNull(students.sectionId),
    ];

    if (activeSessionId !== null) {
      conditions.push(eq(students.sessionId, activeSessionId));
    }

    // ── 4. JOIN students → classes → sections ─────────────────────────────
    const rows = await db
      .select({
        classId:     students.classId,
        sectionId:   students.sectionId,
        className:   classes.className,
        sectionName: sections.sectionName,
      })
      .from(students)
      .innerJoin(classes,  eq(students.classId,   classes.id))
      .innerJoin(sections, eq(students.sectionId, sections.id))
      .where(and(...conditions));

    // ── 5. Deduplicate + count in JS ───────────────────────────────────────
    const map = new Map();

    for (const row of rows) {
      if (!row.classId || !row.sectionId) continue;

      const key = `${row.classId}_${row.sectionId}`;

      if (map.has(key)) {
        map.get(key).studentCount += 1;
      } else {
        map.set(key, {
          classId:      row.classId,
          sectionId:    row.sectionId,
          className:    row.className   ?? "",
          sectionName:  row.sectionName ?? "",
          studentCount: 1,
        });
      }
    }

    // ── 6. Sort: class numeric → section alpha ─────────────────────────────
    const data = [...map.values()].sort((a, b) => {
      const byClass = a.className.localeCompare(
        b.className, undefined, { numeric: true, sensitivity: "base" }
      );
      return byClass !== 0
        ? byClass
        : a.sectionName.localeCompare(
            b.sectionName, undefined, { numeric: true, sensitivity: "base" }
          );
    });

    // ── 7. Respond ─────────────────────────────────────────────────────────
    return NextResponse.json({
      success:   true,
      sessionId: activeSessionId,
      total:     data.length,
      data,
    });

  } catch (error) {
    console.error("[GET /api/admin/class-sections]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}