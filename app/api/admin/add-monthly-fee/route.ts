import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, monthlyFees, teacherClassAssignments, reminderNotifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("id"));
    const schoolId  = Number(searchParams.get("schoolId"));

    if (!studentId || !schoolId)
      return NextResponse.json({ success: false, message: "Missing ID" });

    const [student] = await db
      .select({ id: students.id, name: students.name, folioNo: students.folioNo, classId: students.classId, sectionId: students.sectionId })
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.schoolId, schoolId)))
      .limit(1);

    if (!student)
      return NextResponse.json({ success: false, message: "Student not found" });

    return NextResponse.json({ success: true, data: { student } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const { studentId, schoolId, slipNo, folioNo, month, year, paidAmount, paymentDate, reminderDate, paymentMethod, remarks } = await req.json();

    // 1. Duplicate slip check
    const [existingSlip] = await db
      .select({ id: monthlyFees.id })
      .from(monthlyFees)
      .where(and(eq(monthlyFees.slipNo, slipNo), eq(monthlyFees.schoolId, schoolId)))
      .limit(1);

    if (existingSlip)
      return NextResponse.json({ success: false, message: `Slip No '${slipNo}' already exists.` });

    // 2. Insert fee
    await db.insert(monthlyFees).values({
      studentId: Number(studentId),
      schoolId: Number(schoolId),
      slipNo: String(slipNo),
      folioNo: String(folioNo),
      feeMonth: String(month),
      feeYear: Number(year),
      paidAmount: String(paidAmount),
      paymentDate: new Date(paymentDate),
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      paymentMethod: String(paymentMethod),
      remarks: remarks ? String(remarks) : null,
    });

    // 3. Reminder notification
    if (reminderDate) {
      const [studentData] = await db
        .select({ name: students.name, classId: students.classId, sectionId: students.sectionId })
        .from(students)
        .where(eq(students.id, Number(studentId)))
        .limit(1);

      if (studentData) {
        const [teacher] = await db
          .select({ teacherId: teacherClassAssignments.teacherId })
          .from(teacherClassAssignments)
          .where(and(
            eq(teacherClassAssignments.classId,   studentData.classId   ?? 0),
            eq(teacherClassAssignments.sectionId, studentData.sectionId ?? 0),
            eq(teacherClassAssignments.schoolId,  Number(schoolId)),
            eq(teacherClassAssignments.active, 1)
          ))
          .orderBy(desc(teacherClassAssignments.id))
          .limit(1);

        if (teacher) {
          // 🔥 FIXED: isRead ko 0/1 (Number) kiya kyunki MySQL TinyInt leta hai
          await db.insert(reminderNotifications).values({
            teacherId: teacher.teacherId,
            studentId: Number(studentId),
            schoolId:  Number(schoolId),
            message:   `Reminder: Collect fee from ${studentData.name || "Student"}`,
            reminderDate: new Date(reminderDate),
            isRead: 0, 
          } as any); // temporary 'as any' use karein agar schema mismatch ho
        }
      }
    }

    return NextResponse.json({ success: true, message: "Monthly fee saved successfully." });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}