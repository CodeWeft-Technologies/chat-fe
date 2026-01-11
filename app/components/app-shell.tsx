"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
const OrgIndicator = dynamic(() => import("./org-indicator"), { ssr: false });
import AuthGate from "./auth-gate";
import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/login" || pathname === "/register";
  const [open, setOpen] = useState(false);
  
  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-200">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200" 
              aria-label="Toggle navigation" 
              onClick={()=>setOpen(!open)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            <div className="md:hidden font-bold text-gray-900 tracking-tight text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                C
              </div>
              <span>CodeWeft</span>
            </div>

            {/* Breadcrumb / Title Area - Hidden on mobile if needed, or simple text */}
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500">
              <span className="text-gray-900">Dashboard</span>
              {pathname !== '/' && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="capitalize text-gray-900">{pathname.split('/')[1]}</span>
                </>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <OrgIndicator />
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
              aria-label="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {open && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div className={`
          fixed inset-y-0 left-0 z-50 md:z-auto md:static
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          bg-white h-full
        `}>
          <Sidebar onLinkClick={() => setOpen(false)} />
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 scroll-smooth">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            <AuthGate />
            {children}
          </div>
          
          <footer className="mt-auto border-t border-gray-200 bg-white/50 py-4 sm:py-6">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <div className="flex items-center gap-3 sm:gap-4">
                <span>&copy; {new Date().getFullYear()} CodeWeft Inc.</span>
                <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>All systems operational</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
