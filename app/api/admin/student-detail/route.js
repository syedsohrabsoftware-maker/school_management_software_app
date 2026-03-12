// app/api/admin/student-detail/route.js
//
// GET /api/admin/student-detail?id=1171&schoolId=1
//
// Returns full student record with:
//   - class, section, session joined
//   - siblings (via studentSiblings table → students join)

import { NextResponse }                                              from "next/server";
import { db }                                                        from "@/db/index";
import { students, classes, sections, sessions, studentSiblings }   from "@/db/schema";
import { and, eq }                                                   from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const id       = Number(searchParams.get("id"));
    const schoolId = Number(searchParams.get("schoolId"));

    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }
    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json({ success: false, message: "schoolId is required" }, { status: 400 });
    }

    // ── 1. Fetch main student with class + section + session ───────────────
    const [row] = await db
      .select({
        // student fields
        id:               students.id,
        name:             students.name,
        admissionNo:      students.admissionNo,
        folioNo:          students.folioNo,
        rollNo:           students.rollNo,
        admissionDate:    students.admissionDate,
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
        photo:            students.photo,
        aadhaarNo:        students.aadhaarNo,
        srn:              students.srn,
        pen:              students.pen,
        apaarId:          students.apaarId,
        tcFile:           students.tcFile,
        marksheetFile:    students.marksheetFile,
        medicalNotes:     students.medicalNotes,
        status:           students.status,
        isMainStudent:    students.isMainStudent,
        mainStudentId:    students.mainStudentId,
        fatherName:       students.fatherName,
        fatherOccupation: students.fatherOccupation,
        motherName:       students.motherName,
        parentContact:    students.parentContact,
        guardianName:     students.guardianName,
        guardianRelation: students.guardianRelation,
        guardianContact:  students.guardianContact,
        sessionId:        students.sessionId,
        classId:          students.classId,
        sectionId:        students.sectionId,
        // joined
        className:        classes.className,
        sectionName:      sections.sectionName,
        sessionYear:      sessions.sessionYear,
      })
      .from(students)
      .leftJoin(classes,  eq(students.classId,   classes.id))
      .leftJoin(sections, eq(students.sectionId, sections.id))
      .leftJoin(sessions, eq(students.sessionId, sessions.id))
      .where(
        and(
          eq(students.id,       id),
          eq(students.schoolId, schoolId)
        )
      )
      .limit(1);

    if (!row) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // ── 2. Fetch siblings via studentSiblings table ────────────────────────
    //
    // studentSiblings: { folioNo, studentId, relationToMain }
    //   folioNo   = shared family folio
    //   studentId = the sibling's students.id
    //
    // Strategy:
    //   a) Get sibling links matching this student's folioNo
    //   b) Exclude the student itself
    //   c) Join sibling student records for name + class + section
    //
    let siblings = [];

    if (row.folioNo) {
      const links = await db
        .select({
          studentId:      studentSiblings.studentId,
          relationToMain: studentSiblings.relationToMain,
        })
        .from(studentSiblings)
        .where(
          and(
            eq(studentSiblings.schoolId, schoolId),
            eq(studentSiblings.folioNo,  row.folioNo)
          )
        );

      // Exclude self
      const sibIds = links
        .map((l) => ({ id: l.studentId, relation: l.relationToMain }))
        .filter((l) => l.id !== id);

      if (sibIds.length > 0) {
        // Fetch sibling student rows
        const sibRows = await db
          .select({
            id:          students.id,
            name:        students.name,
            rollNo:      students.rollNo,
            classId:     students.classId,
            sectionId:   students.sectionId,
            className:   classes.className,
            sectionName: sections.sectionName,
          })
          .from(students)
          .leftJoin(classes,  eq(students.classId,   classes.id))
          .leftJoin(sections, eq(students.sectionId, sections.id))
          .where(eq(students.schoolId, schoolId));

        const sibMap = new Map(sibRows.map((r) => [r.id, r]));

        siblings = sibIds
          .map(({ id: sibId, relation }) => {
            const s = sibMap.get(sibId);
            if (!s) return null;
            return {
              id:             s.id,
              name:           s.name,
              rollNo:         s.rollNo ?? null,
              relationToMain: relation ?? null,
              class:   s.classId   ? { id: s.classId,   className:   s.className   } : null,
              section: s.sectionId ? { id: s.sectionId, sectionName: s.sectionName } : null,
            };
          })
          .filter(Boolean);
      }
    }

    // ── 3. Shape response ──────────────────────────────────────────────────
    const data = {
      id:               row.id,
      name:             row.name,
      admissionNo:      row.admissionNo,
      folioNo:          row.folioNo,
      rollNo:           row.rollNo,
      admissionDate:    row.admissionDate,
      gender:           row.gender,
      dob:              row.dob,
      bloodGroup:       row.bloodGroup,
      religion:         row.religion,
      caste:            row.caste,
      nationality:      row.nationality,
      mobile:           row.mobile,
      email:            row.email,
      address:          row.address,
      city:             row.city,
      state:            row.state,
      pincode:          row.pincode,
      photo:            row.photo,
      aadhaarNo:        row.aadhaarNo,
      srn:              row.srn,
      pen:              row.pen,
      apaarId:          row.apaarId,
      tcFile:           row.tcFile,
      marksheetFile:    row.marksheetFile,
      medicalNotes:     row.medicalNotes,
      status:           row.status,
      isMainStudent:    row.isMainStudent,
      fatherName:       row.fatherName,
      fatherOccupation: row.fatherOccupation,
      motherName:       row.motherName,
      parentContact:    row.parentContact,
      guardianName:     row.guardianName,
      guardianRelation: row.guardianRelation,
      guardianContact:  row.guardianContact,
      class:   row.classId   ? { id: row.classId,   className:   row.className   } : null,
      section: row.sectionId ? { id: row.sectionId, sectionName: row.sectionName } : null,
      session: row.sessionId ? { id: row.sessionId, sessionYear: row.sessionYear } : null,
      siblings,
    };

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("[GET /api/admin/student-detail]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}