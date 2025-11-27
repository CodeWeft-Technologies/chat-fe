"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function OrgIndicator() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  useEffect(() => {
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (t) {
        fetch(`${(process.env.NEXT_PUBLIC_BACKEND_URL||"").replace(/\/$/,'')}/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
          .then(r=>r.json()).then(d=>{ if (d?.email) setEmail(d.email); }).catch(()=>{});
      }
    } catch {}
  }, []);
  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("orgId");
      localStorage.removeItem("orgName");
      localStorage.removeItem("token");
    }
    router.push("/login");
  }
  const org = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : "";
  if (!org) {
    return <Link href="/login" className="text-sm text-blue-600 hover:underline">Login</Link>;
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-black/60 dark:text-white/60">{email ? email+" • " : ""}Org: {org}</span>
      <button onClick={logout} className="px-2 py-1 rounded-md border border-black/10">Logout</button>
    </div>
  );
}
