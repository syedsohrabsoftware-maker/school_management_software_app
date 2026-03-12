import { NextResponse } from "next/server";
import { db } from "@/db"; 
import { students, classes, sections, feeDetails, studentSiblings } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!studentId || !schoolId) return NextResponse.json({ success: false, message: "Missing ID" });

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

    if (!studentData.length) return NextResponse.json({ success: false, message: "Student not found" });

    // 2. Check if Fee Already Exists
    const existingFee = await db.select({ id: feeDetails.id })
      .from(feeDetails)
      .where(and(eq(feeDetails.studentId, studentId), eq(feeDetails.schoolId, schoolId)))
      .limit(1);

    // 3. Fetch Siblings
    const siblingsData = await db.select({
      id: students.id,
      name: students.name,
      relationToMain: studentSiblings.relationToMain,
    })
    .from(studentSiblings)
    .innerJoin(students, eq(studentSiblings.studentId, students.id))
    .where(and(
      eq(studentSiblings.folioNo, studentData[0].folioNo || ""),
      eq(studentSiblings.schoolId, schoolId),
      ne(students.id, studentId) // Exclude current student
    ));

    return NextResponse.json({
      success: true,
      data: {
        student: studentData[0],
        feeExists: existingFee.length > 0,
        siblings: siblingsData,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, schoolId, registrationFee, admissionFee, annualCharge, tuitionFee, otherFee, grandTotal, dueDate } = body;

    // Check Duplicate Entry Again (Security)
    const existingFee = await db.select({ id: feeDetails.id })
      .from(feeDetails)
      .where(and(eq(feeDetails.studentId, studentId), eq(feeDetails.schoolId, schoolId)))
      .limit(1);

    if (existingFee.length > 0) {
      return NextResponse.json({ success: false, message: "Fee record already exists. Duplicate entry not allowed." });
    }

    // Insert new fee
    await db.insert(feeDetails).values({
      studentId,
      schoolId,
      registrationFee: registrationFee.toString(),
      admissionFee: admissionFee.toString(),
      annualCharge: annualCharge.toString(),
      tuitionFee: tuitionFee.toString(),
      otherFee: otherFee.toString(),
      grandTotal: grandTotal.toString(),
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return NextResponse.json({ success: true, message: "Fee record saved successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}