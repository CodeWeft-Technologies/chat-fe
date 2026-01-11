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
    return (
      <Link 
        href="/login" 
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>Sign In</span>
      </Link>
    );
  }

  const initials = email ? email.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 pr-1 py-1 rounded-full border border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-default">
      {/* Text info - hidden on mobile, shown on tablet+ */}
      <div className="hidden sm:flex flex-col items-end leading-tight">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ORG: {org.length > 12 ? org.substring(0, 12) + '...' : org}</span>
        {email && <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{email}</span>}
      </div>
      {/* Avatar - always visible */}
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
        {initials}
      </div>
    </div>
  );
}
