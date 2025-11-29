"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
const OrgIndicator = dynamic(() => import("./org-indicator"), { ssr: false });
import AuthGate from "./auth-gate";
import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/login" || pathname === "/register";
  const [open, setOpen] = useState(true);
  
  // All hooks must be called before any conditional returns
  const logout = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } catch {}
    window.location.href = '/login';
  }, []);
  
  if (isAuth) {
    return <main className="px-6 py-6">{children}</main>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60 shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>☰</button>
            <Link href="/" className="inline-flex items-center gap-1 md:gap-2 font-semibold tracking-tight text-sm md:text-base text-black/80 dark:text-white/80">
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
          <nav className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
            <OrgIndicator />
            <button
              onClick={logout}
              className="btn-base btn-outline h-9 px-3 text-xs md:text-sm font-medium"
              aria-label="Logout"
            >Logout</button>
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
      <footer className="border-t border-black/10 bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-[1400px] px-4 py-6 text-xs text-black/60 dark:text-white/50 flex items-center justify-between">
          <span>© CodeWeft</span>
          <span className="opacity-70">UI v1.0</span>
        </div>
      </footer>
    </>
  );
}
