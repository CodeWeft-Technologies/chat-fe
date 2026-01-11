"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function NavGroup({ title, items, collapsed, p, onItemClick }: { title: string; items: Array<{href:string,label:string,icon:string}>; collapsed: boolean; p: string | null; onItemClick?: () => void }) {
  return (
    <div className="mb-2">
      {!collapsed && <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-3">{title}</div>}
      <ul className="space-y-0.5" role="list">
        {items.map(({ href, label, icon }) => {
          const active = p === href || (href !== '/' && p?.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onItemClick}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? label : undefined}
                className={`relative group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  active 
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`text-lg transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} aria-hidden>{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}
                {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    {label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const p = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar:collapsed') === 'true';
      if (saved) setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('sidebar:collapsed', collapsed ? 'true' : 'false');
  }, [collapsed]);

  const logout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } catch {}
    window.location.href = '/login';
  };

  const primary = [
    { href: '/', label: 'Overview', icon: '🏠' },
    { href: '/bots', label: 'My Bots', icon: '🤖' },
    { href: '/ingest', label: 'Knowledge Base', icon: '📚' },
  ];

  return (
    <aside
      aria-label="Sidebar navigation"
      className={`flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-white/10 transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'} h-16 border-b border-gray-100`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 group" onClick={onLinkClick}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow transition-all">
              C
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">CodeWeft</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C
          </div>
        )}
        
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(c => !c)}
          className={`hidden md:flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${collapsed ? 'mt-4' : ''}`}
        >
          {collapsed ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" /></svg>
          )}
        </button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        <NavGroup title="Platform" items={primary} collapsed={collapsed} p={p} onItemClick={onLinkClick} />
      </div>

      {/* Logout Button - visible on mobile */}
      <div className="md:hidden px-4 pb-4">
        <button
          onClick={() => {
            logout();
            if (onLinkClick) onLinkClick();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>

      <div className={`p-4 border-t border-gray-100 bg-gray-50/30 ${collapsed ? 'items-center justify-center flex' : ''}`}>
        {!collapsed ? (
          <div className="text-xs text-gray-500 space-y-1">
            <div className="font-medium text-gray-700">CodeWeft Dashboard</div>
            <div className="flex items-center gap-2 opacity-75">
              <span>v1.2.0</span>
              <span>•</span>
              <span className="text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Online
              </span>
            </div>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-green-500" title="System Online"></div>
        )}
      </div>
    </aside>
  );
}
