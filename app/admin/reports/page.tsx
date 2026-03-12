// FILE PATH: app/admin/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const formatCurrency = (num: number) => {
  if (!num) return "₹0";
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)   return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString()}`;
};

function IC({ name, size = 20, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:color, strokeWidth:1.8, strokeLinecap:"round" as const, strokeLinejoin:"round" as const };
  const map: Record<string, React.ReactNode> = {
    students: <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></>,
    teachers: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    fee:      <><circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5-1.3 2-3 2-3 1.1-3 2.5S10.7 17 12 17s3-1.1 3-2.5"/><path d="M12 7v1M12 16v1"/></>,
    bell:     <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    chart:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    exam:     <><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></>,
    employee: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    message:  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    chevron:  <path d="M9 18l6-6-6-6"/>,
  };
  return <svg {...p}>{map[name] ?? map.chart}</svg>;
}

const QUICK_REPORTS = [
  { label:"Fee Report Wise",     icon:"chart",    color:"#6366f1" },
  { label:"Fee Due Report",      icon:"bell",     color:"#ef4444" },
  { label:"Attendance Report",   icon:"teachers", color:"#0ea5e9" },
  { label:"Result Analysis",     icon:"exam",     color:"#8b5cf6" },
  { label:"Total Fee Collected", icon:"fee",      color:"#10b981" },
  { label:"Employee Report",     icon:"employee", color:"#64748b" },
  { label:"Message Log",         icon:"message",  color:"#06b6d4" },
];

export default function ReportsPage() {
  const [dashData,    setDashData]    = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const u = JSON.parse(stored);
    fetch(`/api/admin/dashboard?schoolId=${u.schoolId}`)
      .then(r => r.json())
      .then(r => { if (r.success) setDashData(r.data); })
      .catch(console.error)
      .finally(() => setDashLoading(false));
  }, []);

  const v = (val: any) => dashLoading ? "..." : val;

  const statCards = [
    { label:"Total Students", value: v(dashData?.demographics?.total_students?.toLocaleString()), icon:"students", color:"#0ea5e9", bg:"linear-gradient(135deg,#e0f2fe,#bae6fd)" },
    { label:"Total Teachers", value: v(dashData?.demographics?.total_teachers?.toLocaleString()), icon:"teachers", color:"#f59e0b", bg:"linear-gradient(135deg,#fef3c7,#fde68a)" },
    { label:"Fee Collected",  value: v(formatCurrency(dashData?.finance?.total_collected ?? 0)),  icon:"fee",      color:"#10b981", bg:"linear-gradient(135deg,#d1fae5,#a7f3d0)" },
    { label:"Fee Pending",    value: v(formatCurrency(dashData?.finance?.total_pending   ?? 0)),  icon:"bell",     color:"#ef4444", bg:"linear-gradient(135deg,#fee2e2,#fecaca)" },
  ];

  return (
    <div style={{ padding:"24px 16px 8px" }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#0f172a" }}>Reports</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>School performance overview</div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {statCards.map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:20, padding:"18px 16px" }}>
            <div style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
              <IC name={c.icon} size={17} color={c.color} />
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:"#0f172a" }}>{c.value}</div>
            <div style={{ fontSize:10, fontWeight:700, color:"#475569", marginTop:3, textTransform:"uppercase", letterSpacing:0.5 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Reports */}
      <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Quick Reports</div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {QUICK_REPORTS.map(r => (
          <button key={r.label} style={{ background:"white", borderRadius:16, padding:"13px 15px", display:"flex", alignItems:"center", gap:13, border:"1px solid #f1f5f9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", cursor:"pointer" }}>
            <div style={{ width:38, height:38, borderRadius:12, background:r.color+"14", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IC name={r.icon} size={17} color={r.color} />
            </div>
            <span style={{ flex:1, fontSize:14, fontWeight:700, color:"#334155", textAlign:"left" }}>{r.label}</span>
            <IC name="chevron" size={15} color="#e2e8f0" />
          </button>
        ))}
      </div>
    </div>
  );
}