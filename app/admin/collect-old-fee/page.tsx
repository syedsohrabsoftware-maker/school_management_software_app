"use client";

import { Suspense } from "react";
import { ArrowLeft, IndianRupee, CheckCircle2, FileText, Calendar, Hash, CreditCard, MessageSquare, Printer, MessageCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

function MobileCollectOldFeeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    slipNo: "", month: "", year: new Date().getFullYear().toString(),
    paidAmount: "", paymentDate: new Date().toISOString().split('T')[0],
    reminderDate: "", paymentMethod: "", remarks: "",
  });

  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const methodsList = ['Cash', 'Bank Transfer', 'G Pay', 'Phon Pay', 'Online Portal'];

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const schoolId = getCookie("schoolId") || "1";
        const res = await fetch(`/api/admin/collect-old-fee?id=${id}&schoolId=${schoolId}`);
        const json = await res.json();
        if (json.success) setData(json.data);
        else toast.error(json.message);
      } catch (err) {
        toast.error("Network error");
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.slipNo || !form.month || !form.year || !form.paidAmount || !form.paymentDate || !form.reminderDate || !form.paymentMethod) {
      toast.error("Please fill all required fields (including reminder date).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        studentId: Number(id),
        schoolId: Number(getCookie("schoolId") || "1"),
        folioNo: data.student.folioNo,
        enteredBy: getCookie("username") || "Admin",
        ...form,
        paidAmount: Number(form.paidAmount),
        year: Number(form.year)
      };

      const res = await fetch("/api/admin/collect-old-fee", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) setIsSuccess(true);
      else { toast.error(json.message); setIsSubmitting(false); }
    } catch (err) {
      toast.error("Failed to save fee record.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-dvh flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-400"><div className="size-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" /></div>;
  if (!data) return <div className="h-dvh flex items-center justify-center bg-[#F8FAFC] text-rose-500 font-medium">Student not found</div>;

  if (isSuccess) {
    const link = typeof window !== "undefined" ? `${window.location.origin}/admin/print-old-fee-slip?id=${id}&slip_no=${encodeURIComponent(form.slipNo)}` : "";
    const whatsappMsg = `*Old Fee Payment Receipt*\n\nDear Parent (${data.student.name}),\nWe have received your previous pending fee.\n\n*Amount:* ₹${form.paidAmount}\n*Slip No:* ${form.slipNo}\n*Date:* ${new Date(form.paymentDate).toLocaleDateString()}\n\nView official receipt here:\n${link}\n\nThank you!`;
    const whatsappUrl = `https://wa.me/91${data.student?.mobileNo || ""}?text=${encodeURIComponent(whatsappMsg)}`;

    return (
      <div className="h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center px-6 transition-all animate-in fade-in zoom-in duration-300">
        <div className="size-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-[22px] font-semibold text-slate-800 mb-2">Old Fee Collected!</h2>
        <p className="text-[14px] text-slate-500 text-center max-w-xs mb-8">₹{form.paidAmount} cleared from past dues.</p>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <button onClick={() => window.open(whatsappUrl, '_blank')} className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-[15px] font-semibold active:scale-[0.98] transition-transform shadow-md flex items-center justify-center gap-2">
            <MessageCircle size={20} /> Send via WhatsApp
          </button>
          <button onClick={() => window.open(`/admin/print-old-fee-slip?id=${id}&slip_no=${encodeURIComponent(form.slipNo)}`, '_blank')} className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <Printer size={18} /> Print Slip
          </button>
          <button onClick={() => router.push(`/admin/view-old-fee-history?id=${id}`)} className="w-full py-3.5 rounded-xl bg-rose-50 text-rose-600 text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-2">
            View History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] font-sans flex flex-col">
      <div className="sticky top-0 z-50 bg-[#FFFBEA] border-b border-[#F2E8A5] shadow-sm pt-[env(safe-area-inset-top,0px)]">
        <div className="h-14 flex items-center px-4 relative">
          <button onClick={() => router.back()} className="size-9 -ml-2 rounded-2xl bg-yellow-600/10 flex items-center justify-center text-yellow-800 active:scale-90 transition-transform"><ArrowLeft size={18} /></button>
          <div className="absolute left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
            <h1 className="text-[15px] font-semibold text-yellow-900 tracking-tight">Collect Old Fee</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10">
        <div className="bg-rose-50 rounded-2xl p-4 mb-4 border border-rose-100 flex items-center gap-3">
          <div className="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><Clock size={18} /></div>
          <div>
            <p className="text-[15px] font-semibold text-slate-800">{data.student.name}</p>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Folio: {data.student.folioNo}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col gap-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500">Slip Number *</label>
              <input type="text" name="slipNo" value={form.slipNo} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500">Paid Amount *</label>
              <input type="number" step="0.01" name="paidAmount" value={form.paidAmount} onChange={handleChange} className="w-full bg-rose-50/50 border border-rose-100 rounded-xl py-3 px-3 text-[18px] font-bold text-rose-700" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500">Month *</label>
              <select name="month" value={form.month} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold">
                <option value="">Select</option>
                {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500">Year *</label>
              <input type="number" name="year" value={form.year} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500">Payment Date *</label>
              <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500">Reminder Date *</label>
              <input type="date" name="reminderDate" value={form.reminderDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold text-rose-600 focus:border-rose-400" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500">Payment Method *</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold">
                <option value="">Select Method</option>
                {methodsList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-slate-500">Remarks</label>
              <textarea name="remarks" rows={2} value={form.remarks} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px]" />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 rounded-xl bg-rose-600 text-white text-[15px] font-semibold active:scale-[0.98] transition-transform mt-2 flex items-center justify-center gap-2">
            {isSubmitting ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm Old Fee"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MobileCollectOldFee() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-400">
        <div className="size-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
      </div>
    }>
      <MobileCollectOldFeeContent />
    </Suspense>
  );
}