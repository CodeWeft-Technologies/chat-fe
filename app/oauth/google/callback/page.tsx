"use client";
import { useEffect, useState } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function GoogleCallbackPage() {
  const [msg, setMsg] = useState("Connecting...");
  useEffect(() => {
    async function run() {
      try {
        const u = new URL(window.location.href);
        const code = u.searchParams.get("code") || "";
        const state = u.searchParams.get("state") || "";
        const cb = `${window.location.origin}/oauth/google/callback`;
        const r = await fetch(`${B()}/api/calendar/google/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(cb)}`);
        const t = await r.text();
        if (!r.ok) { setMsg(t || "Failed to connect"); return; }
        const j = JSON.parse(t);
        setMsg(`Connected to calendar: ${j.calendar_id || "primary"}`);
      } catch (e) {
        setMsg(String(e||"Error"));
      }
    }
    run();
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Google Calendar</h1>
      <div className="mt-4">{msg}</div>
    </div>
  );
}

