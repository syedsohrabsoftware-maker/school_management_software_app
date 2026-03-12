import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, monthlyFees, classes, sections } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const slipNo = searchParams.get("slip_no");
    const schoolId = Number(searchParams.get("schoolId"));

    if (!studentId || !slipNo || !schoolId) return NextResponse.json({ success: false, message: "Missing parameters" });

    // Fetch Student Info
    const studentData = await db.select({
      name: students.name,
      folioNo: students.folioNo,
      className: classes.className,
      sectionName: sections.sectionName,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .leftJoin(sections, eq(students.sectionId, sections.id))
    .where(and(eq(students.id, studentId), eq(students.schoolId, schoolId)))
    .limit(1);

    // Fetch Specific Slip Info
    const feeData = await db.select()
      .from(monthlyFees)
      .where(and(eq(monthlyFees.studentId, studentId), eq(monthlyFees.slipNo, slipNo), eq(monthlyFees.schoolId, schoolId)))
      .limit(1);

    if (!feeData.length) return NextResponse.json({ success: false, message: "Receipt not found" });

    return NextResponse.json({
      success: true,
      data: { student: studentData[0], payment: feeData[0] }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}