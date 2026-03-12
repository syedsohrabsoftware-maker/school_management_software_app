import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, feeDetails, monthlyFees } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!studentId || !schoolId) return NextResponse.json({ success: false, message: "Missing ID" });

    // 1. Student Info
    const studentData = await db.select().from(students)
      .where(and(eq(students.id, studentId), eq(students.schoolId, schoolId))).limit(1);

    if (!studentData.length) return NextResponse.json({ success: false, message: "Student not found" });

    // 2. Fee Structure (Total Grand Fee)
    const structure = await db.select({ grandTotal: feeDetails.grandTotal })
      .from(feeDetails)
      .where(and(eq(feeDetails.studentId, studentId), eq(feeDetails.schoolId, schoolId)))
      .limit(1);

    // 3. Monthly Fee Records (Sorted by latest updated)
    const records = await db.select().from(monthlyFees)
      .where(and(eq(monthlyFees.studentId, studentId), eq(monthlyFees.schoolId, schoolId)))
      .orderBy(desc(monthlyFees.paymentDate), desc(monthlyFees.id));

    return NextResponse.json({
      success: true,
      data: {
        student: studentData[0],
        grandTotalFee: structure[0]?.grandTotal || "0",
        feeRecords: records
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}