"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
const OrgIndicator = dynamic(() => import("./org-indicator"), { ssr: false });
import AuthGate from "./auth-gate";
import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/login" || pathname === "/register";
  const [open, setOpen] = useState(true);
  if (isAuth) {
    return <main className="px-6 py-6">{children}</main>;
  }
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-background backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden px-2 py-1 rounded-md border border-black/10" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>☰</button>
            <Link href="/" className="text-base md:text-lg font-semibold tracking-tight">Chatbot</Link>
          </div>
          <nav className="flex gap-2 md:gap-3 text-sm items-center">
            <OrgIndicator />
          </nav>
        </div>
      </header>
      <div className="flex">
        <div className={`${open ? 'block' : 'hidden'} md:block`}><Sidebar /></div>
        <main className="flex-1 min-h-[calc(100vh-56px)] bg-gradient-to-b from-background to-indigo-50">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6">
            <AuthGate />
            {children}
          </div>
        </main>
      </div>
      <footer className="border-t border-black/10">
        <div className="mx-auto max-w-[1400px] px-4 py-6 text-xs text-black/60">© Chatbot</div>
      </footer>
    </>
  );
}
