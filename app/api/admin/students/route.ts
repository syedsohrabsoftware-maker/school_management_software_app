// app/api/admin/students/route.ts

import { NextResponse }                                        from "next/server";
import { db }                                                  from "@/db/index";
import { students, classes, sections, sessions, studentSiblings } from "@/db/schema";
import { and, eq, or, like, SQL } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ── 1. Validate ────────────────────────────────────────────────────────
    const schoolId = Number(searchParams.get("schoolId"));
    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json({ success: false, message: "schoolId required" }, { status: 400 });
    }

    const page      = Math.max(1, Number(searchParams.get("page")) || 1);
    const search    = (searchParams.get("search") || "").trim();
    const classId   = searchParams.get("classId")   ? Number(searchParams.get("classId"))   : null;
    const sectionId = searchParams.get("sectionId") ? Number(searchParams.get("sectionId")) : null;
    const filterActiveSession = searchParams.get("activeSession") === "true";
    const withSiblings        = searchParams.get("withSiblings")  === "true";

    // ── 2. Resolve active session ──────────────────────────────────────────
    let activeSessionId: number | null = null;
    if (filterActiveSession) {
      const [sess] = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(and(eq(sessions.schoolId, schoolId), eq(sessions.isActive, 1)))
        .limit(1);
      if (!sess) {
        return NextResponse.json({ success: false, message: "No active session" }, { status: 404 });
      }
      activeSessionId = sess.id;
    }

    // ── 3. Build WHERE conditions ──────────────────────────────────────────
    // ✅ FIX 1: explicitly typed as SQL<unknown>[]
    const conditions: SQL<unknown>[] = [
      eq(students.schoolId, schoolId),
      eq(students.status, "Active"),
    ];

    if (activeSessionId) conditions.push(eq(students.sessionId, activeSessionId));
    if (classId)         conditions.push(eq(students.classId, classId));
    if (sectionId)       conditions.push(eq(students.sectionId, sectionId));

    if (search) {
      const pattern = `%${search}%`;
      // ✅ FIX 2: non-null assertion (!) — or() is never undefined here
      //           because we always pass at least one like() argument
      conditions.push(
        or(
          like(students.name,        pattern),
          like(students.mobile,      pattern),
          like(students.folioNo,     pattern),
          like(students.admissionNo, pattern),
        )!
      );
    }

    // ── 4. Count total ─────────────────────────────────────────────────────
    const allRows = await db
      .select({ id: students.id })
      .from(students)
      .where(and(...conditions));

    const total  = allRows.length;
    const pages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const offset = (page - 1) * PAGE_SIZE;

    // ── 5. Fetch paginated students with class + section ───────────────────
    const rows = await db
      .select({
        id:            students.id,
        name:          students.name,
        fatherName:    students.fatherName,
        mobile:        students.mobile,
        folioNo:       students.folioNo,
        admissionNo:   students.admissionNo,
        rollNo:        students.rollNo,
        isMainStudent: students.isMainStudent,
        mainStudentId: students.mainStudentId,
        status:        students.status,
        classId:       students.classId,
        sectionId:     students.sectionId,
        className:     classes.className,
        sectionName:   sections.sectionName,
      })
      .from(students)
      .leftJoin(classes,  eq(students.classId,   classes.id))
      .leftJoin(sections, eq(students.sectionId, sections.id))
      .where(and(...conditions))
      .limit(PAGE_SIZE)
      .offset(offset);

    // ── 6. Shape base response ─────────────────────────────────────────────
    let data = rows.map((r) => ({
      id:            r.id,
      name:          r.name,
      fatherName:    r.fatherName,
      mobile:        r.mobile,
      folioNo:       r.folioNo,
      admissionNo:   r.admissionNo,
      rollNo:        r.rollNo,
      isMainStudent: r.isMainStudent,
      status:        r.status,
      class:   r.classId   ? { id: r.classId,   className:   r.className   } : null,
      section: r.sectionId ? { id: r.sectionId, sectionName: r.sectionName } : null,
      siblings: [] as any[],
    }));

    // ── 7. Attach siblings (only for main students) ────────────────────────
    if (withSiblings && data.length > 0) {
      const mainStudents = data.filter((s) => s.isMainStudent === 1);

      if (mainStudents.length > 0) {
        const folios = [...new Set(mainStudents.map((s) => s.folioNo).filter(Boolean))] as string[];

        const siblingLinks = await db
          .select({
            folioNo:        studentSiblings.folioNo,
            studentId:      studentSiblings.studentId,
            relationToMain: studentSiblings.relationToMain,
          })
          .from(studentSiblings)
          .where(eq(studentSiblings.schoolId, schoolId));

        const relevantLinks = siblingLinks.filter((l) => folios.includes(l.folioNo));

        if (relevantLinks.length > 0) {
          const siblingIds = [...new Set(relevantLinks.map((l) => l.studentId))];

          const siblingRows = await db
            .select({
              id:          students.id,
              name:        students.name,
              rollNo:      students.rollNo,
              classId:     students.classId,
              sectionId:   students.sectionId,
              className:   classes.className,
              sectionName: sections.sectionName,
            })
            .from(students)
            .leftJoin(classes,  eq(students.classId,   classes.id))
            .leftJoin(sections, eq(students.sectionId, sections.id))
            .where(eq(students.schoolId, schoolId));

          const siblingMap = new Map(
            siblingRows
              .filter((r) => siblingIds.includes(r.id))
              .map((r) => [r.id, r])
          );

          const folioSiblings: Record<string, any[]> = {};
          for (const link of relevantLinks) {
            const sibStudent = siblingMap.get(link.studentId);
            if (!sibStudent) continue;
            if (!folioSiblings[link.folioNo]) folioSiblings[link.folioNo] = [];
            folioSiblings[link.folioNo].push({
              id:             sibStudent.id,
              name:           sibStudent.name,
              rollNo:         sibStudent.rollNo ?? null,
              relationToMain: link.relationToMain,
              class:   sibStudent.classId   ? { id: sibStudent.classId,   className:   sibStudent.className   } : null,
              section: sibStudent.sectionId ? { id: sibStudent.sectionId, sectionName: sibStudent.sectionName } : null,
            });
          }

          data = data.map((s) => ({
            ...s,
            siblings: s.isMainStudent === 1 && s.folioNo
              ? (folioSiblings[s.folioNo] || [])
              : [],
          }));
        }
      }
    }

    // ── 8. Respond ─────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data,
      pagination: { total, page, pages, limit: PAGE_SIZE },
    });

  } catch (error) {
    console.error("[GET /api/admin/students]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}