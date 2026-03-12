"use client";

import { ArrowLeft, Edit3, IndianRupee, CheckCircle2, Trash2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getCookie = (n: string) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

// ── Inner Component ──
function MobileEditTotalFeePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    const fetchData = async () => {
      try {
        const schoolId = getCookie("schoolId") || "1";
        const res = await fetch(`/api/admin/edit-total-fee?id=${id}&schoolId=${schoolId}`);
        const json = await res.json();

        if (json.success) {
          setData(json.data);
          const fd = json.data.feeDetails;
          if (fd) {
            const getVal = (camel: string, snake: string) => {
              const val = fd[camel] !== undefined ? fd[camel] : fd[snake];
              return val !== null && val !== undefined && val !== "" ? String(Number(val)) : "";
            };

            let parsedDate = "";
            const rawDate = fd.dueDate || fd.due_date;
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                parsedDate = d.toISOString().split("T")[0];
              }
            }

            setForm({
              registrationFee: getVal("registrationFee", "registration_fee"),
              admissionFee:    getVal("admissionFee",    "admission_fee"),
              annualCharge:    getVal("annualCharge",    "annual_charge"),
              tuitionFee:      getVal("tuitionFee",      "tuition_fee"),
              otherFee:        getVal("otherFee",        "other_fee"),
              dueDate:         parsedDate,
            });
          }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.dueDate) {
      toast.error("Please select a due date");
      return;
    }
    setIsSubmitting(true);
    try {
      const schoolId = getCookie("schoolId") || "1";
      const payload = {
        studentId:       Number(id),
        schoolId:        Number(schoolId),
        registrationFee: Number(form.registrationFee) || 0,
        admissionFee:    Number(form.admissionFee)    || 0,
        annualCharge:    Number(form.annualCharge)    || 0,
        tuitionFee:      Number(form.tuitionFee)      || 0,
        otherFee:        Number(form.otherFee)        || 0,
        grandTotal,
        dueDate: form.dueDate,
      };

      const res = await fetch("/api/admin/edit-total-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setIsSuccess(true);
        setTimeout(() => router.push(`/admin/fee-dashboard?id=${id}`), 2000);
      } else {
        toast.error(json.message);
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Failed to update fee record.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this fee record? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const schoolId = getCookie("schoolId") || "1";
      const res = await fetch(`/api/admin/edit-total-fee?id=${id}&schoolId=${schoolId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Fee record deleted successfully!");
        router.push(`/admin/fee-dashboard?id=${id}`);
      } else {
        toast.error(json.message);
        setIsDeleting(false);
      }
    } catch {
      toast.error("Failed to delete fee record.");
      setIsDeleting(false);
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
      Record not found
    </div>
  );

  if (isSuccess) return (
    <div className="h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in duration-300">
      <div className="size-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle2 size={40} strokeWidth={2.5} />
      </div>
      <h2 className="text-[22px] font-semibold text-slate-800 mb-2">Updated Successfully!</h2>
      <p className="text-[14px] text-slate-500 text-center max-w-xs">
        The fee structure for {data.student.name} has been updated.
      </p>
    </div>
  );

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
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-[15px] font-semibold text-yellow-900 tracking-tight">Edit Full Fee</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10">
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
          <p className="text-[15px] font-semibold text-slate-800">{data.student.name}</p>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {data.student.className} - {data.student.sectionName}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "registrationFee", label: "Registration Fee" },
              { name: "admissionFee",    label: "Admission Fee"    },
              { name: "annualCharge",    label: "Annual Charges"   },
              { name: "tuitionFee",      label: "Tuition Fee"      },
              { name: "otherFee",        label: "Other Fee"        },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 ml-1">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IndianRupee size={14} />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 text-[14px] font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            ))}

            {/* Grand Total */}
            <div className="flex flex-col gap-1.5 col-span-2 mt-1">
              <label className="text-[11px] font-bold text-indigo-600 ml-1">Grand Total</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                  <IndianRupee size={16} />
                </span>
                <input
                  type="text"
                  readOnly
                  value={grandTotal.toFixed(2)}
                  className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl py-3 pl-9 pr-3 text-[16px] font-bold text-indigo-700 pointer-events-none"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1.5 col-span-2 mb-2">
              <label className="text-[11px] font-semibold text-slate-500 ml-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isDeleting}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60 shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting
              ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Edit3 size={18} /> Update Fee</>
            }
          </button>

          <button
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="w-full py-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isDeleting
              ? <div className="size-5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
              : <><Trash2 size={18} /> Delete Fee Record</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ FIX: Suspense wrapper
export default function MobileEditTotalFeePage() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-400">
        <div className="size-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[14px] font-medium">Loading...</p>
      </div>
    }>
      <MobileEditTotalFeePageContent />
    </Suspense>
  );
}