import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, teacherClassAssignments, oldFeePayments, reminderNotificationOldfee } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const schoolId  = Number(searchParams.get("schoolId"));

    if (!studentId || !schoolId)
      return NextResponse.json({ success: false, message: "Missing ID in URL" });

    const [student] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.schoolId, schoolId)))
      .limit(1);

    if (!student)
      return NextResponse.json({ success: false, message: "Student not found" });

    return NextResponse.json({ success: true, data: { student } });
  } catch (error: any) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, schoolId, slipNo, folioNo, month, year, paidAmount, paymentDate, reminderDate, paymentMethod, remarks, enteredBy } = body;

    // 1. Duplicate slip check
    const [existingSlip] = await db
      .select({ id: oldFeePayments.id })
      .from(oldFeePayments)
      .where(and(eq(oldFeePayments.slipNo, slipNo), eq(oldFeePayments.schoolId, schoolId)))
      .limit(1);

    if (existingSlip)
      return NextResponse.json({ success: false, message: `Slip No '${slipNo}' already exists.` });

    // 2. Find assigned teacher
    let assignedTeacherId = 0;

    const [studentInfo] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentInfo) {
      const [teacherData] = await db
        .select({ teacherId: teacherClassAssignments.teacherId })
        .from(teacherClassAssignments)
        .where(and(
          eq(teacherClassAssignments.classId,  studentInfo.classId  ?? 0),
          eq(teacherClassAssignments.schoolId, schoolId),
          eq(teacherClassAssignments.active,   1)  // ✅ FIXED: was `true`, TinyInt needs number
        ))
        .orderBy(desc(teacherClassAssignments.id))
        .limit(1);

      if (teacherData) {
  assignedTeacherId = teacherData.teacherId ?? 0;
}
    }

    // 3. Insert old fee payment
    await db.insert(oldFeePayments).values({
      studentId,
      schoolId,
      teacherId:   assignedTeacherId,
      slipNo,
      folioNo,
      feeMonth:    month,
      feeYear:     year,
      paidAmount:  paidAmount.toString(),
      paymentDate: new Date(paymentDate),
      paymentMethod,
      remarks,
      enteredBy:   enteredBy || "Admin",
    });

    // 4. Reminder notification
    if (reminderDate) {
      await db.insert(reminderNotificationOldfee).values({
  teacherId: assignedTeacherId,
  studentId,
  schoolId,
  message: `Reminder for old fee slip no: ${slipNo} — ${studentInfo?.name || "Student"}`,
  reminderDate: new Date(reminderDate),
  isRead: 0,
});
    }

    return NextResponse.json({ success: true, message: "Old fee payment saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}