"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const p = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Persist collapsed preference
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebar:collapsed') : null;
    if (stored === 'true') setCollapsed(true);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('sidebar:collapsed', collapsed ? 'true' : 'false');
  }, [collapsed]);

  const primary = [
    { href: '/', label: 'Overview', icon: '🏠' },
    { href: '/bots', label: 'Bots', icon: '🤖' },
    { href: '/ingest', label: 'Knowledge', icon: '📚' },
  ];
  // Removed Usage & Auth per request; keep structure if future items needed
  const secondary: Array<{href:string,label:string,icon:string}> = [];

  function NavGroup({ title, items }: { title: string; items: Array<{href:string,label:string,icon:string}> }) {
    return (
      <div>
        {!collapsed && <div className="text-[10px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40 mb-2 px-2">{title}</div>}
        <ul className="space-y-1" role="list">
          {items.map(({ href, label, icon }) => {
            const active = p === href || (href !== '/' && p?.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                  className={`relative group flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-2 py-2 rounded-md text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${active ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'}`}
                >
                  <span className="text-base drop-shadow-sm" aria-hidden>{icon}</span>
                  {!collapsed && <span className="truncate">{label}</span>}
                  {active && !collapsed && <span className="ml-auto text-[10px] font-medium tracking-wide opacity-75">ACTIVE</span>}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded bg-black/80 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">{label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        aria-label="Toggle navigation"
        onClick={() => setMobileOpen(o => !o)}
        className="md:hidden fixed top-3 left-3 z-50 inline-flex items-center justify-center h-10 w-10 rounded-md bg-[var(--accent)] text-white shadow focus:outline-none focus:ring-2 focus:ring-white"
      >
        {mobileOpen ? '✖' : '☰'}
      </button>
      {/* Overlay for mobile */}
      {mobileOpen && <div onClick={()=>setMobileOpen(false)} className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />}
      <aside
        aria-label="Sidebar navigation"
        className={`flex flex-col h-full md:h-[calc(100vh-56px)] top-0 left-0 md:static fixed z-50 md:z-auto bg-white dark:bg-neutral-900 border-r border-black/10 dark:border-white/10 transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-64'} ${mobileOpen ? 'block' : 'hidden'} md:block`}
        style={{ width: collapsed ? 64 : 256 }}
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-black/5 dark:border-white/10">
          {!collapsed && <Link href="/" className="font-semibold text-sm tracking-tight text-black dark:text-white">CodeWeft</Link>}
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(c => !c)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-xs bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition"
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        <div className="px-2 py-4 flex flex-col gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
          <NavGroup title="Main" items={primary} />
          {/* Secondary group intentionally removed */}
          {!collapsed && (
            <div className="mt-auto text-[11px] text-black/40 dark:text-white/40 px-2 pb-4">
              <div className="font-medium">Powered by CodeWeft</div>
              <div className="opacity-70">v1.0 • UX enhanced</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
