"use client";
import Link from "next/link";
import { useCallback, useState, useEffect } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

type BotItem = { bot_id: string; behavior: string; has_key: boolean };

export default function BotsPage() {
  const [mounted, setMounted] = useState(false);
  const [org, setOrg] = useState("");
  useEffect(() => { setMounted(true); const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : ""; setOrg(d); }, []);
  useEffect(() => { if (org) localStorage.setItem("orgId", org); }, [org]);
  const [bots, setBots] = useState<BotItem[]>([]);
  const [name, setName] = useState("");
  const [behavior, setBehavior] = useState("");
  const [system, setSystem] = useState("");
  const [website, setWebsite] = useState("");
  const [tone, setTone] = useState("");
  const [welcome, setWelcome] = useState("");
  const [template, setTemplate] = useState("");
  

  async function api<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {};
    if (opts?.headers) {
      const h = new Headers(opts.headers);
      h.forEach((v, k) => { headers[k] = v; });
    }
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t) headers["Authorization"] = `Bearer ${t}`;
    }
    const r = await fetch(B()+path, { ...opts, headers });
    const t = await r.text();
    if (!r.ok) {
      try { const j = JSON.parse(t); throw new Error((j.detail && JSON.stringify(j.detail)) || t || ("http"+r.status)); }
      catch { throw new Error(t || ("http"+r.status)); }
    }
    try { return JSON.parse(t) as T; } catch { return t as unknown as T; }
  }
  const load = useCallback(async () => {
    if (!org) return;
    const d = await api<{ bots: BotItem[] }>(`/api/bots?org_id=${encodeURIComponent(org)}`);
    setBots(d.bots || []);
  }, [org]);
  useEffect(() => {
    load();
  }, [load]);
  
  
  async function createBot() {
    if (!org) { alert("Set Org ID"); return; }
    if (!behavior) { alert("Select a behavior"); return; }
    try {
      await api(`/api/bots`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ org_id: org, behavior, system_prompt: system || null, name: name || null, website_url: website || null, tone: tone || null, welcome_message: welcome || null }) });
      setName(""); setBehavior(""); setSystem(""); setWebsite(""); setTone(""); setWelcome("");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to create bot");
    }
  }

  async function rotateKey(botId: string) {
    await api(`/api/bots/${botId}/key/rotate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ org_id: org }) });
    await load();
  }

  async function clearData(botId: string) {
    if (!org) { alert("Missing org"); return; }
    if (!confirm("Remove all saved content for this bot? This cannot be undone.")) return;
    try {
      const keyInfo = await api<{ public_api_key: string | null }>(`/api/bots/${botId}/key?org_id=${encodeURIComponent(org)}`);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (keyInfo?.public_api_key) { headers["X-Bot-Key"] = keyInfo.public_api_key; }
      const res = await api<{ deleted: number }>(`/api/ingest/clear/${botId}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, confirm: true }) });
      alert(`Removed ${res.deleted} items`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to clear data");
    }
  }

  async function deleteBot(botId: string) {
    if (!org) { alert("Missing org"); return; }
    if (!confirm("Delete this bot and ALL of its data? This cannot be undone.")) return;
    try {
      const res = await api<{ deleted: Record<string, number> }>(`/api/bots/${botId}/delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ org_id: org, confirm: true }) });
      const total = Object.values(res.deleted || {}).reduce((a, b) => a + (b || 0), 0);
      alert(`Bot deleted. Rows removed: ${total}`);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to delete bot");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bots</h1>
      </div>
      {mounted && (
        <div className="rounded-xl border border-black/10 bg-white shadow-sm">
          <div className="p-4 flex flex-wrap items-center gap-3">
            <label className="text-sm">Org</label>
            <input value={org} readOnly className="px-3 py-2 rounded-md border border-black/10 w-full sm:w-64" />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="p-4 space-y-2 text-sm text-black/70">
          <div className="font-semibold text-black/80">About Bots</div>
          <p>Create bots for your organization and manage their behavior and prompts. Keys can be rotated to secure public embeds. Your organization is fixed here to prevent cross-tenant access.</p>
        </div>
      </div>

      <div className="rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Create Bot</h2>
            <button onClick={createBot} className="px-3 py-2 rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 transition">Create</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Template</label>
              <select value={template} onChange={e=>{const v=e.target.value;setTemplate(v);if(v==='support'){setBehavior('support');setSystem('Answer customer support questions using provided context. Be concise and helpful.');}else if(v==='sales'){setBehavior('sales');setSystem('Assist with product questions and sales. Use provided context and be persuasive but honest.');}else if(v==='appointment'){setBehavior('appointment');setSystem('Help users schedule appointments. Collect required details and respect constraints from provided context.');}else if(v==='qna'){setBehavior('qna');setSystem('Answer strictly from the provided Q&A knowledge. If not found, say: "I don\'t have that information."');}}} className="px-3 py-2 rounded-md border border-black/10 w-full">
                <option value="">Select a template</option>
                <option value="support">Support</option>
                <option value="sales">Sales</option>
                <option value="appointment">Appointment</option>
                <option value="qna">QnA</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Bot Type</label>
              <select value={behavior} onChange={e=>setBehavior(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full">
                <option value="">Behavior</option>
                <option value="support">Customer Support</option>
                <option value="sales">Sales</option>
                <option value="appointment">Appointment Booking</option>
                <option value="qna">QnA</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Instructions</label>
              <input value={system} onChange={e=>setSystem(e.target.value)} placeholder="Bot instructions" className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Website</label>
              <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://..." className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Tone</label>
              <select value={tone} onChange={e=>setTone(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full">
                <option value="">Tone</option>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Greeting</label>
              <input value={welcome} onChange={e=>setWelcome(e.target.value)} placeholder="Greeting message" className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Bots</h2>
          <button onClick={load} className="px-3 py-2 rounded-md bg-black/80 text-white">Refresh</button>
        </div>
        {!bots.length ? (
          <div className="rounded-xl border border-black/10 bg-white p-4 text-sm">No bots found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map(b => (
              <div key={b.bot_id} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="text-sm text-black/60 mb-1">Bot Type: {b.behavior}</div>
                <div className="font-mono text-sm break-all mb-2">{b.bot_id}</div>
                <div className="text-xs mb-3">{b.has_key ? "Key active" : "No key"}</div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/usage/${b.bot_id}`} className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs shadow hover:bg-blue-700 transition">Usage</Link>
                  <Link href={`/usage/${b.bot_id}`} className="px-2 py-1 rounded-md bg-green-600 text-white text-xs shadow hover:bg-green-700 transition">Test</Link>
                  <Link href={`/embed/${b.bot_id}`} className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs shadow hover:bg-blue-700 transition">Embed</Link>
                  <Link href={`/bots/${b.bot_id}/config`} className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs shadow hover:bg-blue-700 transition">Config</Link>
                  <button onClick={()=>rotateKey(b.bot_id)} className="px-2 py-1 rounded-md bg-black/80 text-white text-xs shadow hover:bg-black transition">Rotate Key</button>
                  <button onClick={()=>clearData(b.bot_id)} className="px-2 py-1 rounded-md bg-red-600 text-white text-xs shadow hover:bg-red-700 transition">Clear Data</button>
                  <button onClick={()=>deleteBot(b.bot_id)} className="px-2 py-1 rounded-md bg-red-700 text-white text-xs shadow hover:bg-red-800 transition">Delete Bot</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
