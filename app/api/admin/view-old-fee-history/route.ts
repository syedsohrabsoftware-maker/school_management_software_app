import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classes, sections, oldFeePayments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!studentId || !schoolId) return NextResponse.json({ success: false, message: "Missing ID" });

    const studentData = await db.select({
      id: students.id,
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

    if (!studentData.length) return NextResponse.json({ success: false, message: "Student not found" });

    const payments = await db.select()
      .from(oldFeePayments)
      .where(and(eq(oldFeePayments.studentId, studentId), eq(oldFeePayments.schoolId, schoolId)))
      .orderBy(desc(oldFeePayments.paymentDate), desc(oldFeePayments.id));

    return NextResponse.json({ success: true, data: { student: studentData[0], payments } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = Number(searchParams.get("paymentId"));
    const schoolId = Number(searchParams.get("schoolId"));

    await db.delete(oldFeePayments).where(and(eq(oldFeePayments.id, paymentId), eq(oldFeePayments.schoolId, schoolId)));
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}