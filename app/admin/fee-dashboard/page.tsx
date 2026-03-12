"use client";

import {
  ArrowLeft, AlertCircle, CheckCircle2, Users, History,
  Plus, Pencil, Clock, IndianRupee, ChevronUp, ChevronDown,
  X, Printer, Trash2, Receipt, Inbox, GraduationCap,
} from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────
type Sibling = {
  id: number; name: string; rollNo: string | null; photo: string | null;
  isMainStudent: number; relationToMain: string | null;
  class: { id: number; className: string } | null;
  section: { id: number; sectionName: string } | null;
};
type FeeBlock  = { grandTotal: number; paidTotal: number; balanceFee: number; paidPct: number };
type MonthlyRow = { id: number; slipNo: string; feeMonth: string; feeYear: number; paidAmount: number; paymentDate: string; paymentMethod: string; remarks?: string };
type OldPayRow  = { id: number; slipNo: string; paidAmount: number; paymentDate: string; paymentMethod: string; remarks?: string };
type Student    = {
  id: number; name: string; folioNo: string; admissionNo: string; rollNo: string;
  photo: string | null; fatherName: string; mobile: string; address: string;
  city: string; state: string; status: string; isMainStudent: number;
  class: { id: number; className: string } | null;
  section: { id: number; sectionName: string } | null;
  session: { id: number; sessionYear: string } | null;
};
type DashData = {
  student: Student; siblings: Sibling[];
  currentFee: FeeBlock; oldFee: FeeBlock;
  combined: { total: number; paid: number; outstanding: number; pct: number };
  monthlyFees: MonthlyRow[]; oldPayments: OldPayRow[];
};

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};
const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtD = (v?: string | null) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return v; }
};

// ─────────────────────────────────────────────────────────────
//  DESIGN TOKENS — avatar palette
// ─────────────────────────────────────────────────────────────
const AVATAR_PALETTES = [
  { ring: "ring-indigo-400/40",  bg: "bg-indigo-400/10",  text: "text-indigo-400"  },
  { ring: "ring-sky-400/40",     bg: "bg-sky-400/10",     text: "text-sky-400"     },
  { ring: "ring-emerald-400/40", bg: "bg-emerald-400/10", text: "text-emerald-400" },
  { ring: "ring-amber-400/40",   bg: "bg-amber-400/10",   text: "text-amber-400"   },
  { ring: "ring-rose-400/40",    bg: "bg-rose-400/10",    text: "text-rose-400"    },
  { ring: "ring-violet-400/40",  bg: "bg-violet-400/10",  text: "text-violet-400"  },
];
const LIGHT_AVATAR_PALETTES = [
  { bg: "bg-indigo-50",  text: "text-indigo-600",  ring: "ring-indigo-200"  },
  { bg: "bg-sky-50",     text: "text-sky-600",     ring: "ring-sky-200"     },
  { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
  { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200"   },
  { bg: "bg-rose-50",    text: "text-rose-600",    ring: "ring-rose-200"    },
  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200"  },
];
const paletteFor   = (name: string) => AVATAR_PALETTES[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTES.length];
const ltPaletteFor = (name: string) => LIGHT_AVATAR_PALETTES[(name?.charCodeAt(0) ?? 0) % LIGHT_AVATAR_PALETTES.length];
const initials     = (s: string) => (s ?? "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

// ─────────────────────────────────────────────────────────────
//  CHIP
// ─────────────────────────────────────────────────────────────
type Tone = "green" | "red" | "blue" | "amber" | "slate" | "teal" | "violet";
const TONE_MAP: Record<Tone, string> = {
  green:  "bg-emerald-50  text-emerald-700 ring-emerald-200",
  red:    "bg-rose-50     text-rose-700    ring-rose-200",
  blue:   "bg-sky-50      text-sky-700     ring-sky-200",
  amber:  "bg-amber-50    text-amber-700   ring-amber-200",
  slate:  "bg-slate-100   text-slate-600   ring-slate-200",
  teal:   "bg-teal-50     text-teal-700    ring-teal-200",
  violet: "bg-violet-50   text-violet-700  ring-violet-200",
};
function Chip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${TONE_MAP[tone]}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  DARK AVATAR  (for hero header)
// ─────────────────────────────────────────────────────────────
function DarkAvatar({ name }: { name: string }) {
  const p = paletteFor(name);
  return (
    <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ring-2 ${p.bg} ${p.ring}`}>
      <span className={`text-lg font-black ${p.text}`}>{initials(name)}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  LIGHT AVATAR  (for cards)
// ─────────────────────────────────────────────────────────────
function LightAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const p = ltPaletteFor(name);
  const sz = size === "sm" ? "size-9 text-xs rounded-xl" : "size-10 text-sm rounded-xl";
  return (
    <div className={`${sz} ${p.bg} ${p.text} ring-1 ${p.ring} flex items-center justify-center shrink-0 font-black`}>
      {initials(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PROGRESS TRACK
// ─────────────────────────────────────────────────────────────
function Track({ pct, variant }: { pct: number; variant: "indigo-sky" | "rose-pink" | "emerald-teal" | "blue-sky" }) {
  const grad: Record<typeof variant, string> = {
    "indigo-sky":   "from-indigo-500 to-sky-400",
    "rose-pink":    "from-rose-500   to-pink-400",
    "emerald-teal": "from-emerald-500 to-teal-400",
    "blue-sky":     "from-blue-500   to-sky-400",
  };
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${grad[variant]} transition-[width] duration-700 ease-out`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DARK PROGRESS TRACK  (hero header)
// ─────────────────────────────────────────────────────────────
function DarkTrack({ pct, hasDue }: { pct: number; hasDue: boolean }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${hasDue ? "bg-gradient-to-r from-indigo-500 to-sky-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CARD WRAPPER
// ─────────────────────────────────────────────────────────────
function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-sm ring-1 ${accent ?? "ring-slate-200/80"}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CARD HEADER
// ─────────────────────────────────────────────────────────────
function CardHeader({
  icon: Icon, iconWrap, title, subtitle, right, onToggle, open,
}: {
  icon: React.ElementType; iconWrap: string;
  title: string; subtitle?: string;
  right?: React.ReactNode; onToggle?: () => void; open?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
      <div className={`size-9 rounded-2xl flex items-center justify-center shrink-0 ${iconWrap}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-slate-800 leading-tight tracking-tight">{title}</p>
        {subtitle && <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {right}
      {onToggle && (
        <button
          onClick={onToggle}
          className="size-7 rounded-xl bg-white ring-1 ring-slate-200 flex items-center justify-center active:scale-90 transition-transform"
        >
          {open
            ? <ChevronUp   size={12} className="text-slate-400" />
            : <ChevronDown size={12} className="text-slate-400" />}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  AMOUNT STRIP  (3-col)
// ─────────────────────────────────────────────────────────────
function AmountStrip({ cols }: {
  cols: { label: string; value: string; colorClass: string }[];
}) {
  return (
    <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: `repeat(${cols.length},1fr)` }}>
      {cols.map((c, i) => (
        <div key={i} className={`py-3 px-2 text-center ${i < cols.length - 1 ? "border-r border-slate-100" : ""}`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{c.label}</p>
          <p className={`text-[15px] font-black tracking-tight ${c.colorClass}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ACTION BUTTON  (inside cards)
// ─────────────────────────────────────────────────────────────
function ActionBtn({
  label, icon: Icon, className, onClick,
}: { label: string; icon: React.ElementType; className: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-bold active:scale-95 transition-transform ${className}`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
//  ICON MINI BUTTON  (table row actions)
// ─────────────────────────────────────────────────────────────
function IconBtn({
  icon: Icon, wrap, iconClass, onClick,
}: { icon: React.ElementType; wrap: string; iconClass: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`size-7 rounded-xl flex items-center justify-center active:scale-90 transition-transform ${wrap}`}
    >
      <Icon size={11} className={iconClass} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
//  EMPTY ROW
// ─────────────────────────────────────────────────────────────
function EmptyRow({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center py-10 gap-2">
      <Inbox size={32} className="text-slate-200" />
      <p className="text-[12px] text-slate-400 font-semibold">{text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TABLE PRIMITIVES
// ─────────────────────────────────────────────────────────────
function Th({ children, colorClass = "text-slate-500" }: { children: React.ReactNode; colorClass?: string }) {
  return (
    <th className={`px-3 py-2.5 text-left text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${colorClass}`}>
      {children}
    </th>
  );
}
function Td({ children, bold, colorClass = "text-slate-600", mono }: {
  children: React.ReactNode; bold?: boolean; colorClass?: string; mono?: boolean;
}) {
  return (
    <td className={`px-3 py-2.5 text-[11px] whitespace-nowrap ${bold ? "font-black" : "font-medium"} ${colorClass} ${mono ? "tabular-nums" : ""}`}>
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────
//  OLD PAYMENT TABLE
// ─────────────────────────────────────────────────────────────
function OldPayTable({
  payments, paidTotal, studentId, router,
}: {
  payments: OldPayRow[]; paidTotal: number; studentId: number;
  router: ReturnType<typeof useRouter>;
}) {
  if (!payments.length) return <EmptyRow text="No payment records found." />;
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-rose-50">
            <Th colorClass="text-rose-400">#</Th>
            <Th colorClass="text-rose-400">Slip No.</Th>
            <Th colorClass="text-rose-400">Date</Th>
            <Th colorClass="text-rose-400">Amount</Th>
            <Th colorClass="text-rose-400">Method</Th>
            <Th colorClass="text-rose-400">Remarks</Th>
            <Th colorClass="text-rose-400">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={p.id} className="border-t border-slate-50 hover:bg-rose-50/40 transition-colors">
              <Td colorClass="text-slate-400">{i + 1}</Td>
              <Td bold>{p.slipNo || "—"}</Td>
              <Td>{fmtD(p.paymentDate)}</Td>
              <Td bold colorClass="text-emerald-600" mono>{inr(p.paidAmount)}</Td>
              <Td><Chip label={p.paymentMethod} tone="slate" /></Td>
              <Td colorClass="text-slate-400">{p.remarks || "—"}</Td>
              <Td>
                <div className="flex gap-1">
                  <IconBtn icon={Pencil}  wrap="bg-sky-50"     iconClass="text-sky-500"      onClick={() => router.push(`/admin/edit-old-payment?id=${p.id}&student_id=${studentId}`)} />
                  <IconBtn icon={Trash2}  wrap="bg-rose-50"    iconClass="text-rose-500"     />
                  <IconBtn icon={Printer} wrap="bg-emerald-50" iconClass="text-emerald-500"  onClick={() => window.open(`/admin/print-old-payment?id=${p.id}&student_id=${studentId}`, "_blank")} />
                </div>
              </Td>
            </tr>
          ))}
          <tr className="border-t-2 border-slate-200 bg-slate-50">
            <td colSpan={3} className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wide">
              Total Paid (Pending)
            </td>
            <Td bold colorClass="text-emerald-600" mono>{inr(paidTotal)}</Td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MONTHLY PAY TABLE
// ─────────────────────────────────────────────────────────────
function MonthlyPayTable({
  fees, paidTotal, onFullHistory,
}: { fees: MonthlyRow[]; paidTotal: number; onFullHistory: () => void }) {
  if (!fees.length) return <EmptyRow text="No monthly payment records found." />;
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-sky-50">
              <Th colorClass="text-sky-500">#</Th>
              <Th colorClass="text-sky-500">Slip No.</Th>
              <Th colorClass="text-sky-500">Month</Th>
              <Th colorClass="text-sky-500">Year</Th>
              <Th colorClass="text-sky-500">Amount</Th>
              <Th colorClass="text-sky-500">Date</Th>
              <Th colorClass="text-sky-500">Method</Th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f, i) => (
              <tr key={f.id} className="border-t border-slate-50 hover:bg-sky-50/40 transition-colors">
                <Td colorClass="text-slate-400">{i + 1}</Td>
                <Td bold>{f.slipNo}</Td>
                <Td><Chip label={f.feeMonth} tone="blue" /></Td>
                <Td>{f.feeYear}</Td>
                <Td bold colorClass="text-emerald-600" mono>{inr(f.paidAmount)}</Td>
                <Td>{fmtD(f.paymentDate)}</Td>
                <Td><Chip label={f.paymentMethod} tone="slate" /></Td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={4} className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                Total Monthly Paid
              </td>
              <Td bold colorClass="text-emerald-600" mono>{inr(paidTotal)}</Td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
      <button
        onClick={onFullHistory}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 text-white text-[12px] font-bold active:scale-[0.98] transition-transform"
      >
        <Receipt size={13} />
        Full History &amp; Print Slip
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  LOADING SCREEN
// ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center gap-5">
      <div className="size-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
        <GraduationCap size={24} className="text-white" />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="size-2 rounded-full bg-slate-300 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ERROR SCREEN
// ─────────────────────────────────────────────────────────────
function ErrorScreen({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center gap-4 px-6">
      <div className="size-14 rounded-2xl bg-rose-50 ring-1 ring-rose-200 flex items-center justify-center">
        <AlertCircle size={26} className="text-rose-500" />
      </div>
      <p className="text-sm font-bold text-slate-800 text-center">{error || "Student not found"}</p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[12px] font-bold text-slate-500 active:opacity-70"
      >
        <ArrowLeft size={13} /> Go back
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  INNER PAGE  (uses useSearchParams — must be inside Suspense)
// ─────────────────────────────────────────────────────────────
function FeeDashboardPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const id           = searchParams.get("id");

  const [data,        setData]        = useState<DashData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTab,  setHistoryTab]  = useState<"pending" | "current">("pending");
  const [pendingOpen, setPendingOpen] = useState(true);
  const [currentOpen, setCurrentOpen] = useState(true);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) { setError("No student ID"); setLoading(false); return; }
    (async () => {
      try {
        const sid = getCookie("schoolId");
        const url = new URL("/api/admin/fee-dashboard", window.location.origin);
        url.searchParams.set("id", id);
        url.searchParams.set("schoolId", sid || "1");
        const res  = await fetch(url.toString());
        const json = await res.json();
        if (json.success) setData(json.data); else setError(json.message || "Failed");
      } catch { setError("Network error"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const toggleHistory = () => {
    setHistoryOpen(prev => {
      if (!prev) setTimeout(() => historyRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
      return !prev;
    });
  };

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen error={error} onBack={() => router.back()} />;

  const { student: s, siblings, currentFee, oldFee, combined, monthlyFees, oldPayments } = data;
  const hasDue  = combined.outstanding > 0;
  const oldDue  = oldFee.balanceFee > 0;
  const currDue = currentFee.balanceFee > 0;

  return (
    <div className="min-h-dvh bg-slate-100 font-sans pb-28">

      {/* ══════════════════════════════════════════════
          STICKY HERO HEADER
      ══════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-slate-900">

        {/* ── Nav row ── */}
        <div className="max-w-lg mx-auto px-4 pt-3 pb-0 flex items-center gap-3">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="size-9 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <ArrowLeft size={15} className="text-slate-300" />
          </button>

          {/* Title */}
          <div className="flex-1 text-center">
            <p className="text-[13px] font-black text-white tracking-tight">Fee Dashboard</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {s.class?.className}–{s.section?.sectionName} · {s.session?.sessionYear}
            </p>
          </div>

          {/* Status pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ring-1 ${hasDue ? "bg-rose-950/80 ring-rose-700/50" : "bg-emerald-950/80 ring-emerald-700/50"}`}>
            {hasDue
              ? <AlertCircle  size={10} className="text-rose-400"    />
              : <CheckCircle2 size={10} className="text-emerald-400" />}
            <span className={`text-[10px] font-black ${hasDue ? "text-rose-300" : "text-emerald-300"}`}>
              {hasDue ? "Due" : "Clear"}
            </span>
          </div>
        </div>

        {/* ── Student identity card ── */}
        <div className="max-w-lg mx-auto px-4 pt-3 pb-4">
          <div className="bg-white/8 ring-1 ring-white/10 rounded-3xl p-4">

            {/* Name row */}
            <div className="flex items-center gap-3 mb-4">
              <DarkAvatar name={s.name} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[15px] font-black text-white tracking-tight leading-none">{s.name}</span>
                  {s.isMainStudent === 1 && (
                    <span className="text-[9px] font-black text-amber-400 bg-amber-950/60 ring-1 ring-amber-700/50 px-2 py-0.5 rounded-full">
                      MAIN
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-[11px]">
                  <span className="text-slate-500">A/C <strong className="text-slate-300 font-bold">{s.folioNo}</strong></span>
                  {s.rollNo     && <span className="text-slate-500">Roll <strong className="text-slate-300 font-bold">{s.rollNo}</strong></span>}
                  {s.fatherName && <span className="text-slate-500">{s.fatherName}</span>}
                </div>
              </div>
            </div>

            {/* 3-box summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Grand Total", value: inr(combined.total),       colorClass: "text-slate-300"   },
                { label: "Paid",        value: inr(combined.paid),        colorClass: "text-emerald-400" },
                { label: "Outstanding", value: inr(combined.outstanding), colorClass: hasDue ? "text-rose-400" : "text-emerald-400" },
              ].map(c => (
                <div key={c.label} className="bg-slate-950/60 rounded-2xl p-3 text-center ring-1 ring-white/5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{c.label}</p>
                  <p className={`text-[13px] font-black tracking-tight ${c.colorClass}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-semibold text-slate-500">Payment Progress</span>
                <span className="text-[11px] font-black text-emerald-400">{combined.pct}%</span>
              </div>
              <DarkTrack pct={combined.pct} hasDue={hasDue} />
            </div>

            {/* Old vs Current mini cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`bg-slate-950/60 rounded-2xl p-3 ring-1 ${oldDue ? "ring-rose-800/40" : "ring-emerald-800/40"}`}>
                <p className={`text-[9px] font-bold mb-1 ${oldDue ? "text-rose-400" : "text-emerald-400"}`}>⏳ Pending / Old</p>
                <p className={`text-[14px] font-black tracking-tight ${oldDue ? "text-rose-300" : "text-emerald-400"}`}>{inr(oldFee.balanceFee)}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">of {inr(oldFee.grandTotal)}</p>
              </div>
              <div className={`bg-slate-950/60 rounded-2xl p-3 ring-1 ${currDue ? "ring-sky-800/40" : "ring-emerald-800/40"}`}>
                <p className="text-[9px] font-bold text-sky-400 mb-1">📋 Current Session</p>
                <p className={`text-[14px] font-black tracking-tight ${currDue ? "text-sky-300" : "text-emerald-400"}`}>{inr(currentFee.balanceFee)}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">of {inr(currentFee.grandTotal)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SCROLLABLE BODY
      ══════════════════════════════════════════════ */}
      <div className="max-w-lg mx-auto px-3 pt-3 flex flex-col gap-3">

        {/* ── SIBLINGS ── */}
        {siblings.length > 0 && (
          <Card>
            <CardHeader
              icon={Users}
              iconWrap="bg-violet-50 text-violet-600"
              title="Siblings"
              subtitle={`${siblings.length} student${siblings.length > 1 ? "s" : ""} in same family`}
              right={<Chip label={String(siblings.length)} tone="violet" />}
            />
            <div className="p-3 flex flex-col gap-2">
              {siblings.map(sib => (
                <div key={sib.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 ring-1 ring-slate-100 active:bg-violet-50/60 transition-colors">
                  <LightAvatar name={sib.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-slate-800 truncate">{sib.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {sib.class?.className}/{sib.section?.sectionName}
                      {sib.rollNo ? ` · Roll ${sib.rollNo}` : ""}
                      {sib.relationToMain ? ` · ${sib.relationToMain}` : ""}
                    </p>
                  </div>
                  {sib.isMainStudent === 1 && <Chip label="Main" tone="amber" />}
                  <button
                    onClick={() => router.push(`/admin/fee-dashboard?id=${sib.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-[11px] font-bold shrink-0 active:scale-95 transition-transform"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── QUICK ACTIONS ── */}
        <Card>
          <CardHeader
            icon={IndianRupee}
            iconWrap="bg-amber-50 text-amber-600"
            title="Quick Actions"
            subtitle="Manage fees &amp; records"
          />
          <div className="p-3">
            {/* 4-col action grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {([
                { label: "Add Current Fee",       Icon: Plus,        grad: "from-emerald-500 to-teal-500",  path: `/admin/add-total-fee?id=${s.id}`   },
                { label: "Edit Current Fee",      Icon: Pencil,      grad: "from-amber-500 to-orange-500",  path: `/admin/edit-total-fee?id=${s.id}`  },
                { label: "Collect Monthly Fee",   Icon: IndianRupee, grad: "from-blue-500 to-indigo-500",   path: `/admin/add-monthly-fee?id=${s.id}` },
                { label: "Add Total Pending Fee", Icon: Clock,       grad: "from-rose-500 to-pink-500",     path: `/admin/add-old-fee?id=${s.id}`     },
              ] as const).map(({ label, Icon, grad, path }) => (
                <button
                  key={label}
                  onClick={() => router.push(path)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 ring-1 ring-slate-100 active:scale-95 transition-transform"
                >
                  <div className={`size-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm`}>
                    <Icon size={15} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>

            {/* History toggle */}
            <button
              onClick={toggleHistory}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[12px] font-bold ring-1 transition-all active:scale-[0.98] ${
                historyOpen
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-slate-50 text-slate-700 ring-slate-200"
              }`}
            >
              <History size={13} />
              {historyOpen ? "Hide Payment History" : "View Payment History"}
            </button>
          </div>
        </Card>

        {/* ── HISTORY PANEL ── */}
        {historyOpen && (
          <Card accent="ring-sky-200">
            <div ref={historyRef}>
              <CardHeader
                icon={History}
                iconWrap="bg-sky-50 text-sky-600"
                title="Payment History"
                subtitle="All transaction records"
                right={
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className="size-7 rounded-xl bg-white ring-1 ring-slate-200 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <X size={12} className="text-slate-400" />
                  </button>
                }
              />

              {/* Segmented tabs */}
              <div className="flex m-3 bg-slate-100 rounded-2xl p-1 gap-1">
                {(["pending", "current"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setHistoryTab(tab)}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                      historyTab === tab
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-400"
                    }`}
                  >
                    {tab === "pending" ? "⏳ Pending" : "📋 Current"}
                  </button>
                ))}
              </div>

              <div className="px-3 pb-3">
                {historyTab === "pending"
                  ? <OldPayTable payments={oldPayments} paidTotal={oldFee.paidTotal} studentId={s.id} router={router} />
                  : <MonthlyPayTable fees={monthlyFees} paidTotal={currentFee.paidTotal} onFullHistory={() => router.push(`/admin/view-fee-details?id=${s.id}`)} />
                }
              </div>
            </div>
          </Card>
        )}

        {/* ── PENDING / OLD FEE ── */}
        {oldFee.grandTotal > 0 && (
          <Card accent={oldDue ? "ring-rose-200" : "ring-emerald-200"}>
            <CardHeader
              icon={Clock}
              iconWrap={oldDue ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"}
              title="Pending / Old Fee"
              subtitle="Outstanding from previous sessions"
              right={<Chip label={oldDue ? "⚠ Due" : "✓ Clear"} tone={oldDue ? "red" : "green"} />}
              onToggle={() => setPendingOpen(o => !o)}
              open={pendingOpen}
            />
            {pendingOpen && (
              <>
                <AmountStrip cols={[
                  { label: "Total",   value: inr(oldFee.grandTotal), colorClass: "text-slate-800"   },
                  { label: "Paid",    value: inr(oldFee.paidTotal),  colorClass: "text-emerald-600" },
                  { label: "Balance", value: inr(oldFee.balanceFee), colorClass: oldDue ? "text-rose-600" : "text-emerald-600" },
                ]} />

                {/* Progress */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-semibold text-slate-400">Collection Progress</span>
                    <span className="text-[11px] font-black text-emerald-600">{oldFee.paidPct}%</span>
                  </div>
                  <Track pct={oldFee.paidPct} variant={oldDue ? "rose-pink" : "emerald-teal"} />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 px-3 py-3 border-b border-slate-100">
                  <ActionBtn label="Collect" icon={IndianRupee} className="bg-emerald-500 text-white"   onClick={() => router.push(`/admin/collect-old-fee?id=${s.id}`)} />
                  <ActionBtn label="Edit"    icon={Pencil}      className="bg-amber-500 text-white"     onClick={() => router.push(`/admin/edit-old-fee?id=${s.id}`)} />
                  <ActionBtn label="History" icon={History}     className="bg-slate-100 text-slate-700" onClick={() => router.push(`/admin/view-old-fee-history?id=${s.id}`)} />
                </div>

                {/* Records label */}
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Records</p>
                </div>
                <div className="px-3 pb-3">
                  <OldPayTable payments={oldPayments} paidTotal={oldFee.paidTotal} studentId={s.id} router={router} />
                </div>
              </>
            )}
          </Card>
        )}

        {/* ── CURRENT SESSION FEE ── */}
        <Card accent={currDue ? "ring-sky-200" : "ring-emerald-200"}>
          <CardHeader
            icon={Receipt}
            iconWrap="bg-teal-50 text-teal-600"
            title="Current Session Fee"
            subtitle={s.session?.sessionYear}
            right={<Chip label={currDue ? "⚠ Due" : "✓ Clear"} tone={currDue ? "blue" : "green"} />}
            onToggle={() => setCurrentOpen(o => !o)}
            open={currentOpen}
          />
          {currentOpen && (
            <>
              <AmountStrip cols={[
                { label: "Total",   value: inr(currentFee.grandTotal), colorClass: "text-slate-800"   },
                { label: "Paid",    value: inr(currentFee.paidTotal),  colorClass: "text-emerald-600" },
                { label: "Balance", value: inr(currentFee.balanceFee), colorClass: currDue ? "text-sky-600" : "text-emerald-600" },
              ]} />

              {/* Progress */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-semibold text-slate-400">Collection Progress</span>
                  <span className="text-[11px] font-black text-emerald-600">{currentFee.paidPct}%</span>
                </div>
                <Track pct={currentFee.paidPct} variant={currDue ? "blue-sky" : "emerald-teal"} />
              </div>

              {/* Student info row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <LightAvatar name={s.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-slate-800 truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {s.class?.className}/{s.section?.sectionName} · A/C {s.folioNo} · Roll {s.rollNo || "—"}
                  </p>
                </div>
                <Chip label={s.status} tone={s.status === "Active" ? "green" : "slate"} />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-3 py-3 border-b border-slate-100">
                <ActionBtn label="Collect Fee" icon={IndianRupee} className="bg-blue-600 text-white"     onClick={() => router.push(`/admin/add-monthly-fee?id=${s.id}`)} />
                <ActionBtn label="History"     icon={History}     className="bg-teal-600 text-white"     onClick={() => router.push(`/admin/view-fee-details?id=${s.id}`)} />
                <ActionBtn label="Slip"        icon={Printer}     className="bg-slate-100 text-slate-700" onClick={() => router.push(`/admin/fee-slip?id=${s.id}`)} />
              </div>

              {/* Monthly records */}
              {monthlyFees.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Payment Records</p>
                  </div>
                  <div className="px-3 pb-3">
                    <MonthlyPayTable fees={monthlyFees} paidTotal={currentFee.paidTotal} onFullHistory={() => router.push(`/admin/view-fee-details?id=${s.id}`)} />
                  </div>
                </>
              )}
            </>
          )}
        </Card>

        {/* ── BACK BUTTON ── */}
        <button
          onClick={() => router.push("/admin/students")}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white ring-1 ring-slate-200 text-slate-500 text-[13px] font-bold active:scale-[0.98] transition-transform shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Student List
        </button>

      </div>{/* /body */}

      {/* ══════════════════════════════════════════════
          STICKY BOTTOM BAR
      ══════════════════════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
        <div className="max-w-lg mx-auto px-3 pt-2 pb-2 grid gap-2" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>

          {/* Primary CTA */}
          <button
            onClick={() => router.push(`/admin/add-monthly-fee?id=${s.id}`)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-[12px] font-black active:scale-[0.97] transition-transform shadow-md"
          >
            <IndianRupee size={14} />
            Collect Fee
          </button>

          {/* Secondary CTAs */}
          {([
            { Icon: History, label: "History", path: `/admin/view-fee-details?id=${s.id}` },
            { Icon: Printer, label: "Slip",    path: `/admin/fee-slip?id=${s.id}`         },
            { Icon: Pencil,  label: "Edit",    path: `/admin/edit-total-fee?id=${s.id}`   },
          ] as const).map(({ Icon, label, path }) => (
            <button
              key={label}
              onClick={() => router.push(path)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 active:scale-95 transition-transform"
            >
              <Icon size={15} />
              <span className="text-[9px] font-bold">{label}</span>
            </button>
          ))}
        </div>

        {/* iOS home-indicator safe area */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DEFAULT EXPORT  — Suspense wrapper (fixes Next.js build error)
// ─────────────────────────────────────────────────────────────
export default function FeeDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <FeeDashboardPageContent />
    </Suspense>
  );
}