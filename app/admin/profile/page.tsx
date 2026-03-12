// FILE PATH: app/admin/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function IC({ name, size = 20, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:color, strokeWidth:1.8, strokeLinecap:"round" as const, strokeLinejoin:"round" as const };
  const map: Record<string, React.ReactNode> = {
    school:   <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    location: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    phone:    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>,
    mail:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    idcard:   <><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8.5" cy="11" r="2.5"/><path d="M14 9h4M14 13h2"/></>,
    star:     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    edit:     <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    notif:    <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    logout:   <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    chevron:  <path d="M9 18l6-6-6-6"/>,
  };
  return <svg {...p}>{map[name] ?? map.school}</svg>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/"); return; }
    setUser(JSON.parse(stored));
  }, []);

  const SCHOOL = {
    name:     user?.schoolName || "School Name",
    email:    user?.email      || "admin@school.edu.in",
    phone:    user?.phone      || "+91 00000 00000",
    address:  user?.address    || "School Address",
    code:     user?.schoolCode || "SCH-000",
    plan:     user?.plan       || "Active",
    initials: (user?.schoolName || "SC").substring(0, 2).toUpperCase(),
  };

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/"); };

  const infoFields = [
    { label:"School Name", value:SCHOOL.name,    icon:"school"   },
    { label:"Address",     value:SCHOOL.address, icon:"location" },
    { label:"Phone",       value:SCHOOL.phone,   icon:"phone"    },
    { label:"Email",       value:SCHOOL.email,   icon:"mail"     },
    { label:"School Code", value:SCHOOL.code,    icon:"idcard"   },
    { label:"Plan Status", value:`${SCHOOL.plan} (Active)`, icon:"star", highlight:true },
  ];

  const menuItems = [
    { icon:"edit",     label:"Edit Profile",        color:"#6366f1" },
    { icon:"shield",   label:"Security & Password", color:"#0ea5e9" },
    { icon:"notif",    label:"Notifications",       color:"#f59e0b" },
    { icon:"settings", label:"App Settings",        color:"#64748b" },
  ];

  return (
    <div style={{ paddingBottom:8 }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(145deg,#1e1b4b,#4f46e5,#7c3aed)", padding:"52px 20px 36px", borderRadius:"0 0 32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ width:72, height:72, borderRadius:24, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"white", border:"2px solid rgba(255,255,255,0.3)", marginBottom:12 }}>
            {SCHOOL.initials}
          </div>
          <div style={{ fontSize:18, fontWeight:900, color:"white" }}>{SCHOOL.name}</div>
          <div style={{ fontSize:11, color:"#a5b4fc", marginTop:4 }}>{SCHOOL.email}</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10, background:"rgba(16,185,129,0.2)", borderRadius:20, padding:"4px 14px", border:"1px solid rgba(52,211,153,0.3)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#34d399" }} />
            <span style={{ fontSize:11, color:"#6ee7b7", fontWeight:700 }}>Active • {SCHOOL.plan} Plan</span>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 16px 0" }}>

        {/* School Info */}
        <div style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #f1f5f9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", marginBottom:14 }}>
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #f8fafc" }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:1.5 }}>School Information</div>
          </div>
          {infoFields.map((f, i) => (
            <div key={f.label} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"13px 16px", borderBottom:i < infoFields.length - 1 ? "1px solid #f8fafc" : "none" }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                <IC name={f.icon} size={14} color={"highlight" in f && f.highlight ? "#f59e0b" : "#64748b"} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"highlight" in f && f.highlight ? "#d97706" : "#334155", marginTop:2, lineHeight:1.4 }}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #f1f5f9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", marginBottom:14 }}>
          {menuItems.map((o, i) => (
            <button key={o.label} style={{ width:"100%", display:"flex", alignItems:"center", gap:13, padding:"15px 16px", borderBottom:i < menuItems.length - 1 ? "1px solid #f8fafc" : "none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:40, height:40, borderRadius:13, background:o.color+"12", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <IC name={o.icon} size={18} color={o.color} />
              </div>
              <span style={{ flex:1, fontSize:14, fontWeight:600, color:"#334155" }}>{o.label}</span>
              <IC name="chevron" size={15} color="#e2e8f0" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:13, padding:"16px", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:18, cursor:"pointer" }}>
          <div style={{ width:40, height:40, borderRadius:13, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IC name="logout" size={18} color="#ef4444" />
          </div>
          <span style={{ flex:1, fontSize:14, fontWeight:800, color:"#ef4444", textAlign:"left" }}>Logout / Terminate Session</span>
        </button>
      </div>
    </div>
  );
}