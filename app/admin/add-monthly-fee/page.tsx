"use client";

import { ArrowLeft, IndianRupee, CheckCircle2, FileText, Calendar, Hash, CreditCard, MessageSquare, Printer, MessageCircle } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

// ── Inner component (useSearchParams yahan use hota hai) ──
function MobileAddMonthlyFeePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    slipNo: "",
    folioNo: "",
    month: "",
    year: new Date().getFullYear().toString(),
    paidAmount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    reminderDate: "",
    paymentMethod: "",
    remarks: "",
  });

  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const methodsList = ["Cash", "Bank Transfer", "Phon Pay", "Google Pay", "Online Portal"];

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const schoolId = getCookie("schoolId") || "1";
        const res = await fetch(`/api/admin/add-monthly-fee?id=${id}&schoolId=${schoolId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setForm((prev) => ({ ...prev, folioNo: json.data.student.folioNo || "" }));
        } else {
          toast.error(json.message);
        }
      } catch {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.slipNo || !form.month || !form.year || !form.paidAmount || !form.paymentDate || !form.paymentMethod) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (Number(form.paidAmount) <= 0) {
      toast.error("Paid amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const schoolId = getCookie("schoolId") || "1";
      const payload = {
        studentId: Number(id),
        schoolId: Number(schoolId),
        ...form,
        paidAmount: Number(form.paidAmount),
        year: Number(form.year),
      };

      const res = await fetch("/api/admin/add-monthly-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setIsSuccess(true);
      } else {
        toast.error(json.message);
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Failed to save fee record.");
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-dvh flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-400">
      <div className="size-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-[14px] font-medium">Loading details...</p>
    </div>
  );

  if (!data) return (
    <div className="h-dvh flex items-center justify-center bg-[#F8FAFC] text-rose-500 font-medium text-[15px]">
      Student not found
    </div>
  );

  // ── SUCCESS SCREEN ──
  if (isSuccess) {
    const whatsappMsg = `*Payment Receipt*\n\nDear Parent/Student (${data.student.name}),\nWe have successfully received your fee payment.\n\n*Amount:* ₹${form.paidAmount}\n*Month:* ${form.month} ${form.year}\n*Slip No:* ${form.slipNo}\n*Date:* ${new Date(form.paymentDate).toLocaleDateString()}\n\nThank you!`;
    const mobileNo = data.student.mobileNo || "";
    const whatsappUrl = `https://wa.me/91${mobileNo}?text=${encodeURIComponent(whatsappMsg)}`;

    return (
      <div className="h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center px-6 transition-all animate-in fade-in zoom-in duration-300">
        <div className="size-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-[22px] font-semibold text-slate-800 mb-2">Payment Saved!</h2>
        <p className="text-[14px] text-slate-500 text-center max-w-xs mb-8">
          ₹{form.paidAmount} received from {data.student.name} for {form.month} {form.year}.
        </p>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            onClick={() => window.open(whatsappUrl, "_blank")}
            className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-[15px] font-semibold active:scale-[0.98] transition-transform shadow-md flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} /> Send via WhatsApp
          </button>

          <button
            onClick={() => window.open(`/admin/print-fee-slip?id=${id}&slip_no=${encodeURIComponent(form.slipNo)}`, "_blank")}
            className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-2"
          >
            <Printer size={18} /> Print Slip
          </button>

          <button
            onClick={() => router.push(`/admin/fee-dashboard?id=${id}`)}
            className="w-full mt-4 py-2 text-indigo-600 text-[14px] font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] font-sans flex flex-col">
      <div className="sticky top-0 z-50 bg-[#FFFBEA] border-b border-[#F2E8A5] shadow-sm pt-[env(safe-area-inset-top,0px)]">
        <div className="h-14 flex items-center px-4 relative">
          <button
            onClick={() => router.back()}
            className="size-9 -ml-2 rounded-2xl bg-yellow-600/10 ring-1 ring-yellow-600/20 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} className="text-yellow-800" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
            <h1 className="text-[15px] font-semibold text-yellow-900 tracking-tight">Add Monthly Fee</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10">
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-3">
          <div className="size-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <Hash size={18} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-slate-800">{data.student.name}</p>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Folio: {data.student.folioNo}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Slip Number *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><FileText size={16} /></span>
                <input type="text" name="slipNo" value={form.slipNo} onChange={handleChange} placeholder="e.g. SLP-101" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[14px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Paid Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"><IndianRupee size={18} /></span>
                <input type="number" step="0.01" inputMode="decimal" name="paidAmount" value={form.paidAmount} onChange={handleChange} placeholder="0.00" className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl py-3 pl-9 pr-3 text-[18px] font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Month *</label>
              <select name="month" value={form.month} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">Select Month</option>
                {monthsList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Year *</label>
              <input type="number" name="year" value={form.year} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Payment Date *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={16} /></span>
                <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[14px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Payment Method *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><CreditCard size={16} /></span>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[14px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="">Select Method</option>
                  {methodsList.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Reminder Date (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400"><Calendar size={16} /></span>
                <input type="date" name="reminderDate" value={form.reminderDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[14px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2 mb-2">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Remarks</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400"><MessageSquare size={16} /></span>
                <textarea name="remarks" rows={2} value={form.remarks} onChange={handleChange} placeholder="Any notes..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[14px] font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60 shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting
              ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : "Confirm & Save Payment"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ FIX: Suspense boundary ke andar wrap karo — useSearchParams ke liye required hai
export default function MobileAddMonthlyFeePage() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-400">
        <div className="size-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[14px] font-medium">Loading...</p>
      </div>
    }>
      <MobileAddMonthlyFeePageContent />
    </Suspense>
  );
}