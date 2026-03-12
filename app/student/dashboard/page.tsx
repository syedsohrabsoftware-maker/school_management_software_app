"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Book, PieChart, IndianRupee, Calendar, 
  Award, FileText, Bell, LogOut 
} from "lucide-react";

export default function StudentDashboard() {
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
      
      {/* 📱 Top Bar - Student Theme (Emerald Green) */}
      <div className="bg-emerald-500 p-6 rounded-b-[3rem] shadow-xl shadow-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-2xl font-black tracking-tight">Hello, {user.name.split(" ")[0]}!</h1>
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest opacity-90">
              Student Portal • {user.schoolName}
            </p>
          </div>
          <button onClick={() => { localStorage.clear(); router.push("/"); }} className="bg-white/20 p-2 rounded-xl text-white active:scale-90 transition-all">
            <LogOut size={22} />
          </button>
        </div>

        {/* 📊 Student Snapshot */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl flex justify-around items-center">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Attendance</p>
            <h2 className="text-xl font-black text-emerald-500">88%</h2>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Fee Dues</p>
            <h2 className="text-xl font-black text-rose-500">₹1,500</h2>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Rank</p>
            <h2 className="text-xl font-black text-indigo-500">4th</h2>
          </div>
        </div>
      </div>

      {/* 🛠️ Student Tools Grid */}
      <div className="p-6 space-y-6 mt-4">
        
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">My Academics</h3>
          <div className="grid grid-cols-4 gap-4">
            <MenuIcon icon={<Book />} label="Homework" color="bg-blue-50 text-blue-600" />
            <MenuIcon icon={<PieChart />} label="Attendance" color="bg-emerald-50 text-emerald-600" />
            <MenuIcon icon={<Award />} label="Results" color="bg-purple-50 text-purple-600" />
            <MenuIcon icon={<Calendar />} label="Timetable" color="bg-orange-50 text-orange-600" />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Finance & Docs</h3>
          <div className="grid grid-cols-4 gap-4">
            <MenuIcon icon={<IndianRupee />} label="Pay Fees" color="bg-rose-50 text-rose-600" />
            <MenuIcon icon={<FileText />} label="Receipts" color="bg-slate-100 text-slate-700" />
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