"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ── Types for Build Fix ───────────────────────────────────────
interface AdminBottomNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

// ── Icons ─────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
);
const ModulesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>
  </svg>
);
const ReportsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const TABS = [
  { id: "home",    label: "HOME",    path: "/admin",          Icon: HomeIcon },
  { id: "modules", label: "MODULES", path: "/admin/modules",  Icon: ModulesIcon },
  { id: "reports", label: "REPORTS", path: "/admin/reports",  Icon: ReportsIcon },
  { id: "profile", label: "PROFILE", path: "/admin/profile",  Icon: ProfileIcon },
];

export default function AdminBottomNav({ activeTab, setActiveTab }: AdminBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Synchronize activeIndex with pathname OR activeTab prop
  useEffect(() => {
    const currentTabId = activeTab || TABS.find(tab => 
      tab.id === "home" ? pathname === "/admin" : pathname.startsWith(tab.path)
    )?.id || "home";

    const index = TABS.findIndex(t => t.id === currentTabId);
    if (index !== -1) setActiveIndex(index);
  }, [pathname, activeTab]);

  const handleTabClick = (tabId: string, path: string, index: number) => {
    setActiveIndex(index);
    if (setActiveTab) {
      setActiveTab(tabId); // Dashboard state update karega
    } else {
      router.push(path); // Normal navigation karega
    }
  };

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      background: "#ffffff",
      borderTop: "1px solid #f1f5f9",
      display: "flex",
      justifyContent: "space-around",
      paddingBottom: "env(safe-area-inset-bottom, 10px)",
      zIndex: 1000,
      boxShadow: "0 -8px 30px rgba(0,0,0,0.04)"
    }}>
      
      {/* ── Sliding TOP LINE Indicator ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: `${activeIndex * 25}%`,
        width: "25%",
        height: "3.5px",
        display: "flex",
        justifyContent: "center",
        transition: "all 0.4s cubic-bezier(0.65, 0, 0.35, 1)",
        zIndex: 2
      }}>
        <div style={{
          width: "35px",
          height: "100%",
          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 2px 6px rgba(99,102,241,0.3)"
        }} />
      </div>

      {TABS.map((tab, index) => {
        const active = activeIndex === index;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.path, index)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              height: "65px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent"
            }}
          >
            <div style={{ 
              color: active ? "#6366f1" : "#94a3b8", 
              transition: "all 0.3s ease",
              transform: active ? "scale(1.1)" : "scale(1)"
            }}>
              <tab.Icon />
            </div>
            
            <span style={{
              fontSize: "9px",
              fontWeight: "900",
              color: active ? "#6366f1" : "#94a3b8",
              letterSpacing: "0.8px",
              transition: "color 0.3s ease"
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}