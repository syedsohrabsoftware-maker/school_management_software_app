"use client";

import {
  Search, Eye, Pencil, IdCard, BookOpen, IndianRupee,
  ChevronLeft, ChevronRight, RefreshCw, X,
  Phone, User, ChevronDown, Users, GraduationCap
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type Sibling = {
  id: number;
  name: string;
  relationToMain: string | null;
  rollNo: string | null;
  class: { id: number; className: string } | null;
  section: { id: number; sectionName: string } | null;
};

type Student = {
  id: number;
  name: string;
  fatherName: string;
  mobile: string;
  folioNo: string;
  rollNo: string;
  isMainStudent: number;
  status: string;
  class: { id: number; className: string } | null;
  section: { id: number; sectionName: string } | null;
  siblings?: Sibling[];
};

type Pagination = { total: number; page: number; pages: number; limit: number };

type ClassSectionOption = {
  label: string; classId: number; sectionId: number;
  className: string; sectionName: string;
};

// ── Avatar color system ──────────────────────────────────────────
const AVATAR_PALETTES = [
  { bg: "#EEF2FF", text: "#4F46E5" },
  { bg: "#F0FDF4", text: "#16A34A" },
  { bg: "#FFF7ED", text: "#EA580C" },
  { bg: "#FDF2F8", text: "#C026D3" },
  { bg: "#F0F9FF", text: "#0284C7" },
  { bg: "#FEFCE8", text: "#CA8A04" },
  { bg: "#FFF1F2", text: "#E11D48" },
  { bg: "#F0FDFA", text: "#0D9488" },
];

const getAvatar = (name: string) => {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_PALETTES.length;
  return { ...AVATAR_PALETTES[idx], initials: (name?.charAt(0) ?? "?").toUpperCase() };
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

// ── Action Button ─────────────────────────────────────────────────
type ActionIconProps = {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  onClick?: () => void;
  disabled?: boolean;
};

function ActionBtn({ icon: Icon, label, color, bg, onClick, disabled }: ActionIconProps) {
  return (
    <button
      title={label}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 flex-1 py-2.5 rounded-2xl transition-all active:scale-90 disabled:opacity-20 disabled:pointer-events-none"
      style={{ background: disabled ? "transparent" : undefined }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
        style={{ background: bg }}
      >
        <Icon size={15} strokeWidth={2.5} style={{ color }} />
      </div>
      <span className="text-[9px] font-bold tracking-wide uppercase" style={{ color: disabled ? "#CBD5E1" : "#94A3B8" }}>
        {label}
      </span>
    </button>
  );
}

// ── Skeleton Card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded-full w-2/3" />
          <div className="h-3 bg-slate-100 rounded-full w-1/2" />
          <div className="flex gap-2">
            <div className="h-5 bg-slate-100 rounded-lg w-16" />
            <div className="h-5 bg-slate-100 rounded-lg w-24 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function StudentsPage() {
  const router = useRouter();

  const [search, setSearch]       = useState("");
  const [deb, setDeb]             = useState("");
  const [page, setPage]           = useState(1);
  const [selValue, setSelValue]   = useState("");

  const [list, setList]           = useState<Student[]>([]);
  const [pg, setPg]               = useState<Pagination>({ total: 0, page: 1, pages: 1, limit: 20 });
  const [loading, setLoading]     = useState(true);
  const [csOptions, setCsOptions] = useState<ClassSectionOption[]>([]);
  const [csLoading, setCsLoading] = useState(true);

  // ✅ FIXED: useRef now has an initial value (null) to satisfy TypeScript
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [search]);

  useEffect(() => {
    (async () => {
      setCsLoading(true);
      try {
        const sid = getCookie("schoolId");
        const url = new URL("/api/admin/class-sections", window.location.origin);
        url.searchParams.set("schoolId", sid || "1");
        url.searchParams.set("activeSession", "true");
        const res  = await fetch(url.toString());
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCsOptions(json.data.map((item: any) => ({
            classId: item.classId, sectionId: item.sectionId,
            className: item.className, sectionName: item.sectionName,
            label: `Class ${item.className} – ${item.sectionName}`,
          })));
        }
      } catch (e) { console.error(e); }
      finally { setCsLoading(false); }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sid = getCookie("schoolId");
      const url = new URL("/api/admin/students", window.location.origin);
      url.searchParams.set("schoolId",      sid || "1");
      url.searchParams.set("page",          String(page));
      url.searchParams.set("activeSession", "true");
      url.searchParams.set("withSiblings",  "true");
      if (deb) url.searchParams.set("search", deb);
      if (selValue) {
        const [cId, sId] = selValue.split("|");
        url.searchParams.set("classId", cId);
        url.searchParams.set("sectionId", sId);
      }
      const res  = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setList(json.data || []);
        setPg(json.pagination || { total: 0, page: 1, pages: 1, limit: 20 });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, deb, selValue]);

  useEffect(() => { load(); }, [load]);

  const resetFilters = () => { setSelValue(""); setSearch(""); setPage(1); };
  const selectedOpt  = csOptions.find(o => `${o.classId}|${o.sectionId}` === selValue);

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: "#F8FAFC" }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid #F1F5F9",
          boxShadow: "0 1px 20px rgba(0,0,0,0.04)"
        }}
      >
        <div className="max-w-[430px] mx-auto px-4 pt-5 pb-4 space-y-3">

          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-[22px] font-black tracking-tight"
                style={{ color: "#0F172A", letterSpacing: "-0.03em" }}
              >
                Students
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {loading ? "Loading..." : `${pg.total} ${selectedOpt ? `in ${selectedOpt.label}` : "Total"}`}
                </span>
              </div>
            </div>

            {/* Pagination pill */}
            {!loading && pg.pages > 1 && (
              <div
                className="flex items-center gap-1 rounded-2xl p-1"
                style={{ background: "#F1F5F9" }}
              >
                <button
                  onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-white shadow-sm disabled:opacity-30 active:scale-90 transition-all"
                  style={{ border: "1px solid #E2E8F0" }}
                >
                  <ChevronLeft size={13} color="#475569" />
                </button>
                <span className="text-[10px] font-black px-1.5 text-slate-500">{page}/{pg.pages}</span>
                <button
                  onClick={() => setPage(p => p + 1)} disabled={page === pg.pages}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-white shadow-sm disabled:opacity-30 active:scale-90 transition-all"
                  style={{ border: "1px solid #E2E8F0" }}
                >
                  <ChevronRight size={13} color="#475569" />
                </button>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" color="#94A3B8" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, mobile or folio no..."
              className="w-full rounded-2xl py-3 pl-11 pr-10 text-[13px] font-semibold outline-none transition-all"
              style={{
                background: "#F1F5F9",
                border: "1.5px solid transparent",
                color: "#0F172A",
              }}
              onFocus={e => (e.target.style.borderColor = "#818CF8")}
              onBlur={e => (e.target.style.borderColor = "transparent")}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-slate-200"
              >
                <X size={11} color="#94A3B8" />
              </button>
            )}
          </div>

          {/* Class filter + reset */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" color="#94A3B8" />
              <select
                value={selValue}
                onChange={e => { setSelValue(e.target.value); setPage(1); }}
                disabled={csLoading}
                className="w-full appearance-none rounded-xl py-2.5 pl-9 pr-8 text-[13px] font-bold outline-none transition-all cursor-pointer disabled:opacity-50"
                style={{ background: "#F1F5F9", border: "1.5px solid transparent", color: "#475569" }}
              >
                <option value="">{csLoading ? "Loading..." : "All Classes & Sections"}</option>
                {csOptions.map(opt => (
                  <option key={`${opt.classId}-${opt.sectionId}`} value={`${opt.classId}|${opt.sectionId}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" color="#94A3B8" />
            </div>
            <button
              onClick={resetFilters}
              title="Reset filters"
              className="w-11 rounded-xl flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200"
              style={{ background: "#F1F5F9" }}
            >
              <RefreshCw size={14} color="#64748B" className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Active filter badges */}
          {(selValue || deb) && (
            <div className="flex flex-wrap gap-1.5">
              {selectedOpt && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}
                >
                  <Users size={9} /> {selectedOpt.label}
                  <button onClick={() => { setSelValue(""); setPage(1); }} className="ml-0.5 hover:opacity-70">
                    <X size={10} />
                  </button>
                </span>
              )}
              {deb && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" }}
                >
                  <Search size={9} /> &quot;{deb}&quot;
                  <button onClick={() => setSearch("")} className="ml-0.5 hover:opacity-70">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── STUDENT LIST ──────────────────────────────────────────── */}
      <div className="max-w-[430px] mx-auto p-4 space-y-3">

        {loading && list.length === 0 ? (
          <>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </>

        ) : list.length > 0 ? list.map((s) => {
          const av = getAvatar(s.name);
          const hasSiblings = s.siblings && s.siblings.length > 0;

          return (
            <div
              key={s.id}
              className="bg-white rounded-3xl overflow-hidden transition-all hover:shadow-md"
              style={{
                border: "1px solid #F1F5F9",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)"
              }}
            >
              {/* ── Student row ── */}
              <div className="p-4 flex items-start gap-3.5">

                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 select-none"
                  style={{ background: av.bg, color: av.text }}
                >
                  {av.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <h3 className="font-black text-[15px] truncate leading-tight" style={{ color: "#0F172A" }}>
                      {s.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold rounded-lg px-1.5 py-0.5 shrink-0"
                      style={{ background: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                    >
                      #{s.folioNo}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2.5">
                    <User size={9} color="#CBD5E1" />
                    <span className="text-[11px] font-semibold truncate" style={{ color: "#94A3B8" }}>
                      {s.fatherName}
                    </span>
                  </div>

                  {/* Class + Phone */}
                  <div className="flex items-center gap-2">
                    {s.class && s.section && (
                      <span
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-tighter"
                        style={{ background: "#F1F5F9", color: "#475569" }}
                      >
                        <Users size={8} />
                        {s.class.className}–{s.section.sectionName}
                      </span>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <Phone size={10} strokeWidth={2.5} color="#818CF8" />
                      <span className="text-[11px] font-black" style={{ color: "#4F46E5" }}>{s.mobile}</span>
                    </div>
                  </div>

                  {/* Sibling badges */}
                  {hasSiblings && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {s.siblings!.map(sib => (
                        <div
                          key={sib.id}
                          className="inline-flex items-center gap-1 rounded-xl px-2 py-1"
                          style={{
                            background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
                            border: "1px solid #DDD6FE"
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-lg text-[8px] font-black flex items-center justify-center flex-shrink-0"
                            style={{ background: "#C4B5FD", color: "#5B21B6" }}
                          >
                            {sib.name?.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold max-w-[70px] truncate" style={{ color: "#3730A3" }}>
                            {sib.name}
                          </span>
                          {sib.relationToMain && (
                            <>
                              <span style={{ color: "#C4B5FD", fontSize: 10 }}>·</span>
                              <span className="text-[9px] font-bold capitalize" style={{ color: "#7C3AED" }}>
                                {sib.relationToMain}
                              </span>
                            </>
                          )}
                          {sib.class && sib.section && (
                            <>
                              <span style={{ color: "#C4B5FD", fontSize: 10 }}>·</span>
                              <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: "#6D28D9" }}>
                                {sib.class.className}–{sib.section.sectionName}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Action bar ── */}
              <div
                className="flex px-2 pt-1 pb-2"
                style={{ borderTop: "1px solid #F8FAFC", background: "#FAFBFC" }}
              >
                <ActionBtn icon={IndianRupee} label="Fee"     color="#16A34A" bg="#F0FDF4" disabled={s.isMainStudent !== 1} onClick={() => router.push(`/admin/fee-dashboard?id=${s.id}`)} />
                <ActionBtn icon={BookOpen}    label="Subject" color="#4F46E5" bg="#EEF2FF" onClick={() => router.push(`/admin/assign-subject?student_id=${s.id}`)} />
                <ActionBtn icon={Eye}         label="View"    color="#0284C7" bg="#F0F9FF" onClick={() => router.push(`/admin/student-detail?id=${s.id}`)} />
                <ActionBtn icon={Pencil}      label="Edit"    color="#D97706" bg="#FFFBEB" onClick={() => router.push(`/admin/student-edit?id=${s.id}`)} />
                <ActionBtn icon={IdCard}      label="ID Card" color="#DB2777" bg="#FDF2F8" onClick={() => router.push(`/admin/student-idcard?id=${s.id}`)} />
              </div>

            </div>
          );
        }) : (
          <div className="text-center py-24 px-10">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "#F1F5F9" }}
            >
              <Users size={26} color="#CBD5E1" />
            </div>
            <p className="font-black text-[12px] uppercase tracking-widest leading-loose" style={{ color: "#CBD5E1" }}>
              Koi student nahi mila.<br />Filter change karke dekho.
            </p>
          </div>
        )}

        {/* Bottom pagination */}
        {!loading && pg.pages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm disabled:opacity-30 active:scale-90 transition-all"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <ChevronLeft size={16} color="#475569" />
            </button>
            <span className="text-[12px] font-black" style={{ color: "#94A3B8" }}>
              Page {page} of {pg.pages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)} disabled={page === pg.pages}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm disabled:opacity-30 active:scale-90 transition-all"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <ChevronRight size={16} color="#475569" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}