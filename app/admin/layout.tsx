import AdminBottomNav from "@/app/components/AdminBottomNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-w-[430px] mx-auto bg-slate-50 relative shadow-2xl overflow-x-hidden">
      
      {/* Har page ka content yahan load hoga */}
      <main className="pb-20">
        {children}
      </main>

      {/* Persistent Bottom Navigation from Components */}
      <AdminBottomNav />
      
    </div>
  );
}