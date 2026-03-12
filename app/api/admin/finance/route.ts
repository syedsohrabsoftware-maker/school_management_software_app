import { db } from "@/db";
import { monthlyFees, incomes, expenses, oldStudents, oldFeePayments, feeDetails } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm"; // 🚨 removed sum(), using raw SQL for safety
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get("schoolId") || "0");
    const type     = searchParams.get("type") || "all"; // today | total | breakdown | all

    if (!schoolId)
      return NextResponse.json({ success: false, message: "schoolId required" }, { status: 400 });

    // ── 1. BULLETPROOF IST DATE ────────────────────────────────
    const dateIst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const yyyy = dateIst.getFullYear();
    const mm = String(dateIst.getMonth() + 1).padStart(2, '0');
    const dd = String(dateIst.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;

    // ── TODAY ───────────────────────────────────────────────
    const getTodayData = async () => {
      const [i1, i2, i3, i4, exp] = await Promise.all([
        db.select({ t: sql<number>`COALESCE(SUM(${incomes.amount}), 0)` }).from(incomes)
          .where(and(eq(incomes.schoolId, schoolId), sql`DATE(${incomes.incomeDate}) = ${today}`)),

        db.select({ t: sql<number>`COALESCE(SUM(${monthlyFees.paidAmount}), 0)` }).from(monthlyFees)
          .where(and(eq(monthlyFees.schoolId, schoolId), sql`DATE(${monthlyFees.paymentDate}) = ${today}`)),

        db.select({ t: sql<number>`COALESCE(SUM(${oldStudents.receivedAmount}), 0)` }).from(oldStudents)
          .where(and(eq(oldStudents.schoolId, schoolId), sql`DATE(${oldStudents.paymentDate}) = ${today}`)),

        db.select({ t: sql<number>`COALESCE(SUM(${oldFeePayments.paidAmount}), 0)` }).from(oldFeePayments)
          .where(and(eq(oldFeePayments.schoolId, schoolId), sql`DATE(${oldFeePayments.paymentDate}) = ${today}`)),

        db.select({ t: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` }).from(expenses)
          .where(and(eq(expenses.schoolId, schoolId), sql`DATE(${expenses.expenseDate}) = ${today}`)),
      ]);

      const income1 = Number(i1[0]?.t || 0);
      const income2 = Number(i2[0]?.t || 0);
      const income3 = Number(i3[0]?.t || 0);
      const income4 = Number(i4[0]?.t || 0);

      const fee_today     = income2 + income3 + income4;
      const income_today  = income1 + fee_today;
      const expense_today = Number(exp[0]?.t || 0);

      return { income_today, fee_today, expense_today };
    };

    // ── TOTAL ───────────────────────────────────────────────
    const getTotalData = async () => {
      const [totalFee, monthly, oldStu, oldPay, allIncome] = await Promise.all([
        db.select({ t: sql<number>`COALESCE(SUM(${feeDetails.grandTotal}), 0)` }).from(feeDetails).where(eq(feeDetails.schoolId, schoolId)),
        db.select({ t: sql<number>`COALESCE(SUM(${monthlyFees.paidAmount}), 0)` }).from(monthlyFees).where(eq(monthlyFees.schoolId, schoolId)),
        db.select({ t: sql<number>`COALESCE(SUM(${oldStudents.receivedAmount}), 0)` }).from(oldStudents).where(eq(oldStudents.schoolId, schoolId)),
        db.select({ t: sql<number>`COALESCE(SUM(${oldFeePayments.paidAmount}), 0)` }).from(oldFeePayments).where(eq(oldFeePayments.schoolId, schoolId)),
        db.select({ t: sql<number>`COALESCE(SUM(${incomes.amount}), 0)` }).from(incomes).where(eq(incomes.schoolId, schoolId)),
      ]);

      const total_expected  = Number(totalFee[0]?.t || 0);
      
      const monthly_total = Number(monthly[0]?.t || 0);
      const oldStu_total = Number(oldStu[0]?.t || 0);
      const oldPay_total = Number(oldPay[0]?.t || 0);
      const all_pure_incomes = Number(allIncome[0]?.t || 0);

      const total_fee_collection = monthly_total + oldStu_total + oldPay_total;
      
      // PHP Logic Match (Total Collected = only monthly, for main card)
      const total_collected = monthly_total; 
      const total_pending   = total_expected - total_collected;
      
      const collection_pct  = total_expected > 0 ? parseFloat(((total_fee_collection / total_expected) * 100).toFixed(1)) : 0;
      const income_till_date = all_pure_incomes + total_fee_collection;

      return { total_expected, total_collected, total_fee_collection, total_pending, collection_pct, income_till_date };
    };

    // ── BREAKDOWN ───────────────────────────────────────────
    const getBreakdown = async () => {
      const [monthly, oldStu, oldPay] = await Promise.all([
        db.select({ t: sql<number>`COALESCE(SUM(${monthlyFees.paidAmount}), 0)` }).from(monthlyFees).where(eq(monthlyFees.schoolId, schoolId)),
        db.select({ t: sql<number>`COALESCE(SUM(${oldStudents.receivedAmount}), 0)` }).from(oldStudents).where(eq(oldStudents.schoolId, schoolId)),
        db.select({ t: sql<number>`COALESCE(SUM(${oldFeePayments.paidAmount}), 0)` }).from(oldFeePayments).where(eq(oldFeePayments.schoolId, schoolId)),
      ]);

      return {
        active_students:  Number(monthly[0]?.t || 0),
        passout_students: Number(oldStu[0]?.t || 0),
        pending_active:   Number(oldPay[0]?.t || 0),
      };
    };

    // ── Combine based on type ───────────────────────────────
    let responseData: any = {};

    if (type === "today" || type === "all")     responseData = { ...responseData, today:     await getTodayData() };
    if (type === "total" || type === "all")     responseData = { ...responseData, total:     await getTotalData() };
    if (type === "breakdown" || type === "all") responseData = { ...responseData, breakdown: await getBreakdown() };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("[Finance API]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}