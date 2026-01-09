"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiCall } from "../lib/api";

export default function OrgIndicator() {
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const o = typeof window !== "undefined" ? localStorage.getItem("orgId") : null;
        if (o) setOrg(o);
        
        const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (t) {
          try {
            const data = await apiCall<{ email: string; org_id: string }>("/api/auth/me");
            if (data?.email) setEmail(data.email);
          } catch {
            // Token expired or invalid, apiCall will handle redirect
          }
        }
      } catch {}
    };
    
    loadUserInfo();
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
