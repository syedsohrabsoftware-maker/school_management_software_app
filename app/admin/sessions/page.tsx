"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Session {
  id: number;
  schoolId: number;
  session_year?: string;
  sessionYear?: string;
  isActive?: boolean;
  is_active?: boolean;
}

const IC = {
  Back: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Plus: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [user, setUser] = useState<any>(null);
  const [addYear, setAddYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/"); return; }
    setUser(JSON.parse(stored));
    load(JSON.parse(stored).schoolId);
  }, []);

  const load = async (schoolId: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/sessions?schoolId=${schoolId}`);
      const j = await r.json();
      if (j.success) setSessions(j.data || []);
    } catch { console.error("Load failed"); }
    finally { setLoading(false); }
  };

  const handleAction = async (body: object) => {
    const r = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId: user.schoolId, ...body }),
    });
    const j = await r.json();
    if (j.success) load(user.schoolId);
    return j.success;
  };

  return (
    <div className="min-h-screen bg-[#F2F5F9] font-sans text-slate-900 pb-20">
      
      {/* ── NATIVE HEADER ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 active:bg-slate-100 rounded-full transition-colors">
            <IC.Back />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Sessions</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {sessions.length}
        </div>
      </div>

      <div className="max-w-[430px] mx-auto p-4 space-y-6">
        
        {/* ── ADD INPUT AREA ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <p className="text-[11px] font-black text-slate-400 mb-3 tracking-widest uppercase px-1">Create New Session</p>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 focus-within:border-indigo-300 transition-all">
            <div className="pl-3 text-slate-400">
                <IC.Calendar />
            </div>
            <input 
              value={addYear}
              onChange={(e) => setAddYear(e.target.value)}
              placeholder="e.g. 2026-2027"
              className="flex-1 bg-transparent py-2.5 px-2 font-semibold text-slate-700 outline-none placeholder:text-slate-300"
            />
            <button 
              onClick={async () => {
                if(addYear && await handleAction({ action: 'create', session_year: addYear })) setAddYear("");
              }}
              className="bg-indigo-600 text-white h-11 px-5 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-md shadow-indigo-100"
            >
              ADD
            </button>
          </div>
        </div>

        {/* ── SESSION LIST ── */}
        <div className="space-y-3">
          <p className="text-[11px] font-black text-slate-400 mb-2 tracking-widest uppercase px-1">Session History</p>
          
          {loading ? (
             <div className="flex justify-center py-10 opacity-30 animate-pulse font-bold">Syncing...</div>
          ) : sessions.map((s, i) => {
            const active = s.isActive || s.is_active;
            return (
              <div key={s.id} className={`bg-white rounded-[24px] p-4 border transition-all duration-300 ${active ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-slate-100 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-md">{i+1}</span>
                    <span className="text-sm font-bold text-slate-800">{s.session_year || s.sessionYear}</span>
                  </div>

                  {/* ── MODERN TOGGLE/STATUS ── */}
                  {active ? (
                    <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 animate-in zoom-in-75 duration-300 shadow-lg shadow-indigo-100">
                      <IC.Check /> ACTIVE NOW
                    </div>
                  ) : (
                    <button 
                        onClick={() => handleAction({ action: 'activate', sessionId: s.id })}
                        className="bg-slate-50 text-slate-500 border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95"
                    >
                        ACTIVATE
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                   <div className="flex gap-4">
                      <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Details
                      </button>
                   </div>
                   <button 
                    onClick={() => { if(confirm("Delete?")) handleAction({ action: 'delete', sessionId: s.id }); }}
                    className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   >
                     <IC.Trash />
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}