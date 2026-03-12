"use client";

import { Suspense } from "react";
import {
  ArrowLeft, User, Phone, BookOpen,
  Calendar, Heart, Shield, FileText, Users, Hash,
  GraduationCap, Baby, Briefcase, Home, AlertCircle,
  CreditCard, Award, Layers, ChevronRight, Pencil, MapPin
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type StudentDetail = {
  id: number;
  name: string;
  admissionNo: string;
  folioNo: string;
  rollNo: string;
  admissionDate: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  religion: string;
  caste: string;
  nationality: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  photo: string | null;
  aadhaarNo: string;
  srn: string;
  pen: string;
  apaarId: string;
  medicalNotes: string;
  status: string;
  isMainStudent: number;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  parentContact: string;
  guardianName: string;
  guardianRelation: string;
  guardianContact: string;
  tcFile: string | null;
  marksheetFile: string | null;
  class: { id: number; className: string } | null;
  section: { id: number; sectionName: string } | null;
  session: { id: number; sessionYear: string } | null;
  siblings: {
    id: number;
    name: string;
    relationToMain: string | null;
    rollNo: string | null;
    class: { id: number; className: string } | null;
    section: { id: number; sectionName: string } | null;
  }[];
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

const fmt = (val: string | null | undefined) => val || "—";

const fmtDate = (val: string | null | undefined) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return val; }
};

const age = (dob: string | null | undefined) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const yrs = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${yrs} yrs`;
};

const PALETTES = [
  { bg: "bg-sky-100", text: "text-sky-700", accent: "bg-sky-500" },
  { bg: "bg-violet-100", text: "text-violet-700", accent: "bg-violet-500" },
  { bg: "bg-emerald-100", text: "text-emerald-700", accent: "bg-emerald-500" },
  { bg: "bg-rose-100", text: "text-rose-700", accent: "bg-rose-500" },
  { bg: "bg-amber-100", text: "text-amber-700", accent: "bg-amber-500" },
  { bg: "bg-teal-100", text: "text-teal-700", accent: "bg-teal-500" },
];

const palette = (name: string) => {
  const idx = (name?.charCodeAt(0) ?? 0) % PALETTES.length;
  return { ...PALETTES[idx], initial: (name?.charAt(0) ?? "?").toUpperCase() };
};

function InfoCard({ title, icon: Icon, iconBg, children }: {
  title: string;
  icon: React.ElementType;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
        <div className={["w-7 h-7 rounded-xl flex items-center justify-center", iconBg].join(" ")}>
          <Icon size={14} strokeWidth={2.5} className="text-white" />
        </div>
        <span className="text-[12px] font-bold text-slate-700 tracking-tight">{title}</span>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight, mono }: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-[11px] font-semibold text-slate-400 shrink-0 pt-0.5 min-w-[90px]">{label}</span>
      <span className={[
        "text-[12px] font-bold text-right break-all leading-relaxed",
        highlight ? "text-indigo-600" : "text-slate-700",
        mono ? "font-mono tracking-wide" : ""
      ].join(" ")}>
        {value}
      </span>
    </div>
  );
}

function QuickAction({ label, onClick, variant }: {
  label: string;
  onClick: () => void;
  variant: "primary" | "success" | "warning" | "ghost";
}) {
  const styles = {
    primary: "bg-indigo-500 text-white shadow-sm shadow-indigo-200",
    success: "bg-emerald-500 text-white shadow-sm shadow-emerald-200",
    warning: "bg-amber-500 text-white shadow-sm shadow-amber-200",
    ghost: "bg-white text-slate-600 border border-slate-200",
  };
  return (
    <button
      onClick={onClick}
      className={["flex items-center justify-center rounded-2xl py-3.5 font-bold text-[13px] active:scale-95 transition-transform", styles[variant]].join(" ")}
    >
      {label}
    </button>
  );
}

// ─── Main Content (uses useSearchParams) ────────────────────────────────────
function StudentDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("No student ID provided"); setLoading(false); return; }
    (async () => {
      try {
        const sid = getCookie("schoolId");
        const url = new URL("/api/admin/student-detail", window.location.origin);
        url.searchParams.set("id", id);
        url.searchParams.set("schoolId", sid || "1");
        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.success) setData(json.data);
        else setError(json.message || "Failed to load student");
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-slate-400 font-semibold text-sm">Loading student...</p>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center">
        <AlertCircle size={28} className="text-rose-400" />
      </div>
      <p className="text-slate-600 font-bold text-center">{error || "Student not found"}</p>
      <button onClick={() => router.back()} className="text-indigo-500 font-bold text-sm flex items-center gap-1">
        <ArrowLeft size={14} /> Go back
      </button>
    </div>
  );

  const p = palette(data.name);
  const studentAge = age(data.dob);
  const fullAddress = [data.address, data.city, data.state, data.pincode].filter(Boolean).join(", ");

  return (
    <div className="min-h-dvh bg-slate-50 font-sans">

      {/* ── TOP NAV ── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 pt-[env(safe-area-inset-top,0px)]">
        <div className="h-14 flex items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 active:scale-90 transition-transform"
          >
            <ArrowLeft size={16} className="text-slate-600" />
          </button>

          <div className="text-center">
            <p className="text-[14px] font-bold text-slate-800">Student Profile</p>
            <p className="text-[10px] font-semibold text-slate-400">
              {data.class?.className}{data.section ? `–${data.section.sectionName}` : ""} · {data.session?.sessionYear}
            </p>
          </div>

          <button
            onClick={() => router.push(`/admin/student-edit?id=${data.id}`)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 active:scale-90 transition-transform"
          >
            <Pencil size={14} className="text-amber-600" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-4 max-w-[430px] mx-auto">

        {/* ── HERO CARD ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Gradient Banner */}
          <div className="h-20 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>

          <div className="px-4 pb-4">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-3">
              {data.photo ? (
                <img src={data.photo} alt={data.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md" />
              ) : (
                <div className={["w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black border-4 border-white shadow-md", p.bg, p.text].join(" ")}>
                  {p.initial}
                </div>
              )}
              <span className={[
                "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-1",
                data.status === "Active"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-rose-50 text-rose-500 border-rose-200"
              ].join(" ")}>
                {data.status}
              </span>
            </div>

            {/* Name & Father */}
            <h1 className="text-[18px] font-black text-slate-800 leading-tight mb-1">{data.name}</h1>
            <p className="text-[12px] font-semibold text-slate-400 mb-3">S/o {fmt(data.fatherName)}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {data.class && data.section && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl px-2.5 py-1 text-[10px] font-bold">
                  <GraduationCap size={10} />
                  {data.class.className}–{data.section.sectionName}
                </span>
              )}
              {data.rollNo && (
                <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-2.5 py-1 text-[10px] font-bold">
                  <Hash size={10} /> Roll {data.rollNo}
                </span>
              )}
              {data.isMainStudent === 1 && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl px-2.5 py-1 text-[10px] font-bold">
                  <Award size={10} /> Main Student
                </span>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 border-t border-slate-50 bg-slate-50/50">
            {[
              { value: fmt(data.folioNo), label: "Folio / AC" },
              { value: fmt(data.admissionNo), label: "Adm No" },
              { value: fmt(data.session?.sessionYear), label: "Session" },
            ].map((stat, i) => (
              <div key={i} className={["flex flex-col items-center py-3 gap-0.5", i < 2 ? "border-r border-slate-100" : ""].join(" ")}>
                <span className="text-[12px] font-black text-slate-700">{stat.value}</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PERSONAL INFO ── */}
        <InfoCard title="Personal Information" icon={User} iconBg="bg-sky-500">
          <InfoRow label="Date of Birth" value={`${fmtDate(data.dob)}${studentAge ? `  (${studentAge})` : ""}`} />
          <InfoRow label="Gender" value={fmt(data.gender)} />
          <InfoRow label="Blood Group" value={fmt(data.bloodGroup)} highlight />
          <InfoRow label="Religion" value={fmt(data.religion)} />
          <InfoRow label="Caste" value={fmt(data.caste)} />
          <InfoRow label="Nationality" value={fmt(data.nationality)} />
        </InfoCard>

        {/* ── CONTACT ── */}
        <InfoCard title="Contact Details" icon={Phone} iconBg="bg-emerald-500">
          <InfoRow label="Mobile" value={fmt(data.mobile)} highlight />
          {data.email && <InfoRow label="Email" value={fmt(data.email)} />}
          {fullAddress && <InfoRow label="Address" value={fullAddress || "—"} />}
        </InfoCard>

        {/* ── PARENT & GUARDIAN ── */}
        <InfoCard title="Parent & Guardian" icon={Home} iconBg="bg-violet-500">
          <InfoRow label="Father" value={fmt(data.fatherName)} />
          {data.fatherOccupation && <InfoRow label="Occupation" value={fmt(data.fatherOccupation)} />}
          <InfoRow label="Mother" value={fmt(data.motherName)} />
          <InfoRow label="Contact" value={fmt(data.parentContact)} highlight />
          {data.guardianName && (
            <>
              <InfoRow label="Guardian" value={fmt(data.guardianName)} />
              <InfoRow label="Relation" value={fmt(data.guardianRelation)} />
              <InfoRow label="Guardian Ph." value={fmt(data.guardianContact)} highlight />
            </>
          )}
        </InfoCard>

        {/* ── ACADEMIC ── */}
        <InfoCard title="Academic Details" icon={BookOpen} iconBg="bg-indigo-500">
          <InfoRow label="Adm. Date" value={fmtDate(data.admissionDate)} />
          <InfoRow label="Roll No" value={fmt(data.rollNo)} />
          <InfoRow label="Class" value={data.class ? `${data.class.className} – ${data.section?.sectionName}` : "—"} />
          <InfoRow label="Session" value={fmt(data.session?.sessionYear)} />
        </InfoCard>

        {/* ── DOCUMENTS ── */}
        <InfoCard title="Documents & IDs" icon={CreditCard} iconBg="bg-amber-500">
          <InfoRow label="Aadhaar No" value={fmt(data.aadhaarNo)} highlight mono />
          <InfoRow label="SRN" value={fmt(data.srn)} mono />
          <InfoRow label="PEN" value={fmt(data.pen)} mono />
          <InfoRow label="APAAR ID" value={fmt(data.apaarId)} mono />
          {data.tcFile && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[11px] font-semibold text-slate-400">TC File</span>
              <a href={data.tcFile} target="_blank" rel="noreferrer"
                className="text-[11px] font-bold text-indigo-500 flex items-center gap-1">
                View <ChevronRight size={11} />
              </a>
            </div>
          )}
          {data.marksheetFile && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[11px] font-semibold text-slate-400">Marksheet</span>
              <a href={data.marksheetFile} target="_blank" rel="noreferrer"
                className="text-[11px] font-bold text-indigo-500 flex items-center gap-1">
                View <ChevronRight size={11} />
              </a>
            </div>
          )}
        </InfoCard>

        {/* ── MEDICAL NOTES ── */}
        {data.medicalNotes && (
          <InfoCard title="Medical Notes" icon={Heart} iconBg="bg-rose-500">
            <div className="px-4 py-3">
              <p className="text-[12px] font-semibold text-slate-600 leading-relaxed">{data.medicalNotes}</p>
            </div>
          </InfoCard>
        )}

        {/* ── SIBLINGS ── */}
        {data.siblings.length > 0 && (
          <InfoCard title={`Siblings · ${data.siblings.length}`} icon={Users} iconBg="bg-violet-500">
            <div className="p-3 space-y-2">
              {data.siblings.map((sib) => {
                const sp = palette(sib.name);
                return (
                  <div key={sib.id}
                    className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <div className={["w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-black flex-shrink-0", sp.bg, sp.text].join(" ")}>
                      {sp.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-700 truncate">{sib.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {sib.relationToMain && (
                          <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-lg capitalize">
                            {sib.relationToMain}
                          </span>
                        )}
                        {sib.class && sib.section && (
                          <span className="text-[9px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg uppercase">
                            {sib.class.className}–{sib.section.sectionName}
                          </span>
                        )}
                        {sib.rollNo && (
                          <span className="text-[9px] font-semibold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-lg">
                            Roll #{sib.rollNo}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/student-detail?id=${sib.id}`)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 active:scale-90 transition-transform"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </InfoCard>
        )}

        {/* ── QUICK ACTIONS ── */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <QuickAction label="Fee Dashboard" variant="success" onClick={() => router.push(`/admin/fee-dashboard?id=${data.id}`)} />
          <QuickAction label="ID Card" variant="primary" onClick={() => router.push(`/admin/student-idcard?id=${data.id}`)} />
          <QuickAction label="Assign Subject" variant="ghost" onClick={() => router.push(`/admin/assign-subject?student_id=${data.id}`)} />
          <QuickAction label="Edit Student" variant="warning" onClick={() => router.push(`/admin/student-edit?id=${data.id}`)} />
        </div>

      </div>
    </div>
  );
}

// ─── Default Export with Suspense wrapper ────────────────────────────────────
export default function StudentDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-semibold text-sm">Loading student...</p>
      </div>
    }>
      <StudentDetailContent />
    </Suspense>
  );
}