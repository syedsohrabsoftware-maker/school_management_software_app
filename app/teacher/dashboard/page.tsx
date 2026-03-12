"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, CalendarCheck, BookOpen, ClipboardEdit, 
  Clock, Bell, LogOut, FileText 
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* 📱 Top Bar - Teacher Theme (Sky Blue) */}
      <div className="bg-sky-500 p-6 rounded-b-[3rem] shadow-xl shadow-sky-100">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-2xl font-black tracking-tight">Hi, {user.name.split(" ")[0]}!</h1>
            <p className="text-sky-100 text-xs font-bold uppercase tracking-widest opacity-90">
              Staff Portal • {user.schoolName}
            </p>
          </div>
          <button onClick={() => { localStorage.clear(); router.push("/"); }} className="bg-white/20 p-2 rounded-xl text-white active:scale-90 transition-all">
            <LogOut size={22} />
          </button>
        </div>

        {/* 📊 Today's Action Snapshot */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl flex justify-around items-center">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Classes</p>
            <h2 className="text-xl font-black text-sky-500">4</h2>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Pending Attd.</p>
            <h2 className="text-xl font-black text-rose-500">1</h2>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Notices</p>
            <h2 className="text-xl font-black text-amber-500">2</h2>
          </div>
        </div>
      </div>

      {/* 🛠️ Teacher Tools Grid */}
      <div className="p-6 space-y-6 mt-4">
        
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Academic Tasks</h3>
          <div className="grid grid-cols-4 gap-4">
            <MenuIcon icon={<CalendarCheck />} label="Attendance" color="bg-emerald-50 text-emerald-600" />
            <MenuIcon icon={<ClipboardEdit />} label="Add Marks" color="bg-purple-50 text-purple-600" />
            <MenuIcon icon={<BookOpen />} label="Homework" color="bg-blue-50 text-blue-600" />
            <MenuIcon icon={<Clock />} label="Timetable" color="bg-orange-50 text-orange-600" />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">My Profile</h3>
          <div className="grid grid-cols-4 gap-4">
            <MenuIcon icon={<FileText />} label="Payslip" color="bg-slate-100 text-slate-700" />
            <MenuIcon icon={<Users />} label="My Leaves" color="bg-rose-50 text-rose-600" />
            <MenuIcon icon={<Bell />} label="Notices" color="bg-amber-50 text-amber-600" />
          </div>
        </section>

      </div>
    </div>
  );
}

function MenuIcon({ icon, label, color }: any) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all`}>
        {icon}
      </div>
      <span className="text-[10px] font-extrabold text-slate-500 text-center uppercase tracking-tighter">
        {label}
      </span>
    </div>
  );
}