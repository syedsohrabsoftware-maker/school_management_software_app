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

    // 1. Fetch Student Data
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

    // 2. Fetch Existing Fee
    const existingFee = await db.select()
      .from(feeDetails)
      .where(and(eq(feeDetails.studentId, studentId), eq(feeDetails.schoolId, schoolId)))
      .limit(1);

    if (!existingFee.length) return NextResponse.json({ success: false, message: "No fee record found to edit." });

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
      ne(students.id, studentId)
    ));

    // 🔥 FIX: SAFE DATA MAPPER 🔥
    // Yeh Drizzle schema keys aur raw DB column dono ko check karke sahi data set karega
    const fee = existingFee[0] as any;
    const safeFeeDetails = {
      registrationFee: fee.registrationFee ?? fee.registration_fee ?? "0",
      admissionFee: fee.admissionFee ?? fee.admission_fee ?? "0",
      annualCharge: fee.annualCharge ?? fee.annual_charge ?? "0",
      tuitionFee: fee.tuitionFee ?? fee.tuition_fee ?? "0",
      otherFee: fee.otherFee ?? fee.other_fee ?? "0",
      grandTotal: fee.grandTotal ?? fee.grand_total ?? "0",
      dueDate: fee.dueDate ?? fee.due_date ?? null,
    };

    return NextResponse.json({
      success: true,
      data: { 
        student: studentData[0], 
        feeDetails: safeFeeDetails, 
        siblings: siblingsData 
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

    await db.update(feeDetails).set({
      registrationFee: registrationFee.toString(),
      admissionFee: admissionFee.toString(),
      annualCharge: annualCharge.toString(),
      tuitionFee: tuitionFee.toString(),
      otherFee: otherFee.toString(),
      grandTotal: grandTotal.toString(),
      dueDate: dueDate ? new Date(dueDate) : null,
    }).where(and(eq(feeDetails.studentId, studentId), eq(feeDetails.schoolId, schoolId)));

    return NextResponse.json({ success: true, message: "Fee details updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!studentId || !schoolId) return NextResponse.json({ success: false, message: "Missing ID" });

    await db.delete(feeDetails).where(and(eq(feeDetails.studentId, studentId), eq(feeDetails.schoolId, schoolId)));

    return NextResponse.json({ success: true, message: "Fee details deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}