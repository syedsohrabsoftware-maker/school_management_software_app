// app/api/admin/new_admission/route.js

import { NextResponse }  from "next/server";
import { db }            from "@/db/index";
import { students, studentSiblings, admissionNotifications, classes, sections } from "@/db/schema";
import { eq, and }       from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path              from "path";
import { randomUUID }    from "crypto";

// ── Save file to /public/uploads/ ─────────────────────────
async function saveFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") return null;
  const bytes = await file.arrayBuffer();
  const ext   = (file.name ?? "bin").split(".").pop();
  const name  = `${randomUUID()}.${ext}`;
  const dir   = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(bytes));
  return name;
}

// ── Parse siblings[0][key] from FormData ───────────────────
function parseSiblings(fd) {
  const map = {};
  for (const [key, val] of fd.entries()) {
    const m = key.match(/^siblings\[(\d+)\]\[(.+)\]$/);
    if (!m) continue;
    map[m[1]] = map[m[1]] ?? {};
    map[m[1]][m[2]] = val;
  }
  return Object.values(map);
}

// ══════════════════════════════════════════════════════════
export async function POST(request) {

  // ── Parse form ─────────────────────────────────────────
  let fd;
  try { fd = await request.formData(); }
  catch { return NextResponse.json({ success: false, message: "Invalid form data." }, { status: 400 }); }

  const f = (k) => fd.get(k)?.toString().trim() || null;

  // ── schoolId from form (sent by frontend) ──────────────
  const schoolId = Number(f("school_id"));
  if (!schoolId) {
    return NextResponse.json({ success: false, message: "school_id missing." }, { status: 401 });
  }

  // ── Required fields ────────────────────────────────────
  const required = ["session_id","class_id","section_id","folio_no","name","mobile","father_name"];
  for (const field of required) {
    if (!f(field)) {
      return NextResponse.json(
        { success: false, message: `Required field missing: ${field}` },
        { status: 422 }
      );
    }
  }

  // ── Duplicate folio check ──────────────────────────────
  const dup = await db
    .select({ id: students.id })
    .from(students)
    .where(and(
      eq(students.schoolId,      schoolId),
      eq(students.folioNo,       f("folio_no")),
      eq(students.sessionId,     Number(f("session_id"))),
      eq(students.isMainStudent, 1),
    ))
    .limit(1);

  if (dup.length > 0) {
    return NextResponse.json(
      { success: false, message: "AC/Folio number already exists for this session." },
      { status: 409 }
    );
  }

  // ── Upload files ───────────────────────────────────────
  const get = (k) => { const v = fd.get(k); return v instanceof File ? v : null; };
  const [photoName, birthName, tcName, msName] = await Promise.all([
    saveFile(get("photo")),
    saveFile(get("birth_certificate")),
    saveFile(get("tc_file")),
    saveFile(get("marksheet_file")),
  ]);

  // ── Insert main student ────────────────────────────────
  let mainId;
  try {
    const res = await db.insert(students).values({
      schoolId,
      sessionId:        Number(f("session_id")),
      classId:          Number(f("class_id")),
      sectionId:        Number(f("section_id")),
      rollNo:           f("roll_no"),
      folioNo:          f("folio_no"),
      name:             f("name"),
      gender:           f("gender"),
      dob:              f("dob") ? new Date(f("dob")) : null,
      bloodGroup:       f("blood_group"),
      religion:         f("religion"),
      caste:            f("caste"),
      nationality:      f("nationality"),
      aadhaarNo:        f("aadhaar_no"),
      srn:              f("srn"),
      pen:              f("pen"),
      apaarId:          f("apaar_id"),
      photo:            photoName,
      mobile:           f("mobile"),
      email:            f("email"),
      address:          f("address"),
      city:             f("city"),
      state:            f("state"),
      pincode:          f("pincode"),
      fatherName:       f("father_name"),
      fatherOccupation: f("father_occupation"),
      motherName:       f("mother_name"),
      birthCertificate: birthName,
      tcFile:           tcName,
      marksheetFile:    msName,
      medicalNotes:     f("medical_notes"),
      isMainStudent:    1,
      status:           "Active",
    });
    mainId = Number(res[0].insertId);
  } catch (err) {
    console.error("[new_admission] student insert:", err);
    return NextResponse.json(
      { success: false, message: "DB error while saving student." },
      { status: 500 }
    );
  }

  // ── Admission notification (non-fatal) ─────────────────
  try {
    const [cls] = await db
      .select({ v: classes.className })
      .from(classes)
      .where(eq(classes.id, Number(f("class_id"))))
      .limit(1);
    const [sec] = await db
      .select({ v: sections.sectionName })
      .from(sections)
      .where(eq(sections.id, Number(f("section_id"))))
      .limit(1);
    await db.insert(admissionNotifications).values({
      schoolId,
      studentName: f("name"),
      className:   cls?.v ?? "Unknown",
      sectionName: sec?.v ?? "Unknown",
      admittedBy:  "Admin",
    });
  } catch (err) {
    console.warn("[new_admission] notification:", err);
  }

  // ── Siblings ───────────────────────────────────────────
  for (const [i, sib] of parseSiblings(fd).entries()) {
    if (!sib.name?.trim()) continue;

    const sibPhoto = sib.photo instanceof File ? await saveFile(sib.photo) : null;

    let sibId;
    try {
      const r = await db.insert(students).values({
        schoolId,
        sessionId:     Number(f("session_id")),
        classId:       sib.class_id   ? Number(sib.class_id)   : null,
        sectionId:     sib.section_id ? Number(sib.section_id) : null,
        rollNo:        sib.roll_no    ?? null,
        folioNo:       f("folio_no"),
        name:          sib.name.trim(),
        gender:        sib.gender     ?? null,
        dob:           sib.dob ? new Date(sib.dob) : null,
        aadhaarNo:     sib.aadhaar_no ?? null,
        photo:         sibPhoto,
        isMainStudent: 0,
        mainStudentId: mainId,
        status:        "Active",
      });
      sibId = Number(r[0].insertId);
    } catch (err) {
      console.error(`[new_admission] sibling ${i}:`, err);
      continue;
    }

    try {
      await db.insert(studentSiblings).values({
        schoolId,
        folioNo:        f("folio_no"),
        studentId:      sibId,
        relationToMain: sib.relation ?? null,
      });
    } catch (err) {
      console.warn(`[new_admission] sibling relation ${i}:`, err);
    }
  }

  return NextResponse.json(
    { success: true, message: "Admission submitted successfully!", studentId: mainId },
    { status: 201 }
  );
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}