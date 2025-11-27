"use client";
import { useState, useEffect, use as usePromise, useCallback } from "react";

function B() { return (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, ""); }

export default function BotConfigPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = usePromise(params as Promise<{ botId: string }>);
  const [mounted, setMounted] = useState(false);
  const [org, setOrg] = useState("");
  useEffect(() => {
    setMounted(true);
    const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : "";
    setOrg(d);
  }, []);
  const [behavior, setBehavior] = useState("");
  const [system, setSystem] = useState("");
  const [welcome, setWelcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [rotatedAt, setRotatedAt] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    setSaved(false);
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/config?org_id=${encodeURIComponent(org)}`, { headers });
    const rt = await r.text();
    if (!r.ok) { try { const j = JSON.parse(rt); alert((j.detail && JSON.stringify(j.detail)) || rt); } catch { alert(rt || "Failed to load config"); } setLoading(false); return; }
    const d = JSON.parse(rt);
    setBehavior(d.behavior || "");
    setSystem(d.system_prompt || "");
    setWelcome(d.welcome_message || "");
    setLoading(false);
    const rk = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key?org_id=${encodeURIComponent(org)}`, { headers });
    const kt = await rk.text();
    if (rk.ok) { try { const kj = JSON.parse(kt); setPubKey(kj.public_api_key || null); setRotatedAt(kj.rotated_at || null); } catch { setPubKey(null); setRotatedAt(null); } } else { setPubKey(null); setRotatedAt(null); }
  }, [org, botId]);
  useEffect(() => { if (org && botId) { load(); } }, [load]);

  

  async function save() {
    if (!org || !behavior) { alert("Missing org or bot type"); return; }
    setLoading(true);
    setSaved(false);
    try {
      const allowed = ["support","sales","appointment","qna"];
      const vb = (behavior || "").trim().toLowerCase();
      if (!allowed.includes(vb)) { throw new Error(`Bot type must be one of ${allowed.join(", ")}`); }
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/config`, { method: "POST", headers, body: JSON.stringify({ org_id: org, behavior: vb, system_prompt: system, welcome_message: welcome }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
    const d = JSON.parse(t);
    setBehavior(d.behavior || vb);
    setSystem(d.system_prompt || system);
    setWelcome(d.welcome_message || welcome);
      setSaved(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Bot Settings</h1>
      <div className="text-sm text-black/60 dark:text-white/60">Bot: {botId}</div>
      {mounted && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm">Org</label>
          <input value={org} readOnly className="px-3 py-2 rounded-md border border-black/10 w-full sm:w-64" />
          <button onClick={load} className="px-3 py-2 rounded-md bg-blue-600 text-white">Reload</button>
        </div>
      )}
      <div className="rounded-xl border border-black/10 bg-white">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Configuration</h2>
            <button onClick={save} className="px-3 py-2 rounded-md bg-blue-600 text-white">Save</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Template</label>
              <select value={['support','sales','appointment','qna'].includes((behavior||'').toLowerCase()) ? (behavior||'') : ''}
                onChange={e=>{const v=e.target.value; if(v){ setBehavior(v); if(v==='support'){setSystem('Answer customer support questions using provided context. Be concise and helpful.');} else if(v==='sales'){setSystem('Assist with product questions and sales. Use provided context and be persuasive but honest.');} else if(v==='appointment'){setSystem('Help users schedule appointments. Collect required details and respect constraints from provided context.');} else if(v==='qna'){setSystem('Answer strictly from the provided Q&A knowledge. If not found, say: "I don\'t have that information."');} } }}
                className="px-3 py-2 rounded-md border border-black/10 w-full">
                <option value="">Select a template</option>
                <option value="support">Support</option>
                <option value="sales">Sales</option>
                <option value="appointment">Appointment</option>
                <option value="qna">QnA</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Bot type</label>
              <input value={behavior} onChange={e=>setBehavior(e.target.value)} placeholder="support / sales / appointment / qna" className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Instructions</label>
              <textarea value={system} onChange={e=>setSystem(e.target.value)} placeholder="Write detailed guidance and constraints for the bot" className="w-full min-h-32 px-3 py-2 rounded-md border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Greeting message</label>
              <input value={welcome} onChange={e=>setWelcome(e.target.value)} placeholder="Hello! How can I help you?" className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {loading && <span className="text-sm">Saving...</span>}
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </div>
      <div className="rounded-xl border border-black/10 bg-white">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Public API Key</h2>
            <div className="flex gap-2">
              <button onClick={async()=>{
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
                const ok = confirm("Rotate the public API key now? Old embeds will stop working until updated.");
                if(!ok) return;
                const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key/rotate`, { method: "POST", headers, body: JSON.stringify({ org_id: org }) });
                const j = await r.json();
                setPubKey(j.public_api_key || null);
                setRotatedAt(j.rotated_at || null);
              }} className="px-3 py-2 rounded-md bg-black/80 text-white text-sm">Rotate</button>
              <button onClick={async()=>{
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
                const ok = confirm("Revoke the public API key? Public embeds will be disabled.");
                if(!ok) return;
                await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key/revoke`, { method: "POST", headers, body: JSON.stringify({ org_id: org }) });
                setPubKey(null);
                setRotatedAt(null);
              }} className="px-3 py-2 rounded-md bg-red-600 text-white text-sm">Revoke</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input readOnly value={pubKey || ""} placeholder="No key" className="px-3 py-2 rounded-md border border-black/10 w-full" />
            <button onClick={async()=>{
              const k = pubKey || "";
              if(!k) return;
              try {
                if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(k); alert("Key copied"); }
                else {
                  const ta = document.createElement("textarea"); ta.value = k; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); alert("Key copied");
                }
              } catch {}
            }} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm" disabled={!pubKey}>Copy</button>
          </div>
          {mounted && (
            <div className="text-xs text-black/60">Last rotated: {rotatedAt ? new Date(rotatedAt).toLocaleString() : "Not set"}</div>
          )}
          <div className="text-xs text-black/60">After rotating, update the embed snippet’s botKey on your website.</div>
        </div>
      </div>
    </div>
  );
}
