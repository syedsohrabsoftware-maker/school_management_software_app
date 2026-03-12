"use client";

import { ArrowLeft, Save, AlertCircle, Users, IndianRupee } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

// ── Inner component ──
function AddTotalFeePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    registrationFee: "",
    admissionFee: "",
    annualCharge: "",
    tuitionFee: "",
    otherFee: "",
    dueDate: "",
  });

  const grandTotal =
    (Number(form.registrationFee) || 0) +
    (Number(form.admissionFee) || 0) +
    (Number(form.annualCharge) || 0) +
    (Number(form.tuitionFee) || 0) +
    (Number(form.otherFee) || 0);

  useEffect(() => {
    if (!id) return;
    const fetchStudentData = async () => {
      try {
        const schoolId = getCookie("schoolId") || "1";
        const res = await fetch(`/api/admin/add-total-fee?id=${id}&schoolId=${schoolId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast.error(json.message);
        }
      } catch {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data?.feeExists) return;

    setIsSubmitting(true);
    try {
      const schoolId = getCookie("schoolId") || "1";
      const payload = {
        studentId: Number(id),
        schoolId: Number(schoolId),
        registrationFee: Number(form.registrationFee) || 0,
        admissionFee: Number(form.admissionFee) || 0,
        annualCharge: Number(form.annualCharge) || 0,
        tuitionFee: Number(form.tuitionFee) || 0,
        otherFee: Number(form.otherFee) || 0,
        grandTotal,
        dueDate: form.dueDate,
      };

      const res = await fetch("/api/admin/add-total-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(json.message);
        router.push(`/admin/fee-dashboard?id=${id}`);
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to save fee record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center text-slate-400">
      Loading...
    </div>
  );

  if (!data) return (
    <div className="min-h-dvh flex items-center justify-center text-rose-500 font-bold">
      Student not found.
    </div>
  );

  return (
    <div className="min-h-dvh bg-slate-50 font-sans pb-28">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-50 bg-[#FFFBEA] border-b border-[#F2E8A5] shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="size-9 rounded-2xl bg-yellow-600/10 ring-1 ring-yellow-600/20 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <ArrowLeft size={15} className="text-yellow-800" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-[14px] font-black text-yellow-900 tracking-tight">Set Full Fee</p>
            <p className="text-[10px] text-yellow-700 font-semibold mt-0.5">Add Base Fee Structure</p>
          </div>
          <div className="size-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 flex flex-col gap-4">

        {/* ── STUDENT INFO CARD ── */}
        <div className="bg-white rounded-3xl p-4 ring-1 ring-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[14px] font-black text-slate-800">{data.student.name}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {data.student.className} - {data.student.sectionName} | A/C: {data.student.folioNo}
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/add-custom-fee?id=${id}`)}
              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg"
            >
              Add Custom Fee →
            </button>
          </div>

          {data.siblings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Users size={12} /> Siblings
              </p>
              {data.siblings.map((sib: any) => (
                <p key={sib.id} className="text-[12px] font-semibold text-teal-700">
                  ↳ {sib.name} <span className="text-teal-500/80">({sib.relationToMain})</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* ── FORM OR WARNING ── */}
        {data.feeExists ? (
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl text-center flex flex-col items-center gap-3">
            <div className="size-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-800">Fee Record Exists</p>
              <p className="text-xs text-rose-600 font-medium mt-1">
                Duplicate entry not allowed for this student.
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/fee-dashboard?id=${id}`)}
              className="mt-2 text-[12px] font-bold text-white bg-rose-500 px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-4 ring-1 ring-slate-200 shadow-sm grid grid-cols-2 gap-3">

            {[
              { name: "registrationFee", label: "Registration Fee" },
              { name: "admissionFee",    label: "Admission Fee"    },
              { name: "annualCharge",    label: "Annual Charges"   },
              { name: "tuitionFee",      label: "Tuition Fee"      },
              { name: "otherFee",        label: "Pending Fee"      },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <IndianRupee size={12} />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}

            {/* Grand Total */}
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-bold text-indigo-600">Grand Total</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500">
                  <IndianRupee size={14} />
                </span>
                <input
                  type="text"
                  readOnly
                  value={grandTotal.toFixed(2)}
                  className="w-full bg-indigo-50 border border-indigo-200 rounded-xl py-2.5 pl-8 pr-3 text-[15px] font-black text-indigo-700 pointer-events-none"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-bold text-slate-600">Due Date</label>
              <input
                type="date"
                name="dueDate"
                required
                value={form.dueDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="col-span-2 mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[13px] font-bold active:scale-[0.98] transition-transform shadow-md disabled:opacity-70"
            >
              <Save size={16} />
              {isSubmitting ? "Saving..." : "Save Full Fee"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ✅ FIX: Suspense wrapper — default export
export default function AddTotalFeePage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center text-slate-400">
        Loading...
      </div>
    }>
      <AddTotalFeePageContent />
    </Suspense>
  );
}