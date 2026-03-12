// FILE PATH: app/admin/modules/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────
interface Module {
  id:    string;
  label: string;
  icon:  string;
  color: string;
  grad:  [string, string];
  sub:   string[];
  pro?:  boolean;
}

// ── Modules Data ──────────────────────────────────────────────
const MODULES: Module[] = [
  { id:"frontdesk", label:"Front Desk",     icon:"frontdesk", color:"#6366f1", grad:["#6366f1","#8b5cf6"], sub:["General Enquiry","Admission Enquiry","Gate Pass","Visitor Log","Daily Register"] },
  { id:"students",  label:"Students",        icon:"students",  color:"#0ea5e9", grad:["#0ea5e9","#38bdf8"], sub:["Add Student","View Students","Admit Card","Transfer Certificate","Promote Class","Character Certificate"] },
  { id:"teachers",  label:"Teachers",        icon:"teachers",  color:"#f59e0b", grad:["#f59e0b","#fcd34d"], sub:["Add Teacher","Staff Directory","Assign Teacher","View Assigned","Attendance"] },
  { id:"idcard",    label:"ID Cards",        icon:"idcard",    color:"#8b5cf6", grad:["#8b5cf6","#a78bfa"], sub:["Student ID Card","Teacher ID Card","Generate Bulk","ID Card Template"] },
  { id:"fee",       label:"Fee Management",  icon:"fee",       color:"#10b981", grad:["#10b981","#34d399"], sub:["Fee Deposit","Fee Receipt","Fee Report","Fee Due","Collect Passout Fee","Fee Demand"] },
  { id:"school",    label:"School",          icon:"school",    color:"#ef4444", grad:["#ef4444","#f87171"], sub:["Add Class","Add Section","Add Subject","Assign Subject","Add Session","Upload Signature","Datesheet"] },
  { id:"accounts",  label:"Accounts",        icon:"accounts",  color:"#f97316", grad:["#f97316","#fb923c"], sub:["Expense","Income","Income & Expense","Bank Account","Vendor"], pro:true },
  { id:"exam",      label:"Exam & Result",   icon:"exam",      color:"#a855f7", grad:["#a855f7","#c084fc"], sub:["Add Exam Type","Add Datesheet","View Result","Add Result","Result Analysis"] },
  { id:"message",   label:"Messages",        icon:"message",   color:"#06b6d4", grad:["#06b6d4","#22d3ee"], sub:["Student Messages","Teacher Messages","Bulk SMS","WhatsApp Alert","Notice Board"] },
  { id:"employee",  label:"Employee",        icon:"employee",  color:"#64748b", grad:["#64748b","#94a3b8"], sub:["Add Employee","View Employees","Attendance","Salary","Departments"] },
  { id:"notif",     label:"Notifications",   icon:"notif",     color:"#ec4899", grad:["#ec4899","#f472b6"], sub:["Student Notifications","Teacher Notifications","Push Alerts","SMS Alerts"] },
  { id:"users",     label:"User Management", icon:"users",     color:"#0891b2", grad:["#0891b2","#22d3ee"], sub:["Register User","View Users","Roles & Permissions","Activity Log"] },
];

// ── Icon Component ────────────────────────────────────────────
function IC({ name, size = 20, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:color, strokeWidth:1.8, strokeLinecap:"round" as const, strokeLinejoin:"round" as const };
  const map: Record<string, React.ReactNode> = {
    frontdesk: <><path d="M3 12h18M3 6h18M3 18h12"/><circle cx="19" cy="18" r="2"/></>,
    students:  <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></>,
    teachers:  <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    idcard:    <><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8.5" cy="11" r="2.5"/><path d="M14 9h4M14 13h2"/></>,
    fee:       <><circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5-1.3 2-3 2-3 1.1-3 2.5S10.7 17 12 17s3-1.1 3-2.5"/><path d="M12 7v1M12 16v1"/></>,
    school:    <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    accounts:  <><path d="M2 3h6a4 4 0 010 8H2V3z"/><path d="M2 11h16M2 7h16"/><rect x="2" y="15" width="20" height="6" rx="1"/></>,
    exam:      <><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></>,
    message:   <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    employee:  <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    notif:     <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    users:     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    chevron:   <path d="M9 18l6-6-6-6"/>,
    back:      <path d="M15 18l-6-6 6-6"/>,
  };
  return <svg {...p}>{map[name] ?? map.school}</svg>;
}

// ── Sub Screen ────────────────────────────────────────────────
function SubScreen({ mod, onBack }: { mod: Module; onBack: () => void }) {
  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(140deg,${mod.grad[0]},${mod.grad[1]})`, padding:"52px 20px 32px", borderRadius:"0 0 32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.18)", border:"none", borderRadius:12, padding:"8px 14px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:20 }}>
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

      {/* Sub Items */}
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
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════
export default function ModulesPage() {
  const [openMod,      setOpenMod]      = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  if (activeModule) return <SubScreen mod={activeModule} onBack={() => setActiveModule(null)} />;

  return (
    <div style={{ padding:"24px 16px 8px" }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#0f172a" }}>All Modules</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{MODULES.length} modules available</div>
      </div>

      {/* Module List */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {MODULES.map(mod => (
          <div key={mod.id} style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #f1f5f9", boxShadow:"0 2px 8px rgba(0,0,0,0.03)" }}>

            {/* Row */}
            <button
              onClick={() => setOpenMod(openMod === mod.id ? null : mod.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"15px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}
            >
              <div style={{ width:46, height:46, borderRadius:15, background:`linear-gradient(135deg,${mod.grad[0]},${mod.grad[1]})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 12px ${mod.color}40` }}>
                <IC name={mod.icon} size={21} color="white" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#1e293b" }}>{mod.label}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{mod.sub.length} features</div>
              </div>
              {mod.pro && (
                <span style={{ fontSize:9, fontWeight:900, background:"#fef3c7", color:"#d97706", padding:"3px 8px", borderRadius:20, border:"1px solid #fde68a", marginRight:6 }}>PRO</span>
              )}
              <div style={{ transform:openMod === mod.id ? "rotate(90deg)" : "none", transition:"transform 0.25s" }}>
                <IC name="chevron" size={17} color="#cbd5e1" />
              </div>
            </button>

            {/* Expanded */}
            {openMod === mod.id && (
              <div style={{ borderTop:"1px solid #f8fafc", background:"#fafbff" }}>
                {mod.sub.map((s, i) => (
                  <button key={i} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:i < mod.sub.length - 1 ? "1px solid #f1f5f9" : "none", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:mod.color, flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:600, color:"#334155", flex:1 }}>{s}</span>
                    <IC name="chevron" size={13} color="#e2e8f0" />
                  </button>
                ))}
                {/* Open Full Module */}
                <button
                  onClick={() => setActiveModule(mod)}
                  style={{ width:"100%", padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:mod.color + "0e", border:"none", cursor:"pointer", borderTop:"1px solid #f1f5f9" }}
                >
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