import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classes, sections, oldFeeDetails } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!studentId || !schoolId) {
      return NextResponse.json({ success: false, message: "Missing ID" });
    }

    // 1. Fetch Student Details
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

    if (!studentData.length) {
      return NextResponse.json({ success: false, message: "Student not found" });
    }

    // 2. Check if Old Fee Already Exists
    const existingFee = await db.select({ id: oldFeeDetails.id })
      .from(oldFeeDetails)
      .where(and(eq(oldFeeDetails.studentId, studentId), eq(oldFeeDetails.schoolId, schoolId)))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        student: studentData[0],
        feeExists: existingFee.length > 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, schoolId, grandTotal } = body;

    if (!grandTotal || Number(grandTotal) <= 0) {
      return NextResponse.json({ success: false, message: "Old Fee cannot be zero or negative." });
    }

    // Check Duplicate Entry
    const existingFee = await db.select({ id: oldFeeDetails.id })
      .from(oldFeeDetails)
      .where(and(eq(oldFeeDetails.studentId, studentId), eq(oldFeeDetails.schoolId, schoolId)))
      .limit(1);

    if (existingFee.length > 0) {
      return NextResponse.json({ success: false, message: "Fee record already exists. Duplicate entry not allowed." });
    }

    // Insert into old_fee_details
    await db.insert(oldFeeDetails).values({
      studentId,
      schoolId,
      grandTotal: grandTotal.toString(),
      // paidTotal wagaira default 0 schema se handle ho jayenge
    });

    return NextResponse.json({ success: true, message: "Old fee record saved successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}