import { db } from "@/db";
import {
  students, teachers, sessions,
  monthlyFees, incomes, expenses,
  oldStudents, oldFeePayments, feeDetails,
  attendance, userLogins,
} from "@/db/schema";
import { eq, and, sql, sum } from "drizzle-orm";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  GET /api/admin/dashboard?schoolId=1
//  Replaces entire PHP dashboard.php stats block
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get("schoolId") || "0");
    if (!schoolId)
      return NextResponse.json({ success: false, message: "schoolId required" }, { status: 400 });

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // ── 1. Active Session ──────────────────────────────────────
    const activeSession = await db.query.sessions.findFirst({
  where: and(eq(sessions.schoolId, schoolId), eq(sessions.isActive, 1)),
});
    const sessionId   = activeSession?.id        ?? 0;
    const sessionYear = activeSession?.sessionYear ?? "N/A";

    // ── 2. Students (active session only) ─────────────────────
    const [totalStudentsRes, boysRes, girlsRes] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` })
        .from(students)
        .where(and(eq(students.schoolId, schoolId), eq(students.sessionId, sessionId))),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(students)
        .where(and(
          eq(students.schoolId, schoolId),
          eq(students.sessionId, sessionId),
          eq(students.gender, "Male"),
        )),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(students)
        .where(and(
          eq(students.schoolId, schoolId),
          eq(students.sessionId, sessionId),
          eq(students.gender, "Female"),
        )),
    ]);

    // ── 3. Teachers ────────────────────────────────────────────
    const teachersRes = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(teachers)
      .where(eq(teachers.schoolId, schoolId));

    // ── 4. Today Income (3 sources) ───────────────────────────
    const [incomeFromIncomes, incomeFromMonthlyFees, incomeFromOldStudents, incomeFromOldPayments] =
      await Promise.all([
        db.select({ total: sum(incomes.amount) })
          .from(incomes)
          .where(and(eq(incomes.schoolId, schoolId), sql`DATE(${incomes.incomeDate}) = ${today}`)),

        db.select({ total: sum(monthlyFees.paidAmount) })
          .from(monthlyFees)
          .where(and(eq(monthlyFees.schoolId, schoolId), sql`DATE(${monthlyFees.paymentDate}) = ${today}`)),

        db.select({ total: sum(oldStudents.receivedAmount) })
          .from(oldStudents)
          .where(and(eq(oldStudents.schoolId, schoolId), sql`DATE(${oldStudents.paymentDate}) = ${today}`)),

        db.select({ total: sum(oldFeePayments.paidAmount) })
          .from(oldFeePayments)
          .where(and(eq(oldFeePayments.schoolId, schoolId), sql`DATE(${oldFeePayments.paymentDate}) = ${today}`)),
      ]);

    const incomeToday =
      Number(incomeFromIncomes[0]?.total   ?? 0) +
      Number(incomeFromMonthlyFees[0]?.total ?? 0) +
      Number(incomeFromOldStudents[0]?.total ?? 0) +
      Number(incomeFromOldPayments[0]?.total ?? 0);

    // ── 5. Fee Today (monthly + old students + old payments) ──
    const feeToday =
      Number(incomeFromMonthlyFees[0]?.total ?? 0) +
      Number(incomeFromOldStudents[0]?.total ?? 0) +
      Number(incomeFromOldPayments[0]?.total ?? 0);

    // ── 6. Expense Today ──────────────────────────────────────
    const expenseTodayRes = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(and(eq(expenses.schoolId, schoolId), sql`DATE(${expenses.expenseDate}) = ${today}`));
    const expenseToday = Number(expenseTodayRes[0]?.total ?? 0);

    // ── 7. Total Fee Collection (all time) ────────────────────
    const [totalFeeRes, paidMonthlyRes, paidOldStudentsRes, paidOldPaymentsRes] = await Promise.all([
      db.select({ total: sum(feeDetails.grandTotal) })
        .from(feeDetails)
        .where(eq(feeDetails.schoolId, schoolId)),

      db.select({ total: sum(monthlyFees.paidAmount) })
        .from(monthlyFees)
        .where(eq(monthlyFees.schoolId, schoolId)),

      db.select({ total: sum(oldStudents.receivedAmount) })
        .from(oldStudents)
        .where(eq(oldStudents.schoolId, schoolId)),

      db.select({ total: sum(oldFeePayments.paidAmount) })
        .from(oldFeePayments)
        .where(eq(oldFeePayments.schoolId, schoolId)),
    ]);

    const totalFeeExpected  = Number(totalFeeRes[0]?.total     ?? 0);
    const totalFeeCollected =
  Number(paidMonthlyRes[0]?.total ?? 0) +
  Number(paidOldPaymentsRes[0]?.total ?? 0);
    const totalFeePending     = totalFeeExpected - totalFeeCollected;
    const collectionPct       = totalFeeExpected > 0
      ? parseFloat(((totalFeeCollected / totalFeeExpected) * 100).toFixed(1))
      : 0;

    // ── 8. Income Till Date (all sources) ────────────────────
    const incomeTillDateFromIncomes = await db
      .select({ total: sum(incomes.amount) })
      .from(incomes)
      .where(eq(incomes.schoolId, schoolId));

    const incomeTillDate =
      Number(incomeTillDateFromIncomes[0]?.total ?? 0) +
      Number(paidMonthlyRes[0]?.total            ?? 0) +
      Number(paidOldStudentsRes[0]?.total        ?? 0) +
      Number(paidOldPaymentsRes[0]?.total        ?? 0);

    // ── 9. Attendance Today ────────────────────────────────────
    const attendanceRes = await db
      .select({
        present: sql<number>`SUM(CASE WHEN ${attendance.status} = 'Present' THEN 1 ELSE 0 END)`,
        absent:  sql<number>`SUM(CASE WHEN ${attendance.status} = 'Absent'  THEN 1 ELSE 0 END)`,
      })
      .from(attendance)
      .where(and(
        eq(attendance.schoolId, schoolId),
        sql`DATE(${attendance.attendanceDate}) = ${today}`,
      ));

    // ── 10. Active Users (last 30 min) ────────────────────────
    const activeUsersRes = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${userLogins.userId})` })
      .from(userLogins)
      .where(and(
        eq(userLogins.schoolId, schoolId),
        sql`${userLogins.logoutTime} IS NULL`,
      ));

    // ── 11. Fee Breakdown ─────────────────────────────────────
    const feeBreakdown = {
      passout_students:    Number(paidOldStudentsRes[0]?.total  ?? 0),
      active_students:     Number(paidMonthlyRes[0]?.total      ?? 0),
      pending_active:      Number(paidOldPaymentsRes[0]?.total  ?? 0),
    };

    // ── Response ──────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        session_year: sessionYear,
        session_id:   sessionId,

        demographics: {
          total_students: Number(totalStudentsRes[0]?.count ?? 0),
          boys:           Number(boysRes[0]?.count          ?? 0),
          girls:          Number(girlsRes[0]?.count         ?? 0),
          total_teachers: Number(teachersRes[0]?.count      ?? 0),
          active_users:   Number(activeUsersRes[0]?.count   ?? 0),
        },

        today: {
          income:     incomeToday,
          fee:        feeToday,
          expense:    expenseToday,
          attendance: {
            present: Number(attendanceRes[0]?.present ?? 0),
            absent:  Number(attendanceRes[0]?.absent  ?? 0),
          },
        },

        finance: {
          total_expected:         totalFeeExpected,
          total_collected:        totalFeeCollected,
          total_pending:          totalFeePending,
          collection_percentage:  collectionPct,
          income_till_date:       incomeTillDate,
          breakdown:              feeBreakdown,
        },
      },
    });

  } catch (error) {
    console.error("[Dashboard API]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}