// FILE PATH: app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminBottomNav from "@/app/components/AdminBottomNav";



// ═════════════════════════════════════════════════════════════
//  HELPERS
// ═════════════════════════════════════════════════════════════
const formatCurrency = (num: number) => {
  if (!num) return "₹0";
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)   return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString()}`;
};

// ── SVG Icons ─────────────────────────────────────────────────
const Svg = ({ children, size = 20, color }: { children: React.ReactNode; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IC = ({ name, size = 20, color }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    bell:      <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    back:      <path d="M15 18l-6-6 6-6"/>,
    chevron:   <path d="M9 18l6-6-6-6"/>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    logout:    <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    edit:      <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    shield:    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    location:  <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    phone:     <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>,
    mail:      <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    star:      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    notif:     <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    fee:       <><circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5-1.3 2-3 2-3 1.1-3 2.5S10.7 17 12 17s3-1.1 3-2.5"/><path d="M12 7v1M12 16v1"/></>,
    students:  <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></>,
    teachers:  <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    frontdesk: <><path d="M3 12h18M3 6h18M3 18h12"/><circle cx="19" cy="18" r="2"/></>,
    message:   <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    adduser:   <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="23" y2="8"/><line x1="21" y1="6" x2="21" y2="10"/></>,
    receipt:   <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></>,
    download:  <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    wallet:    <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    trending:  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    chart:     <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    exam:      <><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></>,
    employee:  <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    school:    <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    idcard:    <><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8.5" cy="11" r="2.5"/><path d="M14 9h4M14 13h2"/></>,
    accounts:  <><path d="M2 3h6a4 4 0 010 8H2V3z"/><path d="M2 11h16M2 7h16"/><rect x="2" y="15" width="20" height="6" rx="1"/></>,
    users:     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  };
  return <Svg size={size} color={color}>{icons[name] || icons.school}</Svg>;
};

// ═════════════════════════════════════════════════════════════
//  MODULES DATA
// ═════════════════════════════════════════════════════════════
const MODULES = [
  { id:"frontdesk", label:"Front Desk",    icon:"frontdesk", color:"#6366f1", grad:["#6366f1","#8b5cf6"], sub:["General Enquiry","Admission Enquiry","Gate Pass","Visitor Log","Daily Register"] },
  { id:"students",  label:"Students",       icon:"students",  color:"#0ea5e9", grad:["#0ea5e9","#38bdf8"], sub:["Add Student","View Students","Admit Card","Transfer Certificate","Promote Class","Character Certificate"] },
  { id:"teachers",  label:"Teachers",       icon:"teachers",  color:"#f59e0b", grad:["#f59e0b","#fcd34d"], sub:["Add Teacher","Staff Directory","Assign Teacher","View Assigned","Attendance"] },
  { id:"idcard",    label:"ID Cards",       icon:"idcard",    color:"#8b5cf6", grad:["#8b5cf6","#a78bfa"], sub:["Student ID Card","Teacher ID Card","Generate Bulk","ID Card Template"] },
  { id:"fee",       label:"Fee Management", icon:"fee",       color:"#10b981", grad:["#10b981","#34d399"], sub:["Fee Deposit","Fee Receipt","Fee Report","Fee Due","Collect Passout Fee","Fee Demand"] },
  { id:"school",    label:"School",         icon:"school",    color:"#ef4444", grad:["#ef4444","#f87171"], sub:["Add Class","Add Section","Add Subject","Assign Subject","Add Session","Datesheet"] },
  { id:"accounts",  label:"Accounts",       icon:"accounts",  color:"#f97316", grad:["#f97316","#fb923c"], sub:["Expense","Income","Income & Expense","Bank Account","Vendor"], pro:true },
  { id:"exam",      label:"Exam & Result",  icon:"exam",      color:"#a855f7", grad:["#a855f7","#c084fc"], sub:["Add Exam Type","Add Datesheet","View Result","Add Result","Result Analysis"] },
  { id:"message",   label:"Messages",       icon:"message",   color:"#06b6d4", grad:["#06b6d4","#22d3ee"], sub:["Student Messages","Teacher Messages","Bulk SMS","WhatsApp Alert","Notice Board"] },
  { id:"employee",  label:"Employee",       icon:"employee",  color:"#64748b", grad:["#64748b","#94a3b8"], sub:["Add Employee","View Employees","Attendance","Salary","Departments"] },
  { id:"notif",     label:"Notifications",  icon:"notif",     color:"#ec4899", grad:["#ec4899","#f472b6"], sub:["Student Notifications","Teacher Notifications","Push Alerts","SMS Alerts"] },
  { id:"users",     label:"User Management",icon:"users",     color:"#0891b2", grad:["#0891b2","#22d3ee"], sub:["Register User","View Users","Roles & Permissions","Activity Log"] },
];

// ═════════════════════════════════════════════════════════════
//  SUB SCREEN (Module detail)
// ═════════════════════════════════════════════════════════════
function SubScreen({ mod, onBack }: { mod: typeof MODULES[0]; onBack: () => void }) {
  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9" }}>
      <div style={{ background:`linear-gradient(140deg,${mod.grad[0]},${mod.grad[1]})`, padding:"52px 20px 32px", borderRadius:"0 0 32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.18)", border:"none", borderRadius:12, padding:"8px 14px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:20, backdropFilter:"blur(10px)" }}>
          <IC name="back" size={16} color="white" /> Back
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:16, background:"rgba(255,255,255,0.22)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IC name={mod.icon} size={26} color="white" />
          </div>
          <div>
            <div style={{ color:"white", fontSize:22, fontWeight:800 }}>{mod.label}</div>
            <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12, marginTop:2 }}>{mod.sub.length} features available</div>
          </div>
        </div>
      </div>
      <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {mod.sub.map((item, i) => (
          <button key={i} style={{ background:"white", border:"1px solid #f1f5f9", borderRadius:18, padding:"16px 18px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width:42, height:42, borderRadius:13, background:mod.color+"15", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <IC name={mod.icon} size={19} color={mod.color} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>{item}</div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{mod.label} Module</div>
            </div>
            <IC name="chevron" size={16} color="#cbd5e1" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  PROFILE DRAWER
// ═════════════════════════════════════════════════════════════
function ProfileDrawer({ onClose, school, onLogout }: any) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(4px)" }} />
      <div className="admin-slide-up" style={{ position:"relative", background:"white", borderRadius:"28px 28px 0 0", padding:"0 0 32px", boxShadow:"0 -20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"#e2e8f0" }} />
        </div>
        {/* School Card */}
        <div style={{ margin:"12px 20px 0", padding:"20px", borderRadius:20, background:"linear-gradient(135deg,#4f46e5,#7c3aed,#2563eb)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:56, height:56, borderRadius:18, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, color:"white", flexShrink:0, border:"2px solid rgba(255,255,255,0.3)" }}>{school.initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16, fontWeight:800, color:"white", lineHeight:1.2 }}>{school.name}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:3 }}>Admin • Master Access</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:6, background:"rgba(16,185,129,0.25)", borderRadius:20, padding:"3px 10px", border:"1px solid rgba(52,211,153,0.3)" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#34d399" }} />
                <span style={{ fontSize:10, color:"#6ee7b7", fontWeight:700 }}>Active • {school.plan} Plan</span>
              </div>
            </div>
          </div>
        </div>
        {/* Info rows */}
        <div style={{ margin:"16px 20px 0", background:"#f8fafc", borderRadius:18, overflow:"hidden", border:"1px solid #e2e8f0" }}>
          {[{ icon:"location", label:school.address },{ icon:"phone", label:school.phone },{ icon:"mail", label:school.email }].map((r, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderBottom:i<2?"1px solid #e2e8f0":"none" }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <IC name={r.icon} size={15} color="#7c3aed" />
              </div>
              <span style={{ fontSize:12, color:"#475569", fontWeight:500 }}>{r.label}</span>
            </div>
          ))}
        </div>
        {/* Options */}
        <div style={{ margin:"12px 20px 0", background:"white", borderRadius:18, overflow:"hidden", border:"1px solid #f1f5f9" }}>
          {[{ icon:"edit",label:"Edit School Profile",color:"#6366f1" },{ icon:"shield",label:"Security Settings",color:"#0ea5e9" },{ icon:"notif",label:"Notifications",color:"#f59e0b" },{ icon:"settings",label:"App Settings",color:"#64748b" }].map((o, i) => (
            <button key={i} style={{ width:"100%", display:"flex", alignItems:"center", gap:13, padding:"14px 16px", borderBottom:i<3?"1px solid #f8fafc":"none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:38, height:38, borderRadius:12, background:o.color+"12", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <IC name={o.icon} size={17} color={o.color} />
              </div>
              <span style={{ flex:1, fontSize:14, fontWeight:600, color:"#1e293b" }}>{o.label}</span>
              <IC name="chevron" size={15} color="#cbd5e1" />
            </button>
          ))}
        </div>
        {/* Logout */}
        <div style={{ margin:"12px 20px 0" }}>
          <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:13, padding:"15px 16px", background:"#fff1f2", borderRadius:16, border:"1px solid #fecdd3", cursor:"pointer" }}>
            <div style={{ width:38, height:38, borderRadius:12, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IC name="logout" size={17} color="#ef4444" />
            </div>
            <span style={{ flex:1, fontSize:14, fontWeight:700, color:"#ef4444" }}>Logout / Terminate Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
//  TAB: HOME
// ═════════════════════════════════════════════════════════════
function HomeTab({ SCHOOL, dashData, dashLoading, time, notifCount, setShowProfile, router }: any) {
  const [searchQ, setSearchQ]           = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDrop, setShowDrop]         = useState(false);
  const searchRef   = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearchQ(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setSearchResults([]); setShowDrop(false); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res  = await fetch(`/api/admin/search?schoolId=${SCHOOL.schoolId}&q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success) { setSearchResults(json.data || []); setShowDrop(true); }
      } catch {}
      finally { setSearchLoading(false); }
    }, 350);
  }, [SCHOOL]);

  const greet = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning ☀️";
    if (h < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const present = dashData?.today?.attendance?.present ?? 0;
  const absent  = dashData?.today?.attendance?.absent  ?? 0;
  const total   = present + absent;
  const attPct  = total > 0 ? Math.round((present / total) * 100) : 0;
  const colPct  = dashData?.finance?.collection_percentage ?? 0;

  return (
    
    <div>
      {/* ── HERO ── */}
      <div style={{ background:"linear-gradient(150deg,#0f172a 0%,#1e1b4b 45%,#1d4ed8 100%)", padding:"48px 18px 0", position:"relative", overflow:"hidden", borderRadius:"0 0 32px 32px" }}>
        <div style={{ position:"absolute", top:-70, right:-50, width:220, height:220, borderRadius:"50%", background:"rgba(99,102,241,0.2)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:50, left:-40, width:140, height:140, borderRadius:"50%", background:"rgba(29,78,216,0.18)", pointerEvents:"none" }} />

        {/* top bar */}
        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <div style={{ fontSize:10, color:"#a5b4fc", fontWeight:700, letterSpacing:2, textTransform:"uppercase" }}>{greet()}</div>
            <div style={{ fontSize:18, fontWeight:900, color:"white", marginTop:3 }}>{SCHOOL.name}</div>
            <div style={{ fontSize:11, color:"#818cf8", marginTop:2 }}>{SCHOOL.userName} • Admin</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setShowProfile(true)} style={{ width:40, height:40, borderRadius:13, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.16)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <span style={{ fontSize:13, fontWeight:900, color:"white" }}>{SCHOOL.initials}</span>
            </button>
            <button style={{ width:40, height:40, borderRadius:13, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.16)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
              <IC name="bell" size={17} color="white" />
              <span style={{ position:"absolute", top:-3, right:-3, width:16, height:16, background:"#ef4444", borderRadius:"50%", border:"2px solid #0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:900, color:"white" }}>{notifCount}</span>
            </button>
          </div>
        </div>

        {/* session pill */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.08)", borderRadius:40, padding:"7px 18px 7px 10px", border:"1px solid rgba(255,255,255,0.15)", backdropFilter:"blur(12px)" }}>
            <div style={{ position:"relative", width:28, height:28 }}>
              <div className="admin-spin-slow" style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#a5b4fc", borderRightColor:"#818cf8" }} />
              <div style={{ position:"absolute", inset:3, borderRadius:"50%", background:"rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <IC name="clock" size={13} color="#c7d2fe" />
              </div>
            </div>
            <div>
              <div style={{ fontSize:9, color:"#818cf8", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>Active Session</div>
              <div style={{ fontSize:13, fontWeight:900, color:"white" }}>{dashLoading ? "Loading..." : (dashData?.session_year ?? "N/A")}</div>
            </div>
            <div style={{ width:1, height:24, background:"rgba(255,255,255,0.12)" }} />
            <div>
              <div style={{ fontSize:9, color:"#818cf8", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>Students</div>
              <div style={{ fontSize:13, fontWeight:900, color:"#60a5fa" }}>{dashLoading ? "..." : (dashData?.demographics?.total_students?.toLocaleString() ?? "0")}</div>
            </div>
          </div>
        </div>

        {/* 3 stat tiles */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:22 }}>
          {[
            { label:"Collection", value:dashLoading?"...":formatCurrency(dashData?.finance?.total_collected), color:"#34d399", sub:"Total" },
            { label:"Attendance", value:dashLoading?"...":`${attPct}%`, color:"#fbbf24", sub:`${present}P / ${absent}A` },
            { label:"Teachers",   value:dashLoading?"...":(dashData?.demographics?.total_teachers ?? 0), color:"#f472b6", sub:"Active" },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.07)", borderRadius:16, padding:"12px 10px", border:"1px solid rgba(255,255,255,0.1)", textAlign:"center" }}>
              <div style={{ fontSize:15, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginTop:3 }}>{s.label}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <svg viewBox="0 0 390 24" style={{ display:"block", marginBottom:-1 }}>
          <path d="M0 24 C97.5 0 292.5 0 390 24 L390 24 L0 24Z" fill="#f1f5f9" />
        </svg>
      </div>

      {/* ── SEARCH ── */}
      <div ref={searchRef} style={{ margin:"16px 16px 0", position:"relative", zIndex:60 }}>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
            <IC name="search" size={16} color="#94a3b8" />
          </div>
          {searchLoading && (
            <div style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)" }}>
              <div className="admin-spin" style={{ width:15, height:15, border:"2px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%" }} />
            </div>
          )}
          <input value={searchQ} onChange={e => handleSearch(e.target.value)} onFocus={() => searchResults.length > 0 && setShowDrop(true)}
            placeholder="Student naam, folio ya mobile se khojo..."
            style={{ width:"100%", padding:"12px 40px 12px 40px", background:"white", border:"1.5px solid #e2e8f0", borderRadius:14, fontSize:13, fontWeight:500, color:"#1e293b", outline:"none", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}
          />
        </div>
        {showDrop && searchResults.length > 0 && (
          <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"white", borderRadius:16, border:"1px solid #e2e8f0", boxShadow:"0 16px 40px rgba(0,0,0,0.12)", maxHeight:320, overflowY:"auto", zIndex:100 }}>
            {searchResults.map((s: any) => (
              <div key={s.id} onClick={() => { router.push(`/admin/dashboard/students/${s.id}`); setShowDrop(false); setSearchQ(""); }}
                style={{ padding:"10px 14px", borderTop:"1px solid #f8fafc", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:14, fontWeight:900, color:"white" }}>{s.name?.charAt(0)}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>{s.name}</div>
                  <div style={{ fontSize:10, color:"#64748b" }}>{s.class_name} • {s.section_name} • #{s.folio_no}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <button onClick={e => { e.stopPropagation(); router.push(`/admin/dashboard/fee?studentId=${s.id}`); setShowDrop(false); }}
                    style={{ padding:"4px 8px", background:"#d1fae5", borderRadius:7, border:"none", fontSize:9, fontWeight:800, color:"#065f46", cursor:"pointer" }}>FEE</button>
                  <button onClick={e => { e.stopPropagation(); router.push(`/admin/dashboard/students/${s.id}/edit`); setShowDrop(false); }}
                    style={{ padding:"4px 8px", background:"#fef3c7", borderRadius:7, border:"none", fontSize:9, fontWeight:800, color:"#92400e", cursor:"pointer" }}>EDIT</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {showDrop && !searchLoading && searchQ.length >= 2 && searchResults.length === 0 && (
          <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"white", borderRadius:14, border:"1px solid #e2e8f0", padding:"16px", textAlign:"center", zIndex:100 }}>
            <p style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>Koi student nahi mila 😕</p>
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ padding:"18px 16px 0" }}>
        <div style={{ fontSize:9, color:"#94a3b8", fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Quick Actions</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[
            { l1:"Session",  l2:dashData?.session_year??"N/A", icon:"clock",    grad:["#10b981","#059669"], bg:"linear-gradient(135deg,#ecfdf5,#d1fae5)", border:"#a7f3d0", c1:"#065f46", c2:"#047857", path:"/admin/sessions" },
            { l1:"New",      l2:"Admission",                   icon:"adduser",  grad:["#3b82f6","#1d4ed8"], bg:"linear-gradient(135deg,#eff6ff,#dbeafe)", border:"#bfdbfe", c1:"#1e3a8a", c2:"#1d4ed8", path:"/admin/new_admission" },
            { l1:"Fee",      l2:"Deposit",                     icon:"fee",      grad:["#22c55e","#15803d"], bg:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"#86efac", c1:"#14532d", c2:"#15803d", path:"/admin/fee/deposit" },
            { l1:"Search",   l2:"Slip",                        icon:"receipt",  grad:["#a855f7","#7c3aed"], bg:"linear-gradient(135deg,#fdf4ff,#fae8ff)", border:"#e9d5ff", c1:"#581c87", c2:"#7c3aed", path:"/admin/fee/search-slip" },
            { l1:"Download", l2:"Data",                        icon:"download", grad:["#f97316","#c2410c"], bg:"linear-gradient(135deg,#fff7ed,#ffedd5)", border:"#fed7aa", c1:"#7c2d12", c2:"#c2410c", path:"/admin/download" },
            { l1:"WA",       l2:"Balance",                     icon:"wallet",   grad:["#0ea5e9","#0369a1"], bg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)", border:"#bae6fd", c1:"#0c4a6e", c2:"#0369a1", path:"/admin/balance" },
          ].map((q, i) => (
            <div key={i} onClick={() => router.push(q.path)} style={{ background:q.bg, borderRadius:20, padding:"14px 10px 12px", border:`1px solid ${q.border}`, display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-15, right:-15, width:50, height:50, borderRadius:"50%", background:"rgba(0,0,0,0.04)" }} />
              <div style={{ width:42, height:42, borderRadius:14, background:`linear-gradient(135deg,${q.grad[0]},${q.grad[1]})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 3px 10px ${q.grad[0]}60` }}>
                <IC name={q.icon} size={18} color="white" />
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:8, fontWeight:800, color:q.c1, textTransform:"uppercase", letterSpacing:0.8 }}>{q.l1}</div>
                <div style={{ fontSize:11, fontWeight:900, color:q.c2, marginTop:1 }}>{q.l2}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
{/* ── MODULE SHORTCUTS ── */}
<div style={{ padding:"20px 16px 0" }}>
  <div style={{
    fontSize:9,
    color:"#94a3b8",
    fontWeight:800,
    letterSpacing:2,
    textTransform:"uppercase",
    marginBottom:14
  }}>
    Modules
  </div>

  <div style={{
    display:"grid",
    gridTemplateColumns:"repeat(4,1fr)",
    gap:14
  }}>

    {[
      { label:"Students", icon:"students", path:"/admin/students", color:"#6366f1", bg:"#ede9fe" },
      { label:"Teachers", icon:"teachers", path:"/admin/teachers", color:"#0ea5e9", bg:"#e0f2fe" },
      { label:"Fee", icon:"fee", path:"/admin/fee", color:"#10b981", bg:"#d1fae5" },
      { label:"Receipt", icon:"receipt", path:"/admin/fee/search-slip", color:"#f59e0b", bg:"#fef3c7" },
      { label:"Attendance", icon:"clock", path:"/admin/attendance", color:"#8b5cf6", bg:"#f3e8ff" },
      { label:"Messages", icon:"message", path:"/admin/messages", color:"#06b6d4", bg:"#cffafe" },
      { label:"Reports", icon:"chart", path:"/admin/reports", color:"#ef4444", bg:"#fee2e2" },
      { label:"Accounts", icon:"accounts", path:"/admin/accounts", color:"#f97316", bg:"#ffedd5" },
    ].map((m,i)=>(
      <div
        key={i}
        onClick={()=>router.push(m.path)}
        style={{
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          gap:6,
          cursor:"pointer"
        }}
      >

        <div style={{
          width:52,
          height:52,
          borderRadius:18,
          background:m.bg,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          border:`1px solid ${m.color}25`
        }}>
          <IC name={m.icon} size={22} color={m.color}/>
        </div>

        <span style={{
          fontSize:11,
          fontWeight:700,
          color:"#334155"
        }}>
          {m.label}
        </span>

      </div>
    ))}

  </div>
</div>
      {/* ── AAJ KA HISAAB ── */}
      <div style={{ padding:"18px 16px 0" }}>
        <div style={{ fontSize:9, color:"#94a3b8", fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Aaj Ka Hisaab</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
          {[
            { label:"Fee Aaj", value:formatCurrency(dashData?.today?.fee??0),     ic:"fee",      bg:"#d1fae5", c:"#059669" },
            { label:"Income",  value:formatCurrency(dashData?.today?.income??0),  ic:"trending", bg:"#dbeafe", c:"#1d4ed8" },
            { label:"Kharcha", value:formatCurrency(dashData?.today?.expense??0), ic:"wallet",   bg:"#fee2e2", c:"#dc2626" },
          ].map(c => (
            <div key={c.label} style={{ background:"white", borderRadius:16, padding:"12px 8px", border:"1px solid #f1f5f9", textAlign:"center" }}>
              <div style={{ width:30, height:30, borderRadius:10, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 7px" }}>
                <IC name={c.ic} size={14} color={c.c} />
              </div>
              <div style={{ fontSize:13, fontWeight:900, color:"#0f172a" }}>{dashLoading?"...":c.value}</div>
              <div style={{ fontSize:8, fontWeight:700, color:"#94a3b8", marginTop:2, textTransform:"uppercase", letterSpacing:0.8 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance bar */}
        <div style={{ background:"white", borderRadius:16, padding:"13px 14px", border:"1px solid #f1f5f9", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:1 }}>Attendance Aaj</span>
            <span style={{ fontSize:13, fontWeight:900, color:attPct>=75?"#10b981":"#ef4444" }}>{dashLoading?"...":attPct+"%"}</span>
          </div>
          <div style={{ display:"flex", gap:14, marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981" }} /><span style={{ fontSize:11, fontWeight:700, color:"#10b981" }}>{present} Present</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444" }} /><span style={{ fontSize:11, fontWeight:700, color:"#ef4444" }}>{absent} Absent</span></div>
          </div>
          <div style={{ width:"100%", height:6, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:10, background:"linear-gradient(90deg,#10b981,#34d399)", width:`${attPct}%`, transition:"width 1.2s ease" }} />
          </div>
        </div>
      </div>

      {/* ── FEE KA HISAAB ── */}
      <div style={{ padding:"0 16px 0" }}>
        <div style={{ fontSize:9, color:"#94a3b8", fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Fee Ka Hisaab</div>
        <div style={{ background:"white", borderRadius:18, padding:"14px", border:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:10, fontWeight:700, color:"#64748b" }}>Collection Progress</span>
            <span style={{ fontSize:12, fontWeight:900, color:"#4f46e5" }}>{dashLoading?"...":colPct+"%"}</span>
          </div>
          <div style={{ width:"100%", height:7, background:"#f1f5f9", borderRadius:10, overflow:"hidden", marginBottom:12 }}>
            <div style={{ height:"100%", borderRadius:10, background:"linear-gradient(90deg,#4f46e5,#7c3aed)", width:`${colPct}%`, transition:"width 1.2s ease" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {[
              { label:"Expected",  value:formatCurrency(dashData?.finance?.total_expected??0),  bg:"#eff6ff", c:"#2563eb" },
              { label:"Collected", value:formatCurrency(dashData?.finance?.total_collected??0), bg:"#f0fdf4", c:"#16a34a" },
              { label:"Pending",   value:formatCurrency(dashData?.finance?.total_pending??0),   bg:"#fff1f2", c:"#dc2626" },
            ].map(f => (
              <div key={f.label} style={{ background:f.bg, borderRadius:12, padding:"9px 6px", textAlign:"center" }}>
                <div style={{ fontSize:12, fontWeight:900, color:f.c }}>{dashLoading?"...":f.value}</div>
                <div style={{ fontSize:7, fontWeight:800, color:f.c+"99", marginTop:2, textTransform:"uppercase", letterSpacing:1 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── OVERVIEW PILLS ── */}
      <div style={{ padding:"18px 16px 0" }}>
        <div style={{ fontSize:9, color:"#94a3b8", fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>School Overview</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[
            { label:"Students", value:dashData?.demographics?.total_students??0, color:"#6366f1", bg:"#ede9fe" },
            { label:"Teachers", value:dashData?.demographics?.total_teachers??0, color:"#0ea5e9", bg:"#e0f2fe" },
            { label:"Boys",     value:dashData?.demographics?.boys??0,           color:"#10b981", bg:"#d1fae5" },
            { label:"Girls",    value:dashData?.demographics?.girls??0,          color:"#ec4899", bg:"#fce7f3" },
            { label:"Active",   value:dashData?.demographics?.active_users??0,   color:"#f59e0b", bg:"#fef3c7" },
          ].map(p => (
            <div key={p.label} style={{ display:"flex", alignItems:"center", gap:6, background:p.bg, borderRadius:20, padding:"6px 12px", border:`1px solid ${p.color}25` }}>
              <span style={{ fontSize:13, fontWeight:900, color:p.color }}>{dashLoading?"...":p.value}</span>
              <span style={{ fontSize:10, fontWeight:700, color:p.color+"bb" }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div style={{ padding:"18px 16px 16px" }}>
        <div style={{ fontSize:9, color:"#94a3b8", fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Recent Activity</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { icon:"fee",       color:"#10b981", title:"Fee Collected",    sub:dashLoading?"Sync ho raha hai...":formatCurrency(dashData?.today?.fee??0)+" Today", time:"Live" },
            { icon:"students",  color:"#6366f1", title:"New Admission",    sub:"Rahul Sharma — Class 6B",   time:"10:15 AM" },
            { icon:"frontdesk", color:"#f59e0b", title:"Gate Pass Issued", sub:"Pass #GP-2024-1089",        time:"11:00 AM" },
            { icon:"notif",     color:"#ef4444", title:"Fee Due Alert",    sub:"23 students pending",       time:"12:30 PM" },
          ].map(a => (
            <div key={a.title} style={{ background:"white", borderRadius:16, padding:"11px 13px", display:"flex", alignItems:"center", gap:11, border:"1px solid #f1f5f9" }}>
              <div style={{ width:38, height:38, borderRadius:13, background:a.color+"14", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <IC name={a.icon} size={17} color={a.color} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>{a.title}</div>
                <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{a.sub}</div>
              </div>
              <div style={{ fontSize:9, color:"#cbd5e1", fontWeight:700 }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  TAB: MODULES
// ═════════════════════════════════════════════════════════════
function ModulesTab({ setActiveModule, openMod, setOpenMod }: any) {
  return (
    <div style={{ padding:"24px 16px 8px" }}>
      <div style={{ fontSize:22, fontWeight:900, color:"#0f172a", marginBottom:4 }}>All Modules</div>
      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:20 }}>{MODULES.length} modules • Tap to expand</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {MODULES.map(mod => (
          <div key={mod.id} style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #f1f5f9" }}>
            <button onClick={() => setOpenMod(openMod === mod.id ? null : mod.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"15px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:46, height:46, borderRadius:15, background:`linear-gradient(135deg,${mod.grad[0]},${mod.grad[1]})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 12px ${mod.color}40` }}>
                <IC name={mod.icon} size={21} color="white" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#1e293b" }}>{mod.label}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{mod.sub.length} features</div>
              </div>
              {mod.pro && <span style={{ fontSize:9, fontWeight:900, background:"#fef3c7", color:"#d97706", padding:"3px 8px", borderRadius:20, border:"1px solid #fde68a", marginRight:6 }}>PRO</span>}
              <div style={{ transform:openMod===mod.id?"rotate(90deg)":"none", transition:"transform 0.25s" }}>
                <IC name="chevron" size={17} color="#cbd5e1" />
              </div>
            </button>
            {openMod === mod.id && (
              <div style={{ borderTop:"1px solid #f8fafc", background:"#fafbff" }}>
                {mod.sub.map((s, i) => (
                  <button key={i} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:i<mod.sub.length-1?"1px solid #f1f5f9":"none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:mod.color, flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:600, color:"#334155", flex:1 }}>{s}</span>
                    <IC name="chevron" size={13} color="#e2e8f0" />
                  </button>
                ))}
                <button onClick={() => setActiveModule(mod)} style={{ width:"100%", padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:mod.color+"0e", border:"none", cursor:"pointer", borderTop:"1px solid #f1f5f9" }}>
                  <span style={{ fontSize:12, fontWeight:900, color:mod.color, letterSpacing:0.5 }}>OPEN FULL MODULE</span>
                  <IC name="chevron" size={14} color={mod.color} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  TAB: REPORTS
// ═════════════════════════════════════════════════════════════
function ReportsTab({ dashData, dashLoading }: any) {
  const reportIcons  = ["chart","bell","teachers","exam","fee","employee","message"];
  const reportColors = ["#6366f1","#ef4444","#0ea5e9","#8b5cf6","#10b981","#64748b","#06b6d4"];
  return (
    <div style={{ padding:"24px 16px 8px" }}>
      <div style={{ fontSize:22, fontWeight:900, color:"#0f172a", marginBottom:4 }}>Reports</div>
      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:20 }}>School performance overview</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {[
          { label:"Total Students", value:dashData?dashData.demographics?.total_students?.toLocaleString():"...", icon:"students", color:"#0ea5e9", bg:"linear-gradient(135deg,#e0f2fe,#bae6fd)" },
          { label:"Total Teachers", value:dashData?dashData.demographics?.total_teachers?.toLocaleString():"...", icon:"teachers", color:"#f59e0b", bg:"linear-gradient(135deg,#fef3c7,#fde68a)" },
          { label:"Fee Collected",  value:dashData?formatCurrency(dashData.finance?.total_collected):"...",       icon:"fee",      color:"#10b981", bg:"linear-gradient(135deg,#d1fae5,#a7f3d0)" },
          { label:"Fee Pending",    value:dashData?formatCurrency(dashData.finance?.total_pending):"...",         icon:"bell",     color:"#ef4444", bg:"linear-gradient(135deg,#fee2e2,#fecaca)" },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:20, padding:"18px 16px" }}>
            <div style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
              <IC name={c.icon} size={17} color={c.color} />
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:"#0f172a" }}>{dashLoading?"...":c.value}</div>
            <div style={{ fontSize:10, fontWeight:700, color:"#475569", marginTop:3, textTransform:"uppercase", letterSpacing:0.5 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {["Fee Report Wise","Fee Due Report","Attendance Report","Result Analysis","Total Fee Collected","Employee Report","Message Log"].map((r, i) => (
          <button key={r} style={{ background:"white", borderRadius:16, padding:"13px 15px", display:"flex", alignItems:"center", gap:13, border:"1px solid #f1f5f9", cursor:"pointer" }}>
            <div style={{ width:38, height:38, borderRadius:12, background:reportColors[i]+"14", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IC name={reportIcons[i]} size={17} color={reportColors[i]} />
            </div>
            <span style={{ flex:1, fontSize:14, fontWeight:700, color:"#334155", textAlign:"left" }}>{r}</span>
            <IC name="chevron" size={15} color="#e2e8f0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  TAB: PROFILE
// ═════════════════════════════════════════════════════════════
function ProfileTab({ SCHOOL, onLogout }: any) {
  return (
    <div style={{ paddingBottom:8 }}>
      <div style={{ background:"linear-gradient(145deg,#1e1b4b,#4f46e5,#7c3aed)", padding:"52px 20px 36px", borderRadius:"0 0 32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ width:72, height:72, borderRadius:24, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"white", border:"2px solid rgba(255,255,255,0.3)", marginBottom:12 }}>{SCHOOL.initials}</div>
          <div style={{ fontSize:18, fontWeight:900, color:"white" }}>{SCHOOL.name}</div>
          <div style={{ fontSize:11, color:"#a5b4fc", marginTop:4 }}>{SCHOOL.email}</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10, background:"rgba(16,185,129,0.2)", borderRadius:20, padding:"4px 14px", border:"1px solid rgba(52,211,153,0.3)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#34d399" }} />
            <span style={{ fontSize:11, color:"#6ee7b7", fontWeight:700 }}>Active • {SCHOOL.plan} Plan</span>
          </div>
        </div>
      </div>
      <div style={{ padding:"20px 16px 0" }}>
        <div style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #f1f5f9", marginBottom:14 }}>
          {[
            { label:"School Name", value:SCHOOL.name,    icon:"school"   },
            { label:"Address",     value:SCHOOL.address, icon:"location" },
            { label:"Phone",       value:SCHOOL.phone,   icon:"phone"    },
            { label:"Email",       value:SCHOOL.email,   icon:"mail"     },
            { label:"School Code", value:SCHOOL.code,    icon:"idcard"   },
            { label:"Plan Status", value:`${SCHOOL.plan} (Active)`, icon:"star", highlight:true },
          ].map((f, i) => (
            <div key={f.label} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"13px 16px", borderBottom:i<5?"1px solid #f8fafc":"none" }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                <IC name={f.icon} size={14} color={f.highlight?"#f59e0b":"#64748b"} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:f.highlight?"#d97706":"#334155", marginTop:2 }}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #f1f5f9", marginBottom:14 }}>
          {[{ icon:"edit",label:"Edit Profile",color:"#6366f1"},{icon:"shield",label:"Security & Password",color:"#0ea5e9"},{icon:"notif",label:"Notifications",color:"#f59e0b"},{icon:"settings",label:"App Settings",color:"#64748b"}].map((o, i) => (
            <button key={o.label} style={{ width:"100%", display:"flex", alignItems:"center", gap:13, padding:"15px 16px", borderBottom:i<3?"1px solid #f8fafc":"none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:40, height:40, borderRadius:13, background:o.color+"12", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <IC name={o.icon} size={18} color={o.color} />
              </div>
              <span style={{ flex:1, fontSize:14, fontWeight:600, color:"#334155" }}>{o.label}</span>
              <IC name="chevron" size={15} color="#e2e8f0" />
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:13, padding:"16px", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:18, cursor:"pointer" }}>
          <div style={{ width:40, height:40, borderRadius:13, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IC name="logout" size={18} color="#ef4444" />
          </div>
          <span style={{ flex:1, fontSize:14, fontWeight:800, color:"#ef4444", textAlign:"left" }}>Logout / Terminate Session</span>
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  MAIN PAGE EXPORT
// ═════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab,    setActiveTab]    = useState("home");
  const [activeModule, setActiveModule] = useState<typeof MODULES[0] | null>(null);
  const [showProfile,  setShowProfile]  = useState(false);
  const [openMod,      setOpenMod]      = useState<string | null>(null);
  const [time,         setTime]         = useState(new Date());
  const [notifCount]                    = useState(5);
  const [user,         setUser]         = useState<any>(null);
  const [dashData,     setDashData]     = useState<any>(null);
  const [dashLoading,  setDashLoading]  = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin") { router.push(`/${u.role}/dashboard`); return; }
    setUser(u);
    fetch(`/api/admin/dashboard?schoolId=${u.schoolId}`)
      .then(r => r.json())
      .then(r => { if (r.success) setDashData(r.data); })
      .catch(console.error)
      .finally(() => setDashLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const SCHOOL = {
    name:     user?.schoolName || "School Name",
    email:    user?.email      || "admin@school.edu.in",
    phone:    user?.phone      || "+91 00000 00000",
    address:  user?.address    || "School Address",
    code:     user?.schoolCode || "SCH-000",
    plan:     user?.plan       || "Active",
    initials: (user?.schoolName || "SC").substring(0, 2).toUpperCase(),
    userName: user?.name       || "Admin",
    schoolId: user?.schoolId,
  };

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/"); };

  // SubScreen takes over full page
  if (activeModule) return <SubScreen mod={activeModule} onBack={() => setActiveModule(null)} />;

  return (
    <>
      {activeTab === "home"    && <HomeTab    SCHOOL={SCHOOL} dashData={dashData} dashLoading={dashLoading} time={time} notifCount={notifCount} setShowProfile={setShowProfile} router={router} />}
      {activeTab === "modules" && <ModulesTab setActiveModule={setActiveModule} openMod={openMod} setOpenMod={setOpenMod} />}
      {activeTab === "reports" && <ReportsTab dashData={dashData} dashLoading={dashLoading} />}
      {activeTab === "profile" && <ProfileTab SCHOOL={SCHOOL} onLogout={handleLogout} />}

      {/* FAB — only on home */}
      {activeTab === "home" && (
        <button style={{ position:"fixed", bottom:100, right:20, width:52, height:52, borderRadius:17, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 8px 28px rgba(79,70,229,0.5)", zIndex:50 }}>
          <IC name="plus" size={24} color="white" />
        </button>
      )}

      {/* BottomNav */}
      <AdminBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Profile Drawer */}
      {showProfile && <ProfileDrawer onClose={() => setShowProfile(false)} school={SCHOOL} onLogout={handleLogout} />}
    </>
  );
}