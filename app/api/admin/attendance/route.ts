import { db } from "@/db";
import { attendance, students, classes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId  = parseInt(searchParams.get("schoolId") || "0");
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!schoolId)
      return NextResponse.json({ success: false, message: "schoolId required" }, { status: 400 });

    const summary = await db
      .select({
        present: sql<string>`COALESCE(SUM(CASE WHEN ${attendance.status} = 'Present' THEN 1 ELSE 0 END), 0)`,
        absent:  sql<string>`COALESCE(SUM(CASE WHEN ${attendance.status} = 'Absent'  THEN 1 ELSE 0 END), 0)`,
        late:    sql<string>`COALESCE(SUM(CASE WHEN ${attendance.status} = 'Late'    THEN 1 ELSE 0 END), 0)`,
      })
      .from(attendance)
      .where(and(
        eq(attendance.schoolId, schoolId),
        sql`DATE(${attendance.attendanceDate}) = ${dateParam}`
      ));

    const classWise = await db
      .select({
        class_name: classes.className,
        present: sql<number>`CAST(SUM(CASE WHEN ${attendance.status} = 'Present' THEN 1 ELSE 0 END) AS UNSIGNED)`,
        absent:  sql<number>`CAST(SUM(CASE WHEN ${attendance.status} = 'Absent'  THEN 1 ELSE 0 END) AS UNSIGNED)`,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .innerJoin(classes,  eq(students.classId, classes.id))
      .where(and(
        eq(attendance.schoolId, schoolId),
        sql`DATE(${attendance.attendanceDate}) = ${dateParam}`
      ))
      .groupBy(classes.className)
      .orderBy(classes.className);

    const present = Number(summary[0]?.present || 0);
    const absent  = Number(summary[0]?.absent  || 0);
    const late    = Number(summary[0]?.late    || 0);
    const total   = present + absent + late;
    const pct     = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      data: { date: dateParam, present, absent, late, total, percentage: pct, class_wise: classWise },
    });
  } catch (error) {
    console.error("[Attendance GET]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolId, records } = body;

    if (!schoolId || !records?.length)
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });

    // ✅ FIX 1: onConflictDoUpdate removed — MySQL needs unique index for that.
    // Using DELETE + INSERT upsert pattern instead.
    for (const r of records) {
      const date = new Date(r.date);

      await db.delete(attendance).where(
        and(
          eq(attendance.studentId,      Number(r.studentId)),
          eq(attendance.attendanceDate, date),
          eq(attendance.schoolId,       Number(schoolId))
        )
      );

      // ✅ FIX 2: classId, sectionId, teacherId added — all are notNull in schema
      await db.insert(attendance).values({
        schoolId:       Number(schoolId),
        studentId:      Number(r.studentId),
        classId:        Number(r.classId),
        sectionId:      Number(r.sectionId),
        teacherId:      Number(r.teacherId),
        status:         String(r.status) as "Present" | "Absent" | "Leave",
        attendanceDate: date,
      });
    }

    return NextResponse.json({ success: true, message: "Attendance saved" });
  } catch (error) {
    console.error("[Attendance POST]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}