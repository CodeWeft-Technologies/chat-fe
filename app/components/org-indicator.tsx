"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OrgIndicator() {
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  
  useEffect(() => {
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const o = typeof window !== "undefined" ? localStorage.getItem("orgId") : null;
      
      if (o) setOrg(o);
      
      if (t) {
        fetch(`${(process.env.NEXT_PUBLIC_BACKEND_URL||"").replace(/\/$/,'')}/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
          .then(r=>r.json()).then(d=>{ if (d?.email) setEmail(d.email); }).catch(()=>{});
      }
    } catch {}
  }, []);

  if (!org) {
    return <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">Sign In</Link>;
  }

  const initials = email ? email.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-default">
      <div className="flex flex-col items-end leading-tight">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ORG: {org}</span>
        {email && <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{email}</span>}
      </div>
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
        {initials}
      </div>
    </div>
  );
}
