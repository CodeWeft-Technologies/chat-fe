"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // theme can be 'light' | 'dark' | 'auto'
  const [mode, setMode] = useState<string>(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") || "auto";
  });

  // Apply theme preference (auto falls back to media query)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    function apply(resolved: string) {
      root.setAttribute("data-theme", resolved);
      // Tailwind dark: variants require 'dark' class on root if configured that way.
      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      // Auto-adjust accent/readability variables if custom overrides exist
      const cs = getComputedStyle(root);
      const accent = cs.getPropertyValue('--accent').trim();
      // Simple luminance check to ensure accent is not too dark on light or too bright on dark.
      function lum(hex:string){
        const h = hex.replace('#','');
        if(h.length!==6) return 0;
        const r=parseInt(h.slice(0,2),16)/255;
        const g=parseInt(h.slice(2,4),16)/255;
        const b=parseInt(h.slice(4,6),16)/255;
        const a=[r,g,b].map(v=> v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4));
        return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
      }
      const l = lum(accent);
      if (resolved === 'dark' && l < 0.25) {
        // Ensure accent has enough brightness in dark mode
        root.style.setProperty('--accent', '#3b82f6');
        root.style.setProperty('--accent-hover', '#2563eb');
      } else if (resolved === 'light' && l > 0.75) {
        // If accent too bright on light background, tone it down
        root.style.setProperty('--accent', '#2563eb');
        root.style.setProperty('--accent-hover', '#1d4ed8');
      }
    }
    if (mode === "auto") {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      apply(prefersDark ? 'dark' : 'light');
    } else {
      apply(mode);
    }
    localStorage.setItem("theme", mode);
  }, [mode]);

  // Listen for system changes when in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode('auto'); // triggers re-run
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  function cycle() {
    setMode(m => m === 'auto' ? 'dark' : m === 'dark' ? 'light' : 'auto');
  }

  const labelMap: Record<string,string> = { auto: 'Auto', dark: 'Dark', light: 'Light' };
  const iconMap: Record<string,string> = { auto: '🌓', dark: '🌙', light: '☀️' };

  return (
    <button
      onClick={cycle}
      className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800 text-xs md:text-sm font-medium shadow-sm hover:shadow-md transition"
      aria-label="Cycle theme"
      title="Theme: cycle light/dark/auto"
      data-theme-mode={mode}
    >
      <span>{iconMap[mode]}</span>
      <span>{labelMap[mode]}</span>
    </button>
  );
}
