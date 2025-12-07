"use client";
import Link from "next/link";
import { useCallback, useState, useEffect, useMemo } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";

const TEMPLATE_PROMPTS: Record<string, { behavior: string; system: string }> = {
  support: {
    behavior: 'support',
    system: 'Answer customer support questions using provided context. Be concise and helpful.'
  },
  sales: {
    behavior: 'sales',
    system: 'Assist with product questions and sales. Use provided context and be persuasive but honest.'
  },
  appointment: {
    behavior: 'appointment',
    system: 'Help users schedule appointments. Collect required details and respect constraints from provided context.'
  },
  qna: {
    behavior: 'qna',
    system: 'Answer strictly from the provided Q&A knowledge. If not found, say: "I don\'t have that information."'
  }
};

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
  const [template, setTemplate] = useState("");
  const [search, setSearch] = useState("");
  

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
      await api(`/api/bots`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ org_id: org, behavior, system_prompt: system || null, name: name || null, website_url: website || null, tone: tone || null }) });
      setName(""); setBehavior(""); setSystem(""); setWebsite(""); setTone("");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bots;
    return bots.filter(b => b.bot_id.toLowerCase().includes(q) || b.behavior.toLowerCase().includes(q));
  }, [bots, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Bots</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search bots..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      {mounted && (
        <Card title="Organization" subtitle="Context for all bot operations" className="p-4">
          <Input label="Org ID" value={org} readOnly description="Stored locally for convenience." />
        </Card>
      )}

      <Card title="About Bots" className="p-4" subtitle="Isolated assistants with configurable instructions and usage keys">
        <p className="text-xs leading-relaxed text-[var(--text-soft)]">Create assistants tailored to support, sales, appointment booking or constrained Q&amp;A. Rotate keys when embedding publicly. Organization scoping prevents cross-tenant leakage.</p>
      </Card>

      <Card title="Create Bot" className="p-4" actions={<Button onClick={createBot}>Create</Button>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Template"
            value={template}
            onChange={e=>{
              const v = e.target.value;
              setTemplate(v);
              const t = TEMPLATE_PROMPTS[v];
              if (t) {
                setBehavior(t.behavior);
                setSystem(t.system);
              }
            }}
            options={[
              { value: '', label: 'Select a template' },
              { value: 'support', label: 'Support' },
              { value: 'sales', label: 'Sales' },
              { value: 'appointment', label: 'Appointment' },
              { value: 'qna', label: 'QnA' }
            ]}
          />
          <Input label="Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Display name" />
          <Select
            label="Bot Type"
            value={behavior}
            onChange={e=>setBehavior(e.target.value)}
            options={[
              { value: '', label: 'Behavior' },
              { value: 'support', label: 'Customer Support' },
              { value: 'sales', label: 'Sales' },
              { value: 'appointment', label: 'Appointment Booking' },
              { value: 'qna', label: 'QnA' }
            ]}
          />
          <Input label="Website" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://..." />
          <Select
            label="Tone"
            value={tone}
            onChange={e=>setTone(e.target.value)}
            options={[
              { value: '', label: 'Tone' },
              { value: 'friendly', label: 'Friendly' },
              { value: 'professional', label: 'Professional' },
              { value: 'casual', label: 'Casual' }
            ]}
          />
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-medium text-[var(--text-soft)]">Instructions</label>
            <textarea
              value={system}
              onChange={e=>setSystem(e.target.value)}
              placeholder="Bot instructions / system prompt"
              className="input-base w-full h-28 resize-vertical"
            />
            <p className="text-[10px] text-[var(--text-soft)]">Clear guidance improves answer consistency. Templates provide a starting point.</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your Bots</h2>
        {!filtered.length ? (
          <Card className="p-6 text-center" subtitle="You haven't created any bots yet">
            <p className="text-sm text-[var(--text-soft)] mb-4">Use the form above to create your first assistant. It will appear here for management, embedding and usage tracking.</p>
            <Button onClick={createBot} variant="primary">Create Bot</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => (
              <Card
                key={b.bot_id}
                className="p-4"
                title={b.behavior.charAt(0).toUpperCase()+b.behavior.slice(1)}
                subtitle={b.has_key ? 'Key active' : 'No key'}
              >
                <div className="font-mono text-xs break-all mb-3 select-all">{b.bot_id}</div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/usage/${b.bot_id}`} className="btn-base px-2 py-1 text-xs bg-[var(--accent)] text-white">Usage</Link>
                  <Link href={`/usage/${b.bot_id}`} className="btn-base px-2 py-1 text-xs bg-emerald-600 text-white">Test</Link>
                  <Link href={`/embed/${b.bot_id}`} className="btn-base px-2 py-1 text-xs bg-indigo-600 text-white">Embed</Link>
                  <Link href={`/bots/${b.bot_id}/config`} className="btn-base px-2 py-1 text-xs bg-blue-600 text-white">Config</Link>
                  <Link href={`/bots/${b.bot_id}/calendar`} className="btn-base px-2 py-1 text-xs bg-purple-600 text-white">Calendar</Link>
                  <button onClick={()=>rotateKey(b.bot_id)} className="btn-base px-2 py-1 text-xs bg-neutral-800 text-white">Rotate Key</button>
                  <button onClick={()=>clearData(b.bot_id)} className="btn-base px-2 py-1 text-xs bg-amber-600 text-white">Clear Data</button>
                  <button onClick={()=>deleteBot(b.bot_id)} className="btn-base px-2 py-1 text-xs bg-red-700 text-white">Delete</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
