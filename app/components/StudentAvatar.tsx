"use client";
import { useState } from "react";

export default function StudentAvatar({ photo, name, rollNo }: { photo?: string | null; name: string; rollNo?: string | null }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b&bold=true`;
  const [imgSrc, setImgSrc] = useState(photo ? (photo.startsWith('http') ? photo : `/${photo}`) : fallback);

  return (
    <div className="relative w-12 h-12 flex-shrink-0"> 
      <img 
        src={imgSrc} 
        onError={() => setImgSrc(fallback)} 
        className="w-full h-full rounded-full object-cover ring-2 ring-slate-100 shadow-sm" 
        alt={name}
      />
      {rollNo && (
        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold border border-white">
          {rollNo}
        </span>
      )}
    </div>
  );
}