// app/api/admin/fee-dashboard/route.js
//
// GET /api/admin/fee-dashboard?id=1171&schoolId=1
//
// Returns:
//   student       – profile + class/section/session
//   siblings      – via studentSiblings
//   currentFee    – fee_details grand_total + monthly_fees paid sum
//   oldFee        – old_fee_details grand_total + old_fee_payments paid sum
//   monthlyFees   – all monthly_fees rows (current session)
//   oldPayments   – all old_fee_payments rows

import { NextResponse }                from "next/server";
import { db }                          from "@/db/index";
import {
  students, classes, sections, sessions,
  studentSiblings,
  feeDetails, monthlyFees,
  oldFeeDetails, oldFeePayments,
} from "@/db/schema";
import { and, eq, desc, sum, sql }     from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id       = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!id || !schoolId) {
      return NextResponse.json({ success: false, message: "id and schoolId required" }, { status: 400 });
    }

    // ── 1. Student + class + section + session ─────────────────────────────
    const [row] = await db
      .select({
        id:            students.id,
        name:          students.name,
        folioNo:       students.folioNo,
        admissionNo:   students.admissionNo,
        rollNo:        students.rollNo,
        photo:         students.photo,
        fatherName:    students.fatherName,
        mobile:        students.mobile,
        address:       students.address,
        city:          students.city,
        state:         students.state,
        status:        students.status,
        isMainStudent: students.isMainStudent,
        classId:       students.classId,
        sectionId:     students.sectionId,
        sessionId:     students.sessionId,
        className:     classes.className,
        sectionName:   sections.sectionName,
        sessionYear:   sessions.sessionYear,
      })
      .from(students)
      .leftJoin(classes,  eq(students.classId,   classes.id))
      .leftJoin(sections, eq(students.sectionId, sections.id))
      .leftJoin(sessions, eq(students.sessionId, sessions.id))
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)))
      .limit(1);

    if (!row) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // ── 2. Siblings ────────────────────────────────────────────────────────
    let siblings = [];
    if (row.folioNo) {
      const links = await db
        .select({ studentId: studentSiblings.studentId, relationToMain: studentSiblings.relationToMain })
        .from(studentSiblings)
        .where(and(eq(studentSiblings.schoolId, schoolId), eq(studentSiblings.folioNo, row.folioNo)));

      const sibIds = links.filter(l => l.studentId !== id);

      if (sibIds.length > 0) {
        const allSibRows = await db
          .select({
            id: students.id, name: students.name, rollNo: students.rollNo,
            photo: students.photo, isMainStudent: students.isMainStudent,
            classId: students.classId, sectionId: students.sectionId,
            className: classes.className, sectionName: sections.sectionName,
          })
          .from(students)
          .leftJoin(classes,  eq(students.classId,   classes.id))
          .leftJoin(sections, eq(students.sectionId, sections.id))
          .where(eq(students.schoolId, schoolId));

        const sibMap = new Map(allSibRows.map(r => [r.id, r]));
        siblings = sibIds.map(({ studentId, relationToMain }) => {
          const s = sibMap.get(studentId);
          if (!s) return null;
          return {
            id: s.id, name: s.name, rollNo: s.rollNo,
            photo: s.photo, isMainStudent: s.isMainStudent,
            relationToMain,
            class:   s.classId   ? { id: s.classId,   className:   s.className   } : null,
            section: s.sectionId ? { id: s.sectionId, sectionName: s.sectionName } : null,
          };
        }).filter(Boolean);
      }
    }

    // ── 3. Current Fee (fee_details) ───────────────────────────────────────
    const [feeRow] = await db
      .select({ grandTotal: feeDetails.grandTotal })
      .from(feeDetails)
      .where(and(eq(feeDetails.studentId, id), eq(feeDetails.schoolId, schoolId)))
      .orderBy(desc(feeDetails.id))
      .limit(1);

    const grandTotal = parseFloat(feeRow?.grandTotal ?? "0");

    // Sum of monthly_fees paid
    const [paidRow] = await db
      .select({ total: sql`COALESCE(SUM(${monthlyFees.paidAmount}), 0)` })
      .from(monthlyFees)
      .where(and(eq(monthlyFees.studentId, id), eq(monthlyFees.schoolId, schoolId)));

    const paidTotal  = parseFloat(paidRow?.total ?? "0");
    const balanceFee = Math.max(0, grandTotal - paidTotal);
    const paidPct    = grandTotal > 0 ? Math.min(100, Math.round((paidTotal / grandTotal) * 100)) : 0;

    // ── 4. Old / Pending Fee (old_fee_details) ─────────────────────────────
    const [oldFeeRow] = await db
      .select({ grandTotal: oldFeeDetails.grandTotal })
      .from(oldFeeDetails)
      .where(and(eq(oldFeeDetails.studentId, id), eq(oldFeeDetails.schoolId, schoolId)))
      .orderBy(desc(oldFeeDetails.id))
      .limit(1);

    const oldGrandTotal = parseFloat(oldFeeRow?.grandTotal ?? "0");

    const [oldPaidRow] = await db
      .select({ total: sql`COALESCE(SUM(${oldFeePayments.paidAmount}), 0)` })
      .from(oldFeePayments)
      .where(and(eq(oldFeePayments.studentId, id), eq(oldFeePayments.schoolId, schoolId)));

    const oldPaidTotal  = parseFloat(oldPaidRow?.total ?? "0");
    const oldBalanceFee = Math.max(0, oldGrandTotal - oldPaidTotal);
    const oldPaidPct    = oldGrandTotal > 0 ? Math.min(100, Math.round((oldPaidTotal / oldGrandTotal) * 100)) : 0;

    // ── 5. Combined totals ─────────────────────────────────────────────────
    const combinedTotal       = oldGrandTotal + grandTotal;
    const combinedPaid        = oldPaidTotal  + paidTotal;
    const combinedOutstanding = Math.max(0, combinedTotal - combinedPaid);
    const combinedPct         = combinedTotal > 0 ? Math.min(100, Math.round((combinedPaid / combinedTotal) * 100)) : 0;

    // ── 6. Monthly fee history rows ────────────────────────────────────────
    const monthlyFeeRows = await db
      .select({
        id: monthlyFees.id, slipNo: monthlyFees.slipNo,
        feeMonth: monthlyFees.feeMonth, feeYear: monthlyFees.feeYear,
        paidAmount: monthlyFees.paidAmount, paymentDate: monthlyFees.paymentDate,
        paymentMethod: monthlyFees.paymentMethod, remarks: monthlyFees.remarks,
      })
      .from(monthlyFees)
      .where(and(eq(monthlyFees.studentId, id), eq(monthlyFees.schoolId, schoolId)))
      .orderBy(desc(monthlyFees.feeYear));

    // ── 7. Old payment history rows ────────────────────────────────────────
    const oldPaymentRows = await db
      .select({
        id: oldFeePayments.id, slipNo: oldFeePayments.slipNo,
        paidAmount: oldFeePayments.paidAmount, paymentDate: oldFeePayments.paymentDate,
        paymentMethod: oldFeePayments.paymentMethod, remarks: oldFeePayments.remarks,
      })
      .from(oldFeePayments)
      .where(and(eq(oldFeePayments.studentId, id), eq(oldFeePayments.schoolId, schoolId)))
      .orderBy(desc(oldFeePayments.paymentDate));

    // ── 8. Shape & respond ─────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: row.id, name: row.name, folioNo: row.folioNo,
          admissionNo: row.admissionNo, rollNo: row.rollNo,
          photo: row.photo, fatherName: row.fatherName,
          mobile: row.mobile, address: row.address,
          city: row.city, state: row.state,
          status: row.status, isMainStudent: row.isMainStudent,
          class:   row.classId   ? { id: row.classId,   className:   row.className   } : null,
          section: row.sectionId ? { id: row.sectionId, sectionName: row.sectionName } : null,
          session: row.sessionId ? { id: row.sessionId, sessionYear: row.sessionYear } : null,
        },
        siblings,
        currentFee: { grandTotal, paidTotal, balanceFee, paidPct },
        oldFee:     { grandTotal: oldGrandTotal, paidTotal: oldPaidTotal, balanceFee: oldBalanceFee, paidPct: oldPaidPct },
        combined:   { total: combinedTotal, paid: combinedPaid, outstanding: combinedOutstanding, pct: combinedPct },
        monthlyFees: monthlyFeeRows.map(r => ({
          id: r.id, slipNo: r.slipNo, feeMonth: r.feeMonth, feeYear: r.feeYear,
          paidAmount: parseFloat(r.paidAmount ?? "0"),
          paymentDate: r.paymentDate, paymentMethod: r.paymentMethod, remarks: r.remarks,
        })),
        oldPayments: oldPaymentRows.map(r => ({
          id: r.id, slipNo: r.slipNo,
          paidAmount: parseFloat(r.paidAmount ?? "0"),
          paymentDate: r.paymentDate, paymentMethod: r.paymentMethod, remarks: r.remarks,
        })),
      },
    });

  } catch (error) {
    console.error("[GET /api/admin/fee-dashboard]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}