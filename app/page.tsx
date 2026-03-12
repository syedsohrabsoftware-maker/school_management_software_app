"use client";
// FILE PATH: app/(auth)/login/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, User, GraduationCap, School, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Role = "admin" | "teacher" | "student";

const ROLES = [
  {
    id: "admin" as Role,
    label: "Admin",
    desc: "Full Access",
    icon: <User size={20} strokeWidth={2.5} />,
    color: "#4f46e5",
    lightBg: "#eef2ff",
    border: "#c7d2fe",
  },
  {
    id: "teacher" as Role,
    label: "Teacher",
    desc: "Class Portal",
    icon: <GraduationCap size={20} strokeWidth={2.5} />,
    color: "#0284c7",
    lightBg: "#e0f2fe",
    border: "#bae6fd",
  },
  {
    id: "student" as Role,
    label: "Student",
    desc: "My Portal",
    icon: <School size={20} strokeWidth={2.5} />,
    color: "#059669",
    lightBg: "#d1fae5",
    border: "#a7f3d0",
  },
];

// ── Input Field ──────────────────────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder, suffix
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  type?: string; placeholder?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required
          style={{
            width: "100%", padding: suffix ? "12px 44px 12px 16px" : "12px 16px",
            borderRadius: 14, border: "1.5px solid #e2e8f0",
            fontSize: 14, color: "#1e293b", fontWeight: 500,
            background: "#f8fafc", outline: "none",
            boxSizing: "border-box", fontFamily: "inherit",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => {
            e.target.style.borderColor = "#6366f1";
            e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
            e.target.style.background = "#fff";
          }}
          onBlur={e => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "none";
            e.target.style.background = "#f8fafc";
          }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schoolCode, setSchoolCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const activeRole = ROLES.find(r => r.id === role)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolCode || !email || !password) {
      toast.error("Saare fields bharo!"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, school_code: schoolCode, email, password }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        // ✅ Save user info in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Set schoolId as a JS-readable cookie (httpOnly: false)
        // This is needed so client-side code can read it for API calls
        // Your login API should set this cookie server-side, but as a fallback:
        if (data.user?.schoolId) {
          document.cookie = `schoolId=${data.user.schoolId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        }

        toast.success(`Welcome ${data.user.name}! 🎉`);

        setTimeout(() => {
          const dest = data.user.role === "admin"
            ? "/admin"
            : data.user.role === "teacher"
            ? "/teacher/dashboard"
            : "/student/dashboard";
          router.push(dest);
        }, 700);
      } else {
        toast.error(data.message || "Login failed!");
      }
    } catch {
      toast.error("Network error! Check connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #f8fafc 0%, #f0f4ff 50%, #f8fafc 100%)",
      padding: 20, fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 14, fontWeight: 700, fontSize: 13 } }} />

      {/* Background decoration */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.07), transparent 70%)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 380, position: "relative", zIndex: 1,
        background: "#fff", borderRadius: 28, padding: "32px 28px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
      }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: "0 auto 14px",
            background: `linear-gradient(145deg, ${activeRole.color}22, ${activeRole.color}44)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: activeRole.color, border: `2px solid ${activeRole.border}`,
            transition: "all 0.3s",
          }}>
            {activeRole.icon}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            SchoolEase
          </h1>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, margin: "5px 0 0", textTransform: "uppercase", letterSpacing: "0.2em" }}>
            Management Suite
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
          {ROLES.map(r => {
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "12px 6px", borderRadius: 16, border: "none",
                  cursor: "pointer", transition: "all 0.2s",
                  background: active ? r.color : "#f8fafc",
                  color: active ? "#fff" : "#94a3b8",
                  boxShadow: active ? `0 4px 14px ${r.color}40` : "none",
                  transform: active ? "translateY(-2px)" : "none",
                  outline: active ? `2px solid ${r.color}30` : "none",
                  outlineOffset: 2,
                }}
              >
                {r.icon}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>{r.label}</div>
                  <div style={{ fontSize: 9, marginTop: 2, opacity: active ? 0.75 : 0.6, letterSpacing: "0.03em" }}>{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
            {role === "admin" ? "Admin Login" : role === "teacher" ? "Teacher Login" : "Student Login"}
          </span>
          <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="School Code" value={schoolCode} onChange={setSchoolCode} placeholder="Ex: SCH-786" />
          <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="yourname@email.com" />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            suffix={
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 16, border: "none",
              background: loading ? "#e2e8f0" : activeRole.color,
              color: loading ? "#94a3b8" : "#fff",
              fontWeight: 900, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 4, transition: "all 0.2s",
              boxShadow: loading ? "none" : `0 4px 16px ${activeRole.color}40`,
              fontFamily: "inherit",
            }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Verifying...</>
            ) : (
              <>Sign In as {activeRole.label} <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* Footer */}
       <p className="mx-auto w-fit text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-6 px-4 py-2 border border-slate-500/40 rounded-md bg-slate-900/40 backdrop-blur-sm shadow-sm">
  Devprime Cloud Core
</p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #cbd5e1; }
      `}</style>
    </div>
  );
}