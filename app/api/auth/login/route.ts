// app/api/auth/login/route.ts

import { db } from "@/db";
import { schools, teachers, students, userLogins } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
const bcrypt = require("bcryptjs");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, school_code, role } = body;

    if (!email || !password || !school_code || !role) {
      return NextResponse.json(
        { success: false, message: "Saare fields required hain." },
        { status: 400 }
      );
    }

    if (!["admin", "teacher", "student"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role." },
        { status: 400 }
      );
    }

    // ── STEP 1: School verify ──────────────────────────────
    // ✅ FIX: db.query ki jagah db.select use karo
    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.schoolCode, school_code))
      .limit(1);

    if (!school) {
      return NextResponse.json(
        { success: false, message: "Invalid school code." },
        { status: 401 }
      );
    }

    if (!school.isActive) {
      return NextResponse.json(
        { success: false, message: "Access Denied: School ka access suspend hai. Admin se contact karein." },
        { status: 403 }
      );
    }

    let userFound: any   = null;
    let userName: string = "";
    let userId: number   = 0;
    let redirectTo       = "/";

    // ── STEP 2: Role wise login ───────────────────────────

    // ════ ADMIN ════
    if (role === "admin") {
      if (school.email !== email) {
        return NextResponse.json(
          { success: false, message: "Invalid admin credentials." },
          { status: 401 }
        );
      }
      userFound  = school;
      userName   = school.schoolName ?? "Admin";
      userId     = school.id;
      redirectTo = "/admin";
    }

    // ════ TEACHER ════
    else if (role === "teacher") {
      const [teacher] = await db
        .select()
        .from(teachers)
        .where(and(
          eq(teachers.email,    email),
          eq(teachers.schoolId, school.id)
        ))
        .limit(1);

      if (!teacher) {
        return NextResponse.json(
          { success: false, message: "Teacher account not found." },
          { status: 401 }
        );
      }

      if (!teacher.isActive) {
        return NextResponse.json(
          { success: false, message: "Your account is inactive. Please contact school admin." },
          { status: 403 }
        );
      }

      userFound  = teacher;
      userName   = teacher.name ?? "Teacher";
      userId     = teacher.id;
      redirectTo = "/teacher/dashboard";
    }

    // ════ STUDENT ════
    else if (role === "student") {
      const [student] = await db
        .select()
        .from(students)
        .where(and(
          eq(students.mobile,   email),
          eq(students.schoolId, school.id)
        ))
        .limit(1);

      if (!student) {
        return NextResponse.json(
          { success: false, message: "Student account not found. Mobile number check karein." },
          { status: 401 }
        );
      }

      // ✅ students table mein isActive nahi, status use karo
      if (student.status !== "Active") {
        return NextResponse.json(
          { success: false, message: "Your account is inactive. School se contact karein." },
          { status: 403 }
        );
      }

      userFound  = student;
      userName   = student.name ?? "Student";
      userId     = student.id;
      redirectTo = "/student/dashboard";
    }

    // ── STEP 3: Password verify ───────────────────────────
    if (!userFound?.password) {
      return NextResponse.json(
        { success: false, message: "Account setup incomplete hai." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password." },
        { status: 401 }
      );
    }

    // ── STEP 4: Login log ─────────────────────────────────
    try {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
      await db.insert(userLogins).values({
        schoolId:  school.id,
        userId:    userId,
        role:      role as "admin" | "teacher" | "accountant",
        loginTime: new Date(),
        ipAddress: ip,
      });
    } catch (logErr) {
      console.error("[Login Log Error]:", logErr);
    }

    // ── STEP 5: Response + Set-Cookie headers ─────────────
    const userData = {
      id:         userId,
      name:       userName,
      role,
      schoolId:   school.id,
      schoolName: school.schoolName ?? "",
      schoolCode: school_code,

      ...(role === "admin" && {
        email:   school.email   ?? "",
        phone:   school.phone   ?? "",
        address: school.address ?? "",
      }),

      ...(role === "teacher" && {
        email:   userFound.email   ?? "",
        mobile:  userFound.mobile  ?? "",
        subject: userFound.subject ?? "",
      }),

      ...(role === "student" && {
        mobile:     userFound.mobile     ?? "",
        folioNo:    userFound.folioNo    ?? "",
        fatherName: userFound.fatherName ?? "",
        classId:    userFound.classId,
        sectionId:  userFound.sectionId,
      }),
    };

    const response = NextResponse.json({
      success:  true,
      message:  `Welcome, ${userName}!`,
      redirect: redirectTo,
      user:     userData,
    });

    const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
    const cookieBase     = `path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

    response.headers.append("Set-Cookie", `schoolId=${school.id}; ${cookieBase}`);
    response.headers.append("Set-Cookie", `userId=${userId}; ${cookieBase}`);
    response.headers.append("Set-Cookie", `userRole=${role}; ${cookieBase}`);

    return response;

  } catch (error: any) {
    console.error("━━━━━ LOGIN ERROR ━━━━━");
    console.error("Message :", error?.message);
    console.error("Stack   :", error?.stack);
    console.error("━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(
      {
        success: false,
        message: "Server error aaya.",
        ...(process.env.NODE_ENV === "development" && {
          debug: error?.message,
        }),
      },
      { status: 500 }
    );
  }
}