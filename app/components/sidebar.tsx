"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const p = usePathname();
  const items = [
    { href: "/", label: "Overview", icon: "🏠" },
    { href: "/bots", label: "Bots", icon: "🤖" },
    { href: "/ingest", label: "Add Knowledge", icon: "📚" },
  ];
  return (
    <aside className="w-64 shrink-0 border-r border-black/10 bg-white">
      <div className="px-3 py-4">
        <div className="text-xs uppercase tracking-wide text-black/50 mb-2">Navigation</div>
        <nav className="space-y-1">
          {items.map(({ href, label, icon }) => {
            const active = p === href || (href !== "/" && p?.startsWith(href));
            return (
              <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${active ? 'bg-black/90 text-white' : 'hover:bg-black/5'}`}>
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
