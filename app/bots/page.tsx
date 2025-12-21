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

type BotItem = { bot_id: string; behavior: string; has_key: boolean; name?: string };

export default function BotsPage() {
  const [mounted, setMounted] = useState(false);
  const [org, setOrg] = useState("");
  useEffect(() => { setMounted(true); const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : ""; setOrg(d); }, []);
  useEffect(() => { if (org) localStorage.setItem("orgId", org); }, [org]);
  
  const [bots, setBots] = useState<BotItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create Form State
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
      setName(""); setBehavior(""); setSystem(""); setWebsite(""); setTone(""); setTemplate("");
      setIsCreating(false);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to create bot");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bots;
    return bots.filter(b => 
      b.bot_id.toLowerCase().includes(q) || 
      b.behavior.toLowerCase().includes(q) ||
      (b.name && b.name.toLowerCase().includes(q))
    );
  }, [bots, search]);

  const getBotIcon = (behavior: string) => {
    switch(behavior.toLowerCase()) {
      case 'sales': return '💼';
      case 'appointment': return '📅';
      case 'support': return '🎧';
      case 'qna': return '❓';
      default: return '🤖';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Assistants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your AI chatbots and their configurations</p>
        </div>
        <div className="flex items-center gap-3">
          {mounted && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 text-xs text-gray-600">
              <span className="font-medium">Org:</span>
              <input 
                value={org} 
                readOnly 
                className="bg-transparent border-none p-0 w-24 focus:ring-0 text-gray-900 font-mono" 
              />
            </div>
          )}
          <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "outline" : "primary"}>
            {isCreating ? "Cancel" : "Create New Bot"}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="animate-in slide-in-from-top-4 duration-200 fade-in">
          <Card className="border-blue-100 shadow-lg ring-1 ring-blue-50 overflow-hidden" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Create New Assistant</h2>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Select
                  label="Quick Template"
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
                    { value: '', label: 'Start from scratch...' },
                    { value: 'support', label: 'Customer Support' },
                    { value: 'sales', label: 'Sales Representative' },
                    { value: 'appointment', label: 'Appointment Scheduler' },
                    { value: 'qna', label: 'Knowledge Base Q&A' }
                  ]}
                  className="bg-blue-50/50"
                />
                
                <Input 
                  label="Bot Name" 
                  value={name} 
                  onChange={e=>setName(e.target.value)} 
                  placeholder="e.g. Sales Assistant" 
                />
                
                <Select
                  label="Core Behavior"
                  value={behavior}
                  onChange={e=>setBehavior(e.target.value)}
                  options={[
                    { value: '', label: 'Select behavior type...' },
                    { value: 'support', label: 'Customer Support' },
                    { value: 'sales', label: 'Sales' },
                    { value: 'appointment', label: 'Appointment Booking' },
                    { value: 'qna', label: 'QnA' }
                  ]}
                />
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Website URL" 
                      value={website} 
                      onChange={e=>setWebsite(e.target.value)} 
                      placeholder="https://example.com" 
                    />
                    <Select
                      label="Tone of Voice"
                      value={tone}
                      onChange={e=>setTone(e.target.value)}
                      options={[
                        { value: '', label: 'Default' },
                        { value: 'friendly', label: 'Friendly & Warm' },
                        { value: 'professional', label: 'Professional & Formal' },
                        { value: 'casual', label: 'Casual & Relaxed' }
                      ]}
                    />
                 </div>
                 
                 <div className="space-y-1">
                    <label className="block text-xs font-medium text-[var(--text-soft)]">System Instructions</label>
                    <textarea
                      value={system}
                      onChange={e=>setSystem(e.target.value)}
                      placeholder="Define how the bot should behave..."
                      className="input-base w-full h-32 resize-none text-sm leading-relaxed"
                    />
                 </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={createBot}>Create Assistant</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            🔍
          </div>
          <Input
            placeholder="Search bots by name or ID..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="ghost" onClick={load} className="text-gray-500 hover:text-gray-900">
          ↻ Refresh List
        </Button>
      </div>

      {/* Bot Grid */}
      {!filtered.length ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900">No bots found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-6">
            {search ? "Try adjusting your search terms." : "Get started by creating your first AI assistant to help your customers."}
          </p>
          {!search && (
            <Button onClick={() => setIsCreating(true)} variant="primary">Create Your First Bot</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(b => (
            <div key={b.bot_id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col overflow-hidden">
              {/* Card Header */}
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center text-xl shadow-sm ring-1 ring-blue-100">
                    {getBotIcon(b.behavior)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${b.has_key ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'}`}>
                    {b.has_key ? 'Active' : 'Draft'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1 truncate" title={b.name || 'Untitled Bot'}>
                  {b.name || 'Untitled Bot'}
                </h3>
                <p className="text-xs text-gray-500 capitalize mb-4">{b.behavior} Assistant</p>
                
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-md border border-gray-100 max-w-full">
                  <span className="text-[10px] text-gray-400 font-mono select-none">ID:</span>
                  <code className="text-[10px] font-mono text-gray-600 truncate flex-1 select-all" title={b.bot_id}>
                    {b.bot_id}
                  </code>
                </div>
              </div>

              {/* Card Actions */}
              <div className="bg-gray-50/50 p-3 grid grid-cols-2 gap-2 border-t border-gray-100">
                <Link 
                  href={`/bots/${b.bot_id}/config`} 
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <span>⚙️</span> Config
                </Link>
                <Link 
                  href={`/embed/${b.bot_id}`} 
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-all shadow-sm group-hover:shadow-blue-100"
                >
                  <span>🚀</span> Embed
                </Link>
                <Link 
                  href={`/bots/${b.bot_id}/leads`} 
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <span>📋</span> Leads
                </Link>
                <Link 
                  href={`/usage/${b.bot_id}`} 
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <span>📊</span> Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
