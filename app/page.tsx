"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function Home() {
  const [org, setOrg] = useState("");
  useEffect(() => {
    const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : "";
    const t = setTimeout(() => { setOrg(d); }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (org) localStorage.setItem("orgId", org); }, [org]);
  const [bots, setBots] = useState<{ bot_id: string; behavior: string; has_key: boolean }[]>([]);
  const loadBots = useCallback(async () => {
    if (!org) return;
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    try {
      const r = await fetch(`${B()}/api/bots?org_id=${encodeURIComponent(org)}`, { headers });
      const t = await r.text();
      if (!r.ok) { setBots([]); return; }
      const d = JSON.parse(t);
      setBots(d.bots || []);
    } catch {
      setBots([]);
    }
  }, [org]);
  useEffect(() => {
    const t = setTimeout(() => { loadBots(); }, 0);
    return () => clearTimeout(t);
  }, [loadBots]);
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Overview</h1>
            <p className="text-sm text-black/60">Create bots and ingest content to power your chatbot.</p>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/bots" className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700 transition">Create Bot</Link>
            <Link href="/ingest" className="px-3 py-2 rounded-md bg-black/80 text-white text-sm shadow hover:bg-black transition">Ingest Content</Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-black/10 p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Create a Bot</h2>
          <p className="text-sm mb-3">Create a chatbot for your organization. Choose its behavior (support, sales, appointment), set a name, and author a system prompt that guides how it answers.</p>
          <Link href="/bots" className="inline-block px-3 py-2 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700 transition">Go to Bots</Link>
        </div>
        <div className="rounded-xl border border-black/10 p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Add Knowledge</h2>
          <p className="text-sm mb-3">Add information your bot can use to answer questions. Paste text, add a website, or upload PDFs. Behind the scenes, we prepare the content for fast lookup.</p>
          <Link href="/ingest" className="inline-block px-3 py-2 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700 transition">Open Add Knowledge</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-black/10 p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Usage</h2>
          <p className="text-sm mb-3">View daily chats, success vs fallback counts, and similarity scores to understand performance. Use this to tune prompts and content.</p>
          <p className="text-sm">Open any bot and click <span className="font-medium">Usage</span> to see detailed charts.</p>
        </div>
        <div className="rounded-xl border border-black/10 p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Embed & Widget</h2>
          <p className="text-sm mb-3">Get copy-paste snippets to embed your bot on a website. Options include bubble chat, inline, iframe, and a CDN widget.</p>
          <p className="text-sm">Open any bot and click <span className="font-medium">Embed</span> to fetch the snippet.</p>
        </div>
        <div className="rounded-xl border border-black/10 p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Config</h2>
          <p className="text-sm mb-3">Update behavior, system prompt, and optional public API key. The public key is required if you plan to use unauthenticated embeds on public sites.</p>
          <p className="text-sm">Open any bot and click <span className="font-medium">Config</span> to edit settings.</p>
        </div>
        <div className="rounded-xl border border-black/10 p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Security</h2>
          <p className="text-sm mb-3">Authenticated dashboard actions use your bearer token. Public embeds can use a per-bot public API key; rotate it from the Bots page when needed.</p>
          <p className="text-sm">Keys should never be hard-coded server-side; use the provided rotation.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Bots</h2>
          <Link href="/bots" className="px-3 py-2 rounded-md bg-black/80 text-white text-sm shadow hover:bg-black transition">Manage</Link>
        </div>
        {!bots.length ? (
          <div className="rounded-xl border border-black/10 bg-white p-4 text-sm shadow-sm">No bots found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map(b => (
              <div key={b.bot_id} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="text-sm text-black/60 mb-1">{b.behavior}</div>
                <div className="font-mono text-sm break-all mb-2">{b.bot_id}</div>
                <div className="text-xs mb-3">{b.has_key ? "Key active" : "No key"}</div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/usage/${b.bot_id}`} className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs shadow hover:bg-blue-700 transition">Usage</Link>
                  <Link href={`/embed/${b.bot_id}`} className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs shadow hover:bg-blue-700 transition">Embed</Link>
                  <Link href={`/bots/${b.bot_id}/config`} className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs shadow hover:bg-blue-700 transition">Config</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {!org && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-900 p-4 text-sm">
          You are not logged in. Please <Link href="/login" className="underline">login</Link> or <Link href="/register" className="underline">register</Link>.
        </div>
      )}
    </div>
  );
}
