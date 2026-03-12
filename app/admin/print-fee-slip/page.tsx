"use client";

import { ArrowLeft, Printer } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

// ─────────────────────────────────────────────────────────────
//  INNER COMPONENT  (uses useSearchParams — must be inside Suspense)
// ─────────────────────────────────────────────────────────────
function PrintFeeSlipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const slipNo = searchParams.get("slip_no");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id || !slipNo) return;
    const fetchData = async () => {
      try {
        const schoolId = getCookie("schoolId") || "1";
        const res = await fetch(`/api/admin/print-fee-slip?id=${id}&slip_no=${encodeURIComponent(slipNo)}&schoolId=${schoolId}`);
        const json = await res.json();
        if (json.success) setData(json.data);
        else toast.error(json.message);
      } catch (err) {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, slipNo]);

  if (loading) return <div className="h-dvh flex items-center justify-center bg-slate-50 text-slate-400">Loading receipt...</div>;
  if (!data) return <div className="h-dvh flex items-center justify-center bg-slate-50 text-rose-500 font-medium">Receipt not found</div>;

  const { student, payment } = data;

  return (
    <div className="min-h-dvh bg-slate-100 font-sans flex flex-col items-center py-6 px-4">

      {/* ── ACTION BUTTONS (Hidden during Print) ── */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 print:hidden">
        <button onClick={() => router.back()} className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-[14px] font-semibold flex items-center gap-2 shadow-md active:scale-95 transition-transform">
          <Printer size={16} /> Print Receipt
        </button>
      </div>

      {/* ── PRINTABLE RECEIPT CARD ── */}
      <div className="w-full max-w-md bg-white p-6 shadow-md border border-slate-200 printable-area">

        {/* School Header Placeholder */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
          <h1 className="text-[20px] font-bold text-slate-900 uppercase tracking-widest">School Name</h1>
          <p className="text-[11px] text-slate-600 font-medium mt-1">123 Education Lane, City Area</p>
          <p className="text-[11px] text-slate-600 font-medium">Contact: +91-XXXXXXXXXX</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-wider">Fee Receipt</h2>
          <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">No: {payment.slipNo}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-4 text-[13px] mb-6">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-slate-500 font-medium">Student Name</p>
            <p className="font-bold text-slate-800">{student.name}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-slate-500 font-medium">Folio / A/C</p>
            <p className="font-bold text-slate-800">{student.folioNo}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Class</p>
            <p className="font-bold text-slate-800">{student.className} - {student.sectionName}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Payment Date</p>
            <p className="font-bold text-slate-800">{new Date(payment.paymentDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Amount Box */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 flex justify-between text-[12px] font-bold text-slate-600 uppercase">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="px-4 py-4 flex justify-between items-center">
            <div>
              <p className="text-[14px] font-bold text-slate-800">Tuition / Monthly Fee</p>
              <p className="text-[11px] text-slate-500 mt-0.5">For: {payment.feeMonth} {payment.feeYear}</p>
            </div>
            <p className="text-[16px] font-bold text-slate-800">₹ {Number(payment.paidAmount).toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-300 flex justify-between items-center">
            <span className="text-[13px] font-bold text-slate-700">Total Paid</span>
            <span className="text-[18px] font-bold text-slate-900">₹ {Number(payment.paidAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-500 space-y-1">
          <p><strong>Payment Mode:</strong> {payment.paymentMethod}</p>
          {payment.remarks && <p><strong>Remarks:</strong> {payment.remarks}</p>}
        </div>

        <div className="mt-12 flex justify-between items-end text-[12px] font-bold text-slate-800">
          <div className="border-t border-slate-400 pt-2 w-32 text-center">Cashier Sign</div>
          <div className="border-t border-slate-400 pt-2 w-32 text-center">Parent Sign</div>
        </div>

      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background-color: white !important; }
          .printable-area { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
        }
      `}} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DEFAULT EXPORT  — Suspense wrapper (fixes Next.js build error)
// ─────────────────────────────────────────────────────────────
export default function MobilePrintFeeSlip() {
  return (
    <Suspense fallback={<div className="h-dvh flex items-center justify-center bg-slate-50 text-slate-400">Loading receipt...</div>}>
      <PrintFeeSlipContent />
    </Suspense>
  );
}