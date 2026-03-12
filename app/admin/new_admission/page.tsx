"use client";

import { useState, useEffect, useRef } from "react";
import {
  User, GraduationCap, Phone, MapPin, Users, FileText,
  Heart, Plus, Trash2, ChevronDown, CheckCircle,
  AlertCircle, Loader2, BookOpen, Calendar, Hash, Camera,
  Fingerprint, CreditCard, Shield, Home, Baby, ArrowLeft,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface Session    { id: number; session_year: string }
interface ClassRow   { id: number; class_name: string }
interface SectionRow { id: number; section_name: string }
interface Sibling {
  name: string; gender: string; dob: string;
  class_id: string; section_id: string;
  roll_no: string; aadhaar_no: string;
  relation: string; photo: File | null;
}
const EMPTY_SIB: Sibling = {
  name: "", gender: "", dob: "", class_id: "", section_id: "",
  roll_no: "", aadhaar_no: "", relation: "", photo: null,
};

// ── CSS constants (single-line — avoids hydration mismatch) ──
const INPUT_CLS = "w-full rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-3 py-2.5 text-[12px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all";
const SELECT_CLS = "w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-7 py-2.5 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all";
const FILE_CLS = "flex items-center gap-2.5 cursor-pointer rounded-xl border border-dashed border-violet-200 bg-violet-50/40 px-3 py-2.5 hover:bg-violet-50 transition";

// ── Reusable Components ───────────────────────────────────────
function Lbl({ t, req }: { t: string; req?: boolean }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {t}{req && <span className="text-rose-400 ml-0.5">*</span>}
    </span>
  );
}

function Field({ label, icon: Icon, required, ...props }:
  { label: string; icon: React.ElementType; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Lbl t={label} req={required} />
      <div className="relative">
        <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
        <input required={required} {...props} className={INPUT_CLS} />
      </div>
    </div>
  );
}

function Sel({ label, icon: Icon, required, children, ...props }:
  { label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Lbl t={label} req={required} />
      <div className="relative">
        <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
        <select required={required} {...props} className={SELECT_CLS}>{children}</select>
        <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
      </div>
    </div>
  );
}

function FileField({ label, icon: Icon, accept, file, onSet }:
  { label: string; icon: React.ElementType; accept: string; file: File | null; onSet: (f: File | null) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Lbl t={label} />
      <label className={FILE_CLS}>
        <Icon size={13} className="text-violet-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-400 flex-1 truncate">{file ? file.name : "Tap to upload…"}</span>
        {file && <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />}
        <input type="file" accept={accept} className="hidden" onChange={e => onSet(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

function Card({ icon: Icon, title, sub, children }:
  { icon: React.ElementType; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/70 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Icon size={13} className="text-violet-600" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-slate-700">{title}</p>
          {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
        </div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function NewAdmissionPage() {

  // ── schoolId — read AFTER hydration to avoid SSR mismatch ──
  const [schoolId,    setSchoolId]    = useState<number | null>(null);
  const [mounted,     setMounted]     = useState(false);

  const [sessionList, setSessions]    = useState<Session[]>([]);
  const [classList,   setClasses]     = useState<ClassRow[]>([]);
  const [sectionList, setSections]    = useState<SectionRow[]>([]);
  const [siblings,    setSiblings]    = useState<Sibling[]>([]);
  const [sibSections, setSibSections] = useState<Record<number, SectionRow[]>>({});

  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [initErr,     setInitErr]     = useState("");

  const [photo,     setPhoto]     = useState<File | null>(null);
  const [birthCert, setBirthCert] = useState<File | null>(null);
  const [tcFile,    setTcFile]    = useState<File | null>(null);
  const [marksheet, setMarksheet] = useState<File | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // ── Step 1: After mount, find schoolId from any storage ────
  useEffect(() => {
    setMounted(true);

    // Helper: try to extract numeric id from a raw string
    const extractId = (raw: string | null): number | null => {
      if (!raw) return null;
      const n = Number(raw);
      if (!isNaN(n) && n > 0) return n;
      try {
        const p = JSON.parse(raw);
        const id = p?.schoolId ?? p?.school_id ?? p?.id
          ?? p?.data?.schoolId ?? p?.data?.school_id
          ?? p?.user?.schoolId ?? p?.user?.school_id
          ?? p?.admin?.schoolId ?? p?.admin?.school_id;
        if (id && Number(id) > 0) return Number(id);
      } catch { /* not JSON */ }
      return null;
    };

    // Keys to check in localStorage / sessionStorage
    const keys = [
      "schoolId", "school_id", "schoolID", "SCHOOL_ID",
      "adminData", "userData", "user", "authUser",
      "school", "schoolData", "loginData", "adminUser",
      "schoolInfo", "currentSchool", "auth",
    ];

    // 1. localStorage
    for (const k of keys) {
      const id = extractId(localStorage.getItem(k));
      if (id) { setSchoolId(id); return; }
    }

    // 2. sessionStorage
    for (const k of keys) {
      const id = extractId(sessionStorage.getItem(k));
      if (id) { setSchoolId(id); return; }
    }

    // 3. Cookies
    for (const k of keys) {
      const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + k + "=([^;]+)"));
      if (match) {
        const id = extractId(decodeURIComponent(match[1]));
        if (id) { setSchoolId(id); return; }
      }
    }

    // 4. URL ?schoolId=
    const urlId = new URLSearchParams(window.location.search).get("schoolId")
               ?? new URLSearchParams(window.location.search).get("school_id");
    if (urlId && Number(urlId) > 0) { setSchoolId(Number(urlId)); return; }

    // Nothing found — print debug info
    console.group("🔍 schoolId not found — all storage:");
    const lsAll: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      lsAll[k] = localStorage.getItem(k);
    }
    console.table(lsAll);
    console.log("sessionStorage:", { ...sessionStorage });
    console.log("cookies:", document.cookie);
    console.groupEnd();

    setInitErr(
      "schoolId nahi mila. F12 → Console → Table dekho. " +
      "Wahan jo key dikhe (jisme school ka ID ho), " +
      "woh key developer ko batao ya neeche manually set karo."
    );
  }, []);

  // ── Step 2: Load sessions + classes after schoolId found ───
  useEffect(() => {
    if (!schoolId) return;
    setInitErr("");

    Promise.all([
      fetch(`/api/admin/sessions?schoolId=${schoolId}`).then(r => r.json()),
      fetch(`/api/admin/admission-form?schoolId=${schoolId}`).then(r => r.json()),
    ]).then(([sRes, cRes]) => {
      if (sRes.success && Array.isArray(sRes.data)) {
        setSessions(sRes.data.map((s: { id: number; sessionYear?: string; session_year?: string }) => ({
          id:           s.id,
          session_year: s.sessionYear ?? s.session_year ?? "",
        })));
      }
      if (cRes.success && Array.isArray(cRes.classes)) {
        setClasses(cRes.classes);
      }
    }).catch(() => setInitErr("API load failed — server check karo."));
  }, [schoolId]);

  // ── Load sections ───────────────────────────────────────────
  const loadSections = async (classId: string, sibIdx?: number) => {
    const reset = (list: SectionRow[]) =>
      sibIdx !== undefined ? setSibSections(p => ({ ...p, [sibIdx]: list })) : setSections(list);
    if (!classId || !schoolId) { reset([]); return; }
    try {
      const r = await fetch(`/api/admin/admission-form?schoolId=${schoolId}&classId=${classId}`);
      const d = await r.json();
      reset(d.success ? (d.sections ?? []) : []);
    } catch { reset([]); }
  };

  // ── Siblings ────────────────────────────────────────────────
  const addSib = () => setSiblings(p => [...p, { ...EMPTY_SIB }]);
  const delSib = (i: number) => {
    setSiblings(p => p.filter((_, x) => x !== i));
    setSibSections(p => { const n = { ...p }; delete n[i]; return n; });
  };
  const setSib = (i: number, k: keyof Sibling, v: string | File | null) =>
    setSiblings(p => p.map((s, x) => x === i ? { ...s, [k]: v } : s));

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!schoolId) { setToast({ type: "error", msg: "School ID missing!" }); return; }
    setSubmitting(true); setToast(null);

    const fd = new FormData(e.currentTarget);
    fd.set("school_id", String(schoolId));
    if (photo)     fd.set("photo",             photo);
    if (birthCert) fd.set("birth_certificate", birthCert);
    if (tcFile)    fd.set("tc_file",           tcFile);
    if (marksheet) fd.set("marksheet_file",    marksheet);

    siblings.forEach((s, i) => {
      (Object.keys(s) as (keyof Sibling)[]).forEach(k => {
        if (k === "photo") { if (s.photo instanceof File) fd.set(`siblings[${i}][photo]`, s.photo); }
        else fd.set(`siblings[${i}][${k}]`, s[k] as string);
      });
    });

    try {
      const res  = await fetch("/api/admin/new_admission", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Something went wrong");
      setToast({ type: "success", msg: "Admission submitted successfully!" });
      formRef.current?.reset();
      setSiblings([]); setSections([]);
      setPhoto(null); setBirthCert(null); setTcFile(null); setMarksheet(null);
    } catch (err) {
      setToast({ type: "error", msg: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  // ── Don't render until client-side mounted (fixes hydration) ─
  if (!mounted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        <p className="text-[12px] text-slate-400 animate-pulse">Loading form…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => window.history.back()}
            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
            <ArrowLeft size={13} className="text-slate-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-[13px] font-bold text-slate-800">New Admission</h1>
            <p className="text-[10px] text-slate-400">{schoolId ? `School ID: ${schoolId}` : "Detecting…"}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <GraduationCap size={14} className="text-white" />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl text-[11px] font-semibold text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
          {toast.msg}
        </div>
      )}

      {/* Error banner */}
      {initErr && (
        <div className="max-w-xl mx-auto px-4 pt-3">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-3">
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-700 mb-1">{initErr}</p>
              <p className="text-[10px] text-amber-600">
                Apne login code me dekho — <code className="bg-amber-100 px-1 rounded">localStorage.setItem(...)</code> ya <code className="bg-amber-100 px-1 rounded">sessionStorage.setItem(...)</code> kahan call hota hai. Woh key name developer ko batao.
              </p>
            </div>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-xl mx-auto px-4 pt-4 pb-28 space-y-4">

        {/* 1. Enrollment */}
        <Card icon={BookOpen} title="Enrollment Info" sub="Session · Class · Section">
          <Sel label="Session" icon={Calendar} name="session_id" required>
            <option value="">— Select Session —</option>
            {sessionList.map(s => <option key={s.id} value={s.id}>{s.session_year}</option>)}
          </Sel>
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Class" icon={BookOpen} name="class_id" required onChange={e => loadSections(e.target.value)}>
              <option value="">— Class —</option>
              {classList.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </Sel>
            <Sel label="Section" icon={Hash} name="section_id" required>
              <option value="">— Section —</option>
              {sectionList.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
            </Sel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Roll No"       icon={Hash}       name="roll_no"  type="number" placeholder="42" />
            <Field label="AC / Folio No" icon={CreditCard} name="folio_no" required placeholder="F-001" />
          </div>
        </Card>

        {/* 2. Personal */}
        <Card icon={User} title="Personal Info">
          <Field label="Full Name" icon={User} name="name" required placeholder="Student full name" />
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Gender" icon={User} name="gender">
              <option value="">— Gender —</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </Sel>
            <Field label="Date of Birth" icon={Calendar} type="date" name="dob" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Blood Group" icon={Heart}  name="blood_group" placeholder="A+, B−" />
            <Field label="Religion"    icon={Shield} name="religion"    placeholder="Hindu…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Caste"       icon={User} name="caste"       placeholder="Category" />
            <Field label="Nationality" icon={Home} name="nationality" placeholder="Indian" />
          </div>
        </Card>

        {/* 3. ID Numbers */}
        <Card icon={Fingerprint} title="Identity Numbers" sub="Govt IDs">
          <Field label="Aadhaar No" icon={Fingerprint} name="aadhaar_no" placeholder="12-digit Aadhaar" />
          <div className="grid grid-cols-3 gap-2">
            <Field label="SRN"      icon={Hash}       name="srn"      placeholder="SRN" />
            <Field label="PEN"      icon={Hash}       name="pen"      placeholder="PEN" />
            <Field label="APAAR ID" icon={CreditCard} name="apaar_id" placeholder="APAAR" />
          </div>
        </Card>

        {/* 4. Photo */}
        <Card icon={Camera} title="Student Photo">
          <FileField label="Upload Photo" icon={Camera} accept="image/*" file={photo} onSet={setPhoto} />
        </Card>

        {/* 5. Contact */}
        <Card icon={Phone} title="Contact Details">
          <Field label="Mobile"  icon={Phone} name="mobile"  required type="tel"   placeholder="10-digit mobile" />
          <Field label="Email"   icon={User}  name="email"   type="email" placeholder="email@example.com" />
          <Field label="Address" icon={MapPin} name="address" placeholder="Full address" />
          <div className="grid grid-cols-3 gap-2">
            <Field label="City"    icon={MapPin} name="city"    placeholder="City" />
            <Field label="State"   icon={MapPin} name="state"   placeholder="State" />
            <Field label="Pincode" icon={Hash}   name="pincode" placeholder="PIN" />
          </div>
        </Card>

        {/* 6. Parents */}
        <Card icon={Users} title="Parent / Guardian">
          <Field label="Father's Name"       icon={User} name="father_name"       required placeholder="Father full name" />
          <Field label="Father's Occupation" icon={User} name="father_occupation" placeholder="e.g. Farmer, Engineer" />
          <Field label="Mother's Name"       icon={User} name="mother_name"       placeholder="Mother full name" />
        </Card>

        {/* 7. Documents */}
        <Card icon={FileText} title="Documents" sub="PDF or image">
          <FileField label="Birth Certificate"         icon={Baby}     accept="application/pdf,image/*" file={birthCert}  onSet={setBirthCert} />
          <FileField label="Transfer Certificate (TC)" icon={FileText} accept="application/pdf"         file={tcFile}     onSet={setTcFile} />
          <FileField label="Previous Marksheet"        icon={BookOpen} accept="application/pdf"         file={marksheet}  onSet={setMarksheet} />
        </Card>

        {/* 8. Medical */}
        <Card icon={Heart} title="Medical Notes" sub="Allergies / conditions">
          <div className="relative">
            <Heart size={13} className="absolute left-3 top-3 text-violet-400 pointer-events-none" />
            <textarea name="medical_notes" rows={3} placeholder="Any medical conditions, allergies…"
              className="w-full rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-3 py-2.5 text-[12px] text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all" />
          </div>
        </Card>

        {/* 9. Siblings */}
        <Card icon={Users} title="Siblings" sub={`${siblings.length} added`}>
          {siblings.length === 0 && (
            <div className="text-center py-4">
              <Users size={24} className="mx-auto text-slate-200 mb-1" />
              <p className="text-[11px] text-slate-300">No siblings added yet</p>
            </div>
          )}
          <div className="space-y-3">
            {siblings.map((sib, i) => (
              <div key={i} className="rounded-xl border border-violet-100 bg-violet-50/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-violet-600">Sibling #{i + 1}</span>
                  <button type="button" onClick={() => delSib(i)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition">
                    <Trash2 size={11} className="text-red-500" />
                  </button>
                </div>
                <Field label="Name" icon={User} value={sib.name} onChange={e => setSib(i, "name", e.target.value)} placeholder="Sibling's name" />
                <div className="grid grid-cols-2 gap-2">
                  <Sel label="Gender" icon={User} value={sib.gender} onChange={e => setSib(i, "gender", e.target.value)}>
                    <option value="">—</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </Sel>
                  <Field label="DOB" icon={Calendar} type="date" value={sib.dob} onChange={e => setSib(i, "dob", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Sel label="Class" icon={BookOpen} value={sib.class_id} onChange={e => { setSib(i, "class_id", e.target.value); loadSections(e.target.value, i); }}>
                    <option value="">— Class —</option>
                    {classList.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                  </Sel>
                  <Sel label="Section" icon={Hash} value={sib.section_id} onChange={e => setSib(i, "section_id", e.target.value)}>
                    <option value="">— Section —</option>
                    {(sibSections[i] ?? []).map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
                  </Sel>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Roll No"    icon={Hash}        type="number" value={sib.roll_no}    onChange={e => setSib(i, "roll_no",    e.target.value)} placeholder="Roll" />
                  <Field label="Aadhaar No" icon={Fingerprint} value={sib.aadhaar_no} onChange={e => setSib(i, "aadhaar_no", e.target.value)} placeholder="Aadhaar" />
                </div>
                <Field label="Relation to Main Student" icon={Users} value={sib.relation} onChange={e => setSib(i, "relation", e.target.value)} placeholder="e.g. Brother, Sister" />
                <FileField label="Sibling Photo" icon={Camera} accept="image/*" file={sib.photo} onSet={f => setSib(i, "photo", f)} />
              </div>
            ))}
          </div>
          <button type="button" onClick={addSib}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-violet-300 text-violet-600 text-[12px] font-semibold rounded-xl py-2.5 hover:bg-violet-50 active:scale-[0.98] transition mt-2">
            <Plus size={13} /> Add Sibling
          </button>
        </Card>

        {/* Submit */}
        <button type="submit" disabled={submitting || !schoolId}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-[13px] py-4 rounded-2xl shadow-lg transition-all">
          {submitting
            ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
            : <><CheckCircle size={15} /> Submit Admission</>}
        </button>
      </form>
    </div>
  );
}