// app/api/admin/student-edit/route.ts

import { NextResponse }                    from "next/server";
import { db }                              from "@/db/index";
import { students, classes, sections, sessions } from "@/db/schema";
import { and, eq }                         from "drizzle-orm";

const PHOTO_BASE = "https://scholavue.id/public/uploads";
const photoUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${PHOTO_BASE}/${raw.replace(/^\/+/, "").split("/").pop()}`;
};

// ── GET: fetch student + classes + sections ──────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id       = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!id || !schoolId)
      return NextResponse.json({ success: false, message: "id and schoolId required" }, { status: 400 });

    // Student
    const [row] = await db
      .select({
        id:               students.id,
        schoolId:         students.schoolId,
        admissionNo:      students.admissionNo,
        folioNo:          students.folioNo,
        rollNo:           students.rollNo,
        admissionDate:    students.admissionDate,
        name:             students.name,
        gender:           students.gender,
        dob:              students.dob,
        bloodGroup:       students.bloodGroup,
        religion:         students.religion,
        caste:            students.caste,
        nationality:      students.nationality,
        mobile:           students.mobile,
        email:            students.email,
        address:          students.address,
        city:             students.city,
        state:            students.state,
        pincode:          students.pincode,
        fatherName:       students.fatherName,
        fatherOccupation: students.fatherOccupation,
        motherName:       students.motherName,
        parentContact:    students.parentContact,
        guardianName:     students.guardianName,
        guardianRelation: students.guardianRelation,
        guardianContact:  students.guardianContact,
        medicalNotes:     students.medicalNotes,
        photo:            students.photo,
        aadhaarNo:        students.aadhaarNo,
        srn:              students.srn,
        pen:              students.pen,
        apaarId:          students.apaarId,
        status:           students.status,
        classId:          students.classId,
        sectionId:        students.sectionId,
        sessionId:        students.sessionId,
        isMainStudent:    students.isMainStudent,
        className:        classes.className,
        sectionName:      sections.sectionName,
      })
      .from(students)
      .leftJoin(classes,  eq(students.classId,   classes.id))
      .leftJoin(sections, eq(students.sectionId, sections.id))
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)))
      .limit(1);

    if (!row)
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });

    // All classes for this school
    const allClasses = await db
      .select({ id: classes.id, className: classes.className })
      .from(classes)
      .where(eq(classes.schoolId, schoolId));

    // Sections for the student's current class
    const allSections = row.classId
      ? await db
          .select({ id: sections.id, sectionName: sections.sectionName })
          .from(sections)
          .where(and(eq(sections.classId, row.classId), eq(sections.schoolId, schoolId)))
      : [];

    return NextResponse.json({
      success: true,
      student: { ...row, photo: photoUrl(row.photo) },
      classes: allClasses,
      sections: allSections,
    });

  } catch (err) {
    console.error("[GET /api/admin/student-edit]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── GET sections for a class (classId param) ─────────────────
// Called when class dropdown changes
// Usage: ?schoolId=1&classId=5
// We reuse GET — if classId param present without id, return sections only
// (Handled above — separate endpoint below)

// ── PUT: update student ──────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const body     = await req.json();
    const id       = Number(body.id);
    const schoolId = Number(body.schoolId);

    if (!id || !schoolId)
      return NextResponse.json({ success: false, message: "id and schoolId required" }, { status: 400 });

    // Build update object — only defined fields
    const update: Record<string, any> = {
      name:             body.name             ?? undefined,
      admissionNo:      body.admissionNo      ?? undefined,
      folioNo:          body.folioNo          ?? undefined,
      rollNo:           body.rollNo           ?? undefined,
      admissionDate:    body.admissionDate    ?? undefined,
      gender:           body.gender           ?? undefined,
      dob:              body.dob              ?? undefined,
      bloodGroup:       body.bloodGroup       ?? undefined,
      religion:         body.religion         ?? undefined,
      caste:            body.caste            ?? undefined,
      nationality:      body.nationality      ?? undefined,
      mobile:           body.mobile           ?? undefined,
      email:            body.email            ?? undefined,
      address:          body.address          ?? undefined,
      city:             body.city             ?? undefined,
      state:            body.state            ?? undefined,
      pincode:          body.pincode          ?? undefined,
      fatherName:       body.fatherName       ?? undefined,
      fatherOccupation: body.fatherOccupation ?? undefined,
      motherName:       body.motherName       ?? undefined,
      parentContact:    body.parentContact    ?? undefined,
      guardianName:     body.guardianName     ?? undefined,
      guardianRelation: body.guardianRelation ?? undefined,
      guardianContact:  body.guardianContact  ?? undefined,
      medicalNotes:     body.medicalNotes     ?? undefined,
      aadhaarNo:        body.aadhaarNo        ?? undefined,
      srn:              body.srn              ?? undefined,
      pen:              body.pen              ?? undefined,
      apaarId:          body.apaarId          ?? undefined,
      classId:          body.classId    ? Number(body.classId)   : undefined,
      sectionId:        body.sectionId  ? Number(body.sectionId) : undefined,
    };

    // Remove undefined keys
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    await db
      .update(students)
      .set(update)
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)));

    return NextResponse.json({ success: true, message: "Student updated successfully" });

  } catch (err) {
    console.error("[PUT /api/admin/student-edit]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}