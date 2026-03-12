"use client";

import { Suspense } from "react";
import { ArrowLeft, Clock, Printer, Trash2, Edit3, IndianRupee, X, CheckCircle2, MessageCircle, MoreVertical, User, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

function MobileViewFeeDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPay, setSelectedPay] = useState<any>(null);

  const fetchDetails = async () => {
    try {
      const schoolId = getCookie("schoolId") || "1";
      const res = await fetch(`/api/admin/view-fee-details?id=${studentId}&schoolId=${schoolId}`);
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
    if (studentId) fetchDetails();
  }, [studentId]);

  if (loading) return (
    <div className="h-dvh flex items-center justify-center bg-[#F8FAFC]">
      <div className="size-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="h-dvh flex items-center justify-center text-rose-500">Not Found</div>
  );

  const totalPaid = data.feeRecords.reduce((acc: number, curr: any) => acc + Number(curr.paidAmount || 0), 0);
  const balance = Number(data.grandTotalFee) - totalPaid;

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex flex-col relative">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-[#FFFBEA] border-b border-[#F2E8A5] h-14 flex items-center px-4">
        <button onClick={() => router.back()} className="size-9 -ml-2 rounded-2xl bg-yellow-600/10 flex items-center justify-center text-yellow-800">
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold text-yellow-900">Current Fee Details</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">

        {/* ── BALANCE CARD ── */}
        <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Folio: {data.student.folioNo}</p>
          <h2 className="text-[18px] font-bold text-slate-800 text-center mb-6">{data.student.name}</h2>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
              <p className="text-[14px] font-bold text-slate-700">₹{Number(data.grandTotalFee).toLocaleString()}</p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Paid</p>
              <p className="text-[14px] font-bold text-emerald-600">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Balance</p>
              <p className="text-[14px] font-bold text-rose-600">₹{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ── TRANSACTION LIST ── */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Payment History</h3>
        </div>

        <div className="space-y-3">
          {data.feeRecords.map((fee: any) => (
            <div
              key={fee.id}
              onClick={() => setSelectedPay(fee)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:bg-slate-50 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                  {fee.feeMonth.substring(0, 3)}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">₹{Number(fee.paidAmount).toFixed(2)}</p>
                  <p className="text-[11px] font-medium text-slate-400">{fee.feeMonth} {fee.feeYear} • {fee.slipNo}</p>
                </div>
              </div>
              <MoreVertical size={16} className="text-slate-300 group-active:text-indigo-500" />
            </div>
          ))}
        </div>
      </div>

      {/* ── SLIP MODAL ── */}
      {selectedPay && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={() => setSelectedPay(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[32px] overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl">

            <div className="pt-10 pb-8 px-6 flex flex-col items-center">
              <div className="size-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
                <CheckCircle2 size={32} strokeWidth={3} />
              </div>
              <h2 className="text-[18px] font-bold text-slate-800 tracking-tight">Fee Paid Successfully</h2>
              <p className="text-[12px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
                {new Date(selectedPay.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>

              <div className="my-6 flex items-center gap-1">
                <IndianRupee size={24} className="text-slate-800" strokeWidth={3} />
                <span className="text-[36px] font-black text-slate-800 tracking-tighter">{Number(selectedPay.paidAmount).toFixed(2)}</span>
              </div>

              {/* Student Card */}
              <div className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-slate-800">{data.student.name}</p>
                  <p className="text-[11px] font-medium text-slate-500 italic uppercase">
                    Class: {data.student.className || 'N/A'} - {data.student.sectionName || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="w-full bg-slate-50 rounded-2xl p-4 space-y-3 mb-6">
                <div className="flex justify-between text-[13px] border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-medium">Slip Number</span>
                  <span className="font-bold text-slate-700">{selectedPay.slipNo}</span>
                </div>
                <div className="flex justify-between text-[13px] border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-medium">Folio No</span>
                  <span className="font-bold text-slate-700">{data.student.folioNo}</span>
                </div>
                <div className="flex justify-between text-[13px] border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-medium">Fee Month</span>
                  <span className="font-bold text-slate-700">{selectedPay.feeMonth} {selectedPay.feeYear}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-400 font-medium">Payment Mode</span>
                  <span className="font-bold text-slate-700">{selectedPay.paymentMethod}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const msg = `*FEES RECEIPT*\n\n✅ *Status:* Paid Successfully\n👤 *Student:* ${data.student.name}\n📚 *Class:* ${data.student.className} - ${data.student.sectionName}\n📄 *Slip No:* ${selectedPay.slipNo}\n💰 *Amount:* ₹${Number(selectedPay.paidAmount).toFixed(2)}\n🗓️ *For Month:* ${selectedPay.feeMonth} ${selectedPay.feeYear}\n📅 *Date:* ${new Date(selectedPay.paymentDate).toLocaleDateString()}\n\n_Thank you for the payment!_`;
                    window.open(`https://wa.me/91${data.student.mobileNo || ''}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-2 py-3.5 bg-[#25D366] rounded-2xl text-[13px] font-bold text-white active:scale-95 transition-transform"
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
                <button
                  onClick={() => window.open(`/admin/print-fee-slip?id=${studentId}&slip_no=${selectedPay.slipNo}`, '_blank')}
                  className="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 rounded-2xl text-[13px] font-bold text-white active:scale-95 transition-transform shadow-lg shadow-indigo-100"
                >
                  <Printer size={18} /> Print Slip
                </button>
              </div>

              <button onClick={() => setSelectedPay(null)} className="mt-6 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                Close Receipt
              </button>
            </div>

            {/* Receipt Cutout Design */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 flex justify-around px-2 opacity-10">
              {[...Array(20)].map((_, i) => (<div key={i} className="size-3 bg-slate-900 rounded-full -mb-1.5" />))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MobileViewFeeDetails() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex items-center justify-center bg-[#F8FAFC]">
        <div className="size-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MobileViewFeeDetailsContent />
    </Suspense>
  );
}