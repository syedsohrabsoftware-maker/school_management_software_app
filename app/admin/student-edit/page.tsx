"use client";

import {
  ChevronLeft, Save, Printer, User, BookOpen, Phone,
  MapPin, Users, Heart, FileText, Camera, CheckCircle,
  AlertCircle, Loader2, ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PHOTO_BASE = "https://scholavue.id/public/uploads";
const FONT = "'Plus Jakarta Sans','DM Sans','Segoe UI',system-ui,sans-serif";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

// ── Field component ───────────────────────────────────────────
function Field({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}{sublabel && <span style={{ fontWeight: 500, color: "#94A3B8", marginLeft: 4, textTransform: "none" }}>{sublabel}</span>}
      </label>
      {children}
    </div>
  );
}

const INP: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 10,
  border: "1.5px solid #E2E8F0", background: "#F8FAFC",
  fontSize: 13, fontWeight: 600, color: "#0F172A",
  outline: "none", fontFamily: FONT, boxSizing: "border-box" as const,
  transition: "border-color .15s, background .15s",
};

function Input({ value, onChange, placeholder, type = "text", disabled }: any) {
  return (
    <input
      type={type} value={value ?? ""} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      style={INP}
      onFocus={e => { e.target.style.borderColor = "#818CF8"; e.target.style.background = "#fff"; }}
      onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; }}
    />
  );
}

function Select({ value, onChange, children, disabled }: any) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value ?? ""} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ ...INP, appearance: "none", cursor: "pointer", paddingRight: 32 }}
        onFocus={e => { (e.target as any).style.borderColor = "#818CF8"; (e.target as any).style.background = "#fff"; }}
        onBlur={e  => { (e.target as any).style.borderColor = "#E2E8F0"; (e.target as any).style.background = "#F8FAFC"; }}
      >
        {children}
      </select>
      <ChevronDown size={13} color="#94A3B8" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

function Textarea({ value, onChange, placeholder }: any) {
  return (
    <textarea
      value={value ?? ""} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={3}
      style={{ ...INP, resize: "vertical", minHeight: 70 }}
      onFocus={e => { e.target.style.borderColor = "#818CF8"; e.target.style.background = "#fff"; }}
      onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; }}
    />
  );
}

// ── Section header ────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, color }: { icon: React.ElementType; title: string; subtitle: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 14px" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
        <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>{subtitle}</div>
      </div>
      <div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
function StudentEditPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const studentId    = searchParams.get("id");

  const [form,     setForm]     = useState<any>({});
  const [classes,  setClasses]  = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const schoolId = getCookie("schoolId") || "1";

  // Load student
  useEffect(() => {
    if (!studentId) return;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/admin/student-edit?id=${studentId}&schoolId=${schoolId}`);
        const json = await res.json();
        if (json.success) {
          setForm(json.student);
          setClasses(json.classes || []);
          setSections(json.sections || []);
          if (json.student.photo) setPhotoPreview(json.student.photo);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [studentId]);

  // Load sections when class changes
  const handleClassChange = async (classId: string) => {
    setForm((p: any) => ({ ...p, classId: Number(classId), sectionId: null }));
    if (!classId) { setSections([]); return; }
    try {
      const res  = await fetch(`/api/admin/sections?classId=${classId}&schoolId=${schoolId}`);
      const json = await res.json();
      setSections(json.data || json.sections || []);
    } catch (e) { console.error(e); }
  };

  const f = (key: string) => (val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  // Photo preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res  = await fetch("/api/admin/student-edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, schoolId }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ type: "success", msg: "Student updated successfully!" });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ type: "error", msg: json.message || "Update failed" });
      }
    } catch (e) {
      setToast({ type: "error", msg: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} color="#818CF8" style={{ animation: "spin .8s linear infinite" }} />
          <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>Loading student data…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const photoSrc = photoPreview || (form.photo ? form.photo : null);

  return (
    <div style={{ minHeight: "100dvh", background: "#F8FAFC", fontFamily: FONT, color: "#0F172A", paddingBottom: 100 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}} input:disabled,select:disabled{opacity:.6;cursor:not-allowed}`}</style>

      {/* ── STICKY HEADER ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid #F1F5F9", boxShadow: "0 1px 12px #0000000a" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 12, background: "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <ChevronLeft size={18} color="#475569" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>Edit Student</h1>
            <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, margin: 0 }}>
              {form.name || "—"} · AC# {form.folioNo || "—"}
            </p>
          </div>
          <button onClick={() => window.print()}
            style={{ width: 36, height: 36, borderRadius: 12, background: "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Printer size={15} color="#475569" />
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, background: saving ? "#C7D2FE" : "#4F46E5", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} /> : <Save size={14} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 100, animation: "slideUp .3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 14, background: toast.type === "success" ? "#F0FDF4" : "#FFF1F2", border: `1px solid ${toast.type === "success" ? "#BBF7D0" : "#FECDD3"}`, boxShadow: "0 4px 20px #0000001a", fontSize: 13, fontWeight: 700, color: toast.type === "success" ? "#16A34A" : "#E11D48", whiteSpace: "nowrap" }}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {toast.msg}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 14px" }}>

        {/* ── PHOTO + ID CARD ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", boxShadow: "0 1px 8px #0000000a", overflow: "hidden", marginBottom: 12 }}>
          <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", padding: "20px 20px 16px", display: "flex", gap: 16, alignItems: "flex-end" }}>
            {/* Photo box */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 80, height: 96, borderRadius: 12, overflow: "hidden", border: "2.5px solid rgba(255,255,255,0.3)", background: "#334155" }}>
                {photoSrc
                  ? <img src={photoSrc} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={28} color="rgba(255,255,255,0.3)" />
                    </div>
                }
              </div>
              <button onClick={() => fileRef.current?.click()}
                style={{ position: "absolute", bottom: -6, right: -6, width: 26, height: 26, borderRadius: 99, background: "#818CF8", border: "2px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Camera size={11} color="#fff" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
            </div>
            {/* Name + badges */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{form.name || "—"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginTop: 3 }}>{form.fatherName ? `S/O ${form.fatherName}` : ""}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {form.className && <span style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.12)", color: "#e2e8f0", fontSize: 10, fontWeight: 700 }}>{form.className}{form.sectionName ? `–${form.sectionName}` : ""}</span>}
                {form.folioNo   && <span style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.12)", color: "#e2e8f0", fontSize: 10, fontWeight: 700 }}>AC# {form.folioNo}</span>}
                {form.status   && <span style={{ padding: "3px 8px", borderRadius: 6, background: form.status === "Active" ? "#16A34A" : "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700 }}>{form.status}</span>}
              </div>
            </div>
          </div>
          {/* Photo note */}
          <div style={{ padding: "8px 16px", fontSize: 10, color: "#94A3B8", fontWeight: 600, background: "#FAFBFC", borderTop: "1px solid #F1F5F9" }}>
            📷 Tap camera icon to change photo · Photo upload requires separate file handling
          </div>
        </div>

        {/* ══ SECTION 1: BASIC INFO ══ */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", boxShadow: "0 1px 8px #0000000a", padding: "16px 16px 20px", marginBottom: 12 }}>
          <Section icon={User} title="Basic Information" subtitle="मूल जानकारी" color="#4F46E5" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Full Name" sublabel="/ नाम">
                <Input value={form.name} onChange={f("name")} placeholder="Student full name" />
              </Field>
            </div>
            <Field label="Admission No.">
              <Input value={form.admissionNo} onChange={f("admissionNo")} placeholder="Admission no." />
            </Field>
            <Field label="Folio / AC No.">
              <Input value={form.folioNo} onChange={f("folioNo")} placeholder="Folio no." />
            </Field>
            <Field label="Roll No.">
              <Input value={form.rollNo} onChange={f("rollNo")} placeholder="Roll no." />
            </Field>
            <Field label="Admission Date">
              <Input value={form.admissionDate} onChange={f("admissionDate")} type="date" />
            </Field>
            <Field label="SRN No.">
              <Input value={form.srn} onChange={f("srn")} placeholder="SRN" />
            </Field>
            <Field label="PEN No.">
              <Input value={form.pen} onChange={f("pen")} placeholder="PEN" />
            </Field>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="APAAR ID">
                <Input value={form.apaarId} onChange={f("apaarId")} placeholder="APAAR ID" />
              </Field>
            </div>
            <Field label="Class" sublabel="/ कक्षा">
              <Select value={form.classId} onChange={handleClassChange}>
                <option value="">— Select Class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
              </Select>
            </Field>
            <Field label="Section" sublabel="/ अनुभाग">
              <Select value={form.sectionId} onChange={f("sectionId")}>
                <option value="">— Select Section —</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
              </Select>
            </Field>
          </div>
        </div>

        {/* ══ SECTION 2: PERSONAL ══ */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", boxShadow: "0 1px 8px #0000000a", padding: "16px 16px 20px", marginBottom: 12 }}>
          <Section icon={Heart} title="Personal Details" subtitle="व्यक्तिगत विवरण" color="#E11D48" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Gender" sublabel="/ लिंग">
              <Select value={form.gender} onChange={f("gender")}>
                <option value="">— Select —</option>
                <option value="Male">Male / पुरुष</option>
                <option value="Female">Female / महिला</option>
                <option value="Other">Other / अन्य</option>
              </Select>
            </Field>
            <Field label="Date of Birth">
              <Input value={form.dob} onChange={f("dob")} type="date" />
            </Field>
            <Field label="Blood Group">
              <Input value={form.bloodGroup} onChange={f("bloodGroup")} placeholder="e.g. B+" />
            </Field>
            <Field label="Religion" sublabel="/ धर्म">
              <Input value={form.religion} onChange={f("religion")} placeholder="Religion" />
            </Field>
            <Field label="Caste" sublabel="/ जाति">
              <Input value={form.caste} onChange={f("caste")} placeholder="Caste" />
            </Field>
            <Field label="Nationality">
              <Input value={form.nationality} onChange={f("nationality")} placeholder="Indian" />
            </Field>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Aadhaar No.">
                <Input value={form.aadhaarNo} onChange={f("aadhaarNo")} placeholder="12-digit Aadhaar number" />
              </Field>
            </div>
          </div>
        </div>

        {/* ══ SECTION 3: CONTACT ══ */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", boxShadow: "0 1px 8px #0000000a", padding: "16px 16px 20px", marginBottom: 12 }}>
          <Section icon={Phone} title="Contact Information" subtitle="संपर्क जानकारी" color="#0284C7" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Mobile" sublabel="/ मोबाइल">
              <Input value={form.mobile} onChange={f("mobile")} placeholder="Mobile no." type="tel" />
            </Field>
            <Field label="Email" sublabel="/ ईमेल">
              <Input value={form.email} onChange={f("email")} placeholder="email@example.com" type="email" />
            </Field>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Address" sublabel="/ पता">
                <Input value={form.address} onChange={f("address")} placeholder="Full residential address" />
              </Field>
            </div>
            <Field label="City" sublabel="/ शहर">
              <Input value={form.city} onChange={f("city")} placeholder="City" />
            </Field>
            <Field label="State" sublabel="/ राज्य">
              <Input value={form.state} onChange={f("state")} placeholder="State" />
            </Field>
            <Field label="Pin Code">
              <Input value={form.pincode} onChange={f("pincode")} placeholder="6-digit pincode" />
            </Field>
          </div>
        </div>

        {/* ══ SECTION 4: PARENT ══ */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", boxShadow: "0 1px 8px #0000000a", padding: "16px 16px 20px", marginBottom: 12 }}>
          <Section icon={Users} title="Parent / Guardian" subtitle="अभिभावक विवरण" color="#D97706" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Father's Name">
              <Input value={form.fatherName} onChange={f("fatherName")} placeholder="Father's full name" />
            </Field>
            <Field label="Father Occupation">
              <Input value={form.fatherOccupation} onChange={f("fatherOccupation")} placeholder="Occupation" />
            </Field>
            <Field label="Mother's Name">
              <Input value={form.motherName} onChange={f("motherName")} placeholder="Mother's full name" />
            </Field>
            <Field label="Parent Contact">
              <Input value={form.parentContact} onChange={f("parentContact")} placeholder="Parent mobile" type="tel" />
            </Field>
            <Field label="Guardian Name">
              <Input value={form.guardianName} onChange={f("guardianName")} placeholder="Guardian (if any)" />
            </Field>
            <Field label="Relation">
              <Input value={form.guardianRelation} onChange={f("guardianRelation")} placeholder="e.g. Uncle" />
            </Field>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Guardian Contact">
                <Input value={form.guardianContact} onChange={f("guardianContact")} placeholder="Guardian mobile" type="tel" />
              </Field>
            </div>
          </div>
        </div>

        {/* ══ SECTION 5: ADDITIONAL ══ */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", boxShadow: "0 1px 8px #0000000a", padding: "16px 16px 20px", marginBottom: 12 }}>
          <Section icon={FileText} title="Additional Information" subtitle="अतिरिक्त जानकारी" color="#16A34A" />
          <Field label="Medical Notes">
            <Textarea value={form.medicalNotes} onChange={f("medicalNotes")} placeholder="Any medical conditions or special notes..." />
          </Field>
        </div>

        {/* ══ SIGNATURE STRIP ══ */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px dashed #E2E8F0", padding: "20px 16px", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {["Parent / Guardian Sign\nअभिभावक हस्ताक्षर", "Class Teacher Sign\nकक्षा अध्यापक हस्ताक्षर", "Principal Sign & Stamp\nप्रधानाचार्य हस्ताक्षर"].map((label, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ height: 1, background: "#94A3B8", margin: "32px 8px 6px" }} />
                <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.03em", lineHeight: 1.6, whiteSpace: "pre-line" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FOOTER SAVE BTN ══ */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.back()}
            style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#F1F5F9", border: "none", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
            ← Back
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "13px", borderRadius: 14, background: saving ? "#C7D2FE" : "#4F46E5", border: "none", fontSize: 13, fontWeight: 700, color: "#fff", cursor: saving ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {saving ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <Save size={15} />}
            {saving ? "Saving changes…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function StudentEditPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontWeight:600
      }}>
        Loading student...
      </div>
    }>
      <StudentEditPageInner />
    </Suspense>
  );
}