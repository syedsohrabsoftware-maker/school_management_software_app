"use client";

import { ArrowLeft, AlertCircle, Clock, IndianRupee, CheckCircle2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

// ── Inner component — useSearchParams yahan safely use hota hai ──
function MobileAddOldFeePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [oldFee, setOldFee] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const schoolId = getCookie("schoolId") || "1";
        const res = await fetch(`/api/admin/add-old-fee?id=${id}&schoolId=${schoolId}`);
        const json = await res.json();
        if (json.success) setData(json.data);
        else toast.error(json.message);
      } catch {
        toast.error("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (data?.feeExists) return;

    const feeAmount = Number(oldFee);
    if (!oldFee || isNaN(feeAmount) || feeAmount <= 0) {
      toast.error("Fee amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const schoolId = getCookie("schoolId") || "1";
      const payload = {
        studentId: Number(id),
        schoolId: Number(schoolId),
        grandTotal: feeAmount,
      };

      const res = await fetch("/api/admin/add-old-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/admin/fee-dashboard?id=${id}`);
        }, 2000);
      } else {
        toast.error(json.message || "Something went wrong");
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Failed to save old fee record.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-400">
        <div className="size-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[14px] font-medium">Loading details...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="h-dvh flex items-center justify-center bg-[#F8FAFC] text-rose-500 font-medium">
      Student not found
    </div>
  );

  if (isSuccess) {
    return (
      <div className="h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center px-6 transition-all animate-in fade-in zoom-in duration-300">
        <div className="size-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-[22px] font-semibold text-slate-800 mb-2">Fee Saved Successfully!</h2>
        <p className="text-[14px] text-slate-500 text-center max-w-xs">
          The pending due amount for {data.student.name} has been updated.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] font-sans flex flex-col">

      {/* ── APP BAR ── */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 pt-[env(safe-area-inset-top,0px)]">
        <div className="h-14 flex items-center px-4 relative">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-indigo-600 active:opacity-50 transition-opacity"
          >
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-[16px] font-semibold text-slate-800 tracking-tight">Set Old Fee</h1>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-10">

        {/* Student Card */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-4">
          <div className="size-11 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
            <Clock size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-slate-800 truncate">{data.student.name}</p>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {data.student.className} - {data.student.sectionName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Folio</p>
            <p className="text-[13px] font-medium text-slate-700">{data.student.folioNo}</p>
          </div>
        </div>

        {/* Form / Already Exists */}
        {data.feeExists ? (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center flex flex-col items-center gap-3 shadow-sm">
            <div className="size-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-1">
              <AlertCircle size={28} strokeWidth={2} />
            </div>
            <p className="text-[16px] font-semibold text-slate-800">Record Exists</p>
            <p className="text-[14px] text-slate-500 leading-relaxed">
              Old fee details have already been set for this student.
            </p>
            <button
              onClick={() => router.push(`/admin/fee-dashboard?id=${id}`)}
              className="mt-4 text-[14px] font-medium text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl active:bg-indigo-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-slate-500 ml-1">
                Pending Amount (Old Sessions)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <IndianRupee size={22} strokeWidth={2} />
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={oldFee}
                  onChange={(e) => setOldFee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-[22px] font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !oldFee}
              className="w-full py-4 rounded-xl bg-indigo-600 text-white text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60 shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Confirm & Save"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ FIX: Suspense wrapper — default export yahi hoga
export default function MobileAddOldFeePage() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-400">
        <div className="size-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[14px] font-medium">Loading...</p>
      </div>
    }>
      <MobileAddOldFeePageContent />
    </Suspense>
  );
}
