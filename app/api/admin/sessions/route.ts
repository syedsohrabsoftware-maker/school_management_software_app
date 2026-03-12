// FILE PATH: app/api/admin/sessions/route.ts

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  GET  /api/admin/sessions?schoolId=1  → list all sessions
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get("schoolId") || "0");

    if (!schoolId)
      return NextResponse.json(
        { success: false, message: "schoolId required" },
        { status: 400 }
      );

    const allSessions = await db.query.sessions.findMany({
      where: eq(sessions.schoolId, schoolId),
      orderBy: (s, { desc }) => [desc(s.id)],
    });

    return NextResponse.json({ success: true, data: allSessions });
  } catch (error) {
    console.error("[GET /api/admin/sessions]", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  POST /api/admin/sessions
//  action = "create" | "edit" | "delete" | "activate"
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolId, sessionId, action, session_year } = body;

    if (!schoolId)
      return NextResponse.json(
        { success: false, message: "schoolId required" },
        { status: 400 }
      );

    // ── CREATE ──────────────────────────────────────────────
    // PHP: INSERT INTO sessions (school_id, session_year, is_active)
    if (action === "create") {
      if (!session_year?.trim())
        return NextResponse.json(
          { success: false, message: "session_year required" },
          { status: 400 }
        );

      await db.insert(sessions).values({
  schoolId,
  sessionYear: session_year.trim(),
  isActive: 0,
});

      return NextResponse.json({
        success: true,
        message: "Session add ho gayi",
      });
    }

    // ── EDIT ────────────────────────────────────────────────
    // PHP: UPDATE sessions SET session_year=? WHERE id=? AND school_id=?
    if (action === "edit") {
      if (!sessionId)
        return NextResponse.json(
          { success: false, message: "sessionId required" },
          { status: 400 }
        );
      if (!session_year?.trim())
        return NextResponse.json(
          { success: false, message: "session_year required" },
          { status: 400 }
        );

      await db
        .update(sessions)
        .set({ sessionYear: session_year.trim() })
        .where(
          and(eq(sessions.id, sessionId), eq(sessions.schoolId, schoolId))
        );

      return NextResponse.json({
        success: true,
        message: "Session update ho gayi",
      });
    }

    // ── DELETE ──────────────────────────────────────────────
    // PHP: DELETE FROM sessions WHERE id=? AND school_id=?
    if (action === "delete") {
      if (!sessionId)
        return NextResponse.json(
          { success: false, message: "sessionId required" },
          { status: 400 }
        );

      await db
        .delete(sessions)
        .where(
          and(eq(sessions.id, sessionId), eq(sessions.schoolId, schoolId))
        );

      return NextResponse.json({
        success: true,
        message: "Session delete ho gayi",
      });
    }

    // ── ACTIVATE ────────────────────────────────────────────
    // PHP: UPDATE sessions SET is_active=0 WHERE school_id=?
    //      UPDATE sessions SET is_active=1 WHERE id=? AND school_id=?
    if (action === "activate") {
      if (!sessionId)
        return NextResponse.json(
          { success: false, message: "sessionId required" },
          { status: 400 }
        );

      // Step 1 — sab inactive
      await db
        .update(sessions)
        .set({ isActive: 0 })
        .where(eq(sessions.schoolId, schoolId));

      // Step 2 — selected active
      await db
        .update(sessions)
        .set({ isActive: 1 })
        .where(
          and(eq(sessions.id, sessionId), eq(sessions.schoolId, schoolId))
        );

      return NextResponse.json({
        success: true,
        message: "Session activated",
      });
    }

    // ── Unknown action ───────────────────────────────────────
    return NextResponse.json(
      { success: false, message: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("[POST /api/admin/sessions]", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}