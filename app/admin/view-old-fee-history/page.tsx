"use client";

import { Suspense } from "react";
import { ArrowLeft, Clock, Printer, Trash2, IndianRupee, X, CheckCircle2, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

function MobileOldFeeHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const fetchHistory = async () => {
    try {
      const schoolId = getCookie("schoolId") || "1";
      const res = await fetch(`/api/admin/view-old-fee-history?id=${studentId}&schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else toast.error(json.message);
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchHistory();
  }, [studentId]);

  const handleDelete = async (e: React.MouseEvent, paymentId: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    try {
      const schoolId = getCookie("schoolId") || "1";
      const res = await fetch(`/api/admin/view-old-fee-history?paymentId=${paymentId}&schoolId=${schoolId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast.success("Deleted"); fetchHistory(); }
    } catch { toast.error("Error"); }
  };

  if (loading) return (
    <div className="h-dvh flex items-center justify-center bg-[#F8FAFC]">
      <div className="size-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-[#FFFBEA] border-b border-[#F2E8A5] h-14 flex items-center px-4">
        <button onClick={() => router.back()} className="size-9 -ml-2 rounded-2xl bg-yellow-600/10 flex items-center justify-center text-yellow-800 active:scale-90 transition-transform">
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold text-yellow-900">Old Fee History</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">

        {/* ── SUMMARY CARD ── */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Old Fee Paid</p>
            <p className="text-[24px] font-black text-slate-800 flex items-center gap-1">
              <IndianRupee size={20} className="text-rose-500" strokeWidth={3} />
              {data?.payments.reduce((acc: number, curr: any) => acc + Number(curr.paidAmount || curr.paid_amount || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        {/* ── PAYMENT LIST ── */}
        <div className="space-y-3">
          {data?.payments.map((pay: any) => (
            <div
              key={pay.id}
              onClick={() => setSelectedPayment(pay)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:bg-slate-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">₹{Number(pay.paidAmount || pay.paid_amount).toFixed(2)}</p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {new Date(pay.paymentDate || pay.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} • {pay.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => handleDelete(e, pay.id)} className="p-2 text-slate-300 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
                <ArrowLeft size={16} className="text-slate-300 rotate-180" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SLIP MODAL ── */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={() => setSelectedPayment(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSelectedPayment(null)} className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="pt-10 pb-6 px-6 flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                <CheckCircle2 size={32} strokeWidth={3} />
              </div>
              <h2 className="text-[18px] font-bold text-slate-800">Payment Successful</h2>
              <p className="text-[13px] text-slate-400 font-medium mt-1">
                {new Date(selectedPayment.paymentDate || selectedPayment.payment_date).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>

              <div className="mt-6 mb-2 flex items-center justify-center gap-1">
                <IndianRupee size={24} className="text-slate-800" strokeWidth={3} />
                <span className="text-[36px] font-black text-slate-800 tracking-tight">
                  {Number(selectedPayment.paidAmount || selectedPayment.paid_amount).toFixed(2)}
                </span>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                Old Fee Payment
              </div>

              {/* Details */}
              <div className="w-full bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-slate-400">Student Name</span>
                  <span className="text-[13px] font-bold text-slate-700">{data.student.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-slate-400">Slip Number</span>
                  <span className="text-[13px] font-bold text-slate-700">{selectedPayment.slipNo || selectedPayment.slip_no}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-slate-400">Payment Mode</span>
                  <span className="text-[13px] font-bold text-slate-700">{selectedPayment.paymentMethod}</span>
                </div>
                {selectedPayment.remarks && (
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-start">
                    <span className="text-[12px] font-medium text-slate-400">Remarks</span>
                    <span className="text-[12px] font-medium text-slate-500 italic max-w-[150px] text-right">{selectedPayment.remarks}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 active:scale-95 transition-transform"
                >
                  <Share2 size={16} /> Share
                </button>
                <button
                  onClick={() => window.open(`/admin/print-old-fee-slip?id=${studentId}&slip_no=${selectedPayment.slipNo || selectedPayment.slip_no}`, "_blank")}
                  className="flex items-center justify-center gap-2 py-3 bg-indigo-600 rounded-xl text-[13px] font-bold text-white shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                >
                  <Printer size={16} /> Print Receipt
                </button>
              </div>
            </div>

            {/* Receipt Cutout */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 flex justify-around px-2">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="size-3 bg-[#F8FAFC] rounded-full -mb-1.5" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-900/90 backdrop-blur-md rounded-full shadow-xl flex items-center gap-3 border border-white/10 pointer-events-none">
        <p className="text-white text-[12px] font-bold">Tap record to view details</p>
      </div>

    </div>
  );
}

export default function MobileOldFeeHistory() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex items-center justify-center bg-[#F8FAFC]">
        <div className="size-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MobileOldFeeHistoryContent />
    </Suspense>
  );
}