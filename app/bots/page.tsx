"use client";
import Link from "next/link";
import { useCallback, useState, useEffect, useMemo } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { apiCall } from "../lib/api";

const TEMPLATE_PROMPTS: Record<string, { behavior: string; system: string }> = {
  support: {
    behavior: 'support',
    system: 'You are a Support Assistant. Answer customer support questions in 1-2 short sentences using the knowledge base. Be helpful and accurate. Do not collect user information—never ask for email, name, or contact details. If users need to escalate, guide them to contact the support team directly.'
  },
  sales: {
    behavior: 'sales',
    system: 'You are a Sales Assistant. Answer product questions briefly (1-2 sentences) and highlight benefits. Do NOT collect user information or ask for details. When users show sales intent (request demo, pricing inquiry, consultation request, "contact us"), the backend detects the intent and automatically triggers an inquiry form—you will see it open. Your job is to answer questions; the inquiry form handles all lead capture. Never collect emails, names, or contact details in chat.'
  },
  appointment: {
    behavior: 'appointment',
    system: 'You are an Appointment Scheduler. Handle 4 types of requests:\n1. NEW BOOKING: When users want to book, the backend triggers a booking form (no form fields in chat)\n2. RESCHEDULE: When users want to reschedule, the backend triggers a reschedule form (no form fields in chat)\n3. CANCEL: When users want to cancel, ask for the appointment ID (e.g., "Cancel appointment ID 1"), then the backend triggers cancellation\n4. STATUS: When users check appointment status, ask for the appointment ID (e.g., "Status of appointment ID 1"), then provide status\n\nAlways answer timing/availability questions in 1-2 sentences. Do NOT collect details (name, email, date, time) in chat—let backend-triggered forms handle all bookings and rescheduling.'
  },
  qna: {
    behavior: 'qna',
    system: 'You are a Q&A Assistant. Answer questions in 1-2 short sentences using ONLY the knowledge base. Never invent information. Do not collect user details. If the answer is not in the knowledge base, say: "I don\'t have that information." Keep responses concise and accurate.'
  }
};

const TEMPLATE_INSTRUCTIONS: Record<string, { title: string; description: string; features: string[]; workflow: string[] }> = {
  support: {
    title: '🎧 Customer Support Assistant',
    description: 'Answer support questions from your knowledge base and help users troubleshoot issues.',
    features: [
      'Knowledge base powered answers',
      'Quick, concise responses (1-2 sentences)',
      'Automatic escalation guidance',
      'No form collection in chat'
    ],
    workflow: [
      '1. User asks a support question',
      '2. Bot searches knowledge base for relevant answers',
      '3. Bot provides helpful, accurate solution',
      '4. If escalation needed, bot guides to support team'
    ]
  },
  sales: {
    title: '💼 Sales Representative',
    description: 'Answer product questions, highlight benefits, and automatically capture leads through backend-triggered forms.',
    features: [
      'Product Q&A focused responses',
      'Automatic lead capture form (backend-triggered)',
      'Intent detection (demo, pricing, consultation)',
      'No manual form filling in chat'
    ],
    workflow: [
      '1. User asks about products or pricing',
      '2. Bot answers with benefits & features',
      '3. User shows sales intent (demo/pricing request)',
      '4. Backend detects intent & opens inquiry form automatically',
      '5. Form captures lead details automatically'
    ]
  },
  appointment: {
    title: '📅 Appointment Scheduler',
    description: 'Handle booking, rescheduling, cancellation, and status checks with automatic backend-triggered forms.',
    features: [
      '4 workflow types (book, reschedule, cancel, status)',
      'Automatic form triggering (no chat form fields)',
      'Appointment ID verification for cancellations & status',
      'Availability & timing answers'
    ],
    workflow: [
      '1. NEW BOOKING: User wants to book → Backend triggers booking form',
      '2. RESCHEDULE: User wants to reschedule → Backend triggers reschedule form',
      '3. CANCEL: User provides appointment ID → Backend processes cancellation',
      '4. STATUS: User provides appointment ID → Bot returns appointment status',
      'All date/time collection happens in forms, not in chat'
    ]
  },
  qna: {
    title: '❓ Knowledge Base Q&A',
    description: 'Answer questions using only information from your knowledge base. Perfect for FAQ and documentation.',
    features: [
      'Knowledge base only answers',
      'No invented or external information',
      'Concise responses (1-2 sentences)',
      'Clear "not found" responses'
    ],
    workflow: [
      '1. User asks any question',
      '2. Bot searches knowledge base',
      '3. If found: Bot provides accurate answer',
      '4. If not found: Bot says "I don\'t have that information"',
      '5. No forms or data collection'
    ]
  }
};

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

  const load = useCallback(async () => {
    if (!org) return;
    const d = await apiCall<{ bots: BotItem[] }>(`/api/bots?org_id=${encodeURIComponent(org)}`);
    setBots(d.bots || []);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);
  
  async function createBot() {
    if (!org) { alert("Set Org ID"); return; }
    if (!behavior) { alert("Select a behavior"); return; }
    try {
      await apiCall(`/api/bots`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ org_id: org, behavior, system_prompt: system || null, name: name || null, website_url: website || null, tone: tone || null }) });
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
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">My Assistants</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your AI chatbots and their configurations</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {mounted && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 text-xs text-gray-600">
              <span className="font-medium">Org:</span>
              <input 
                value={org} 
                readOnly 
                className="bg-transparent border-none p-0 w-24 focus:ring-0 text-gray-900 font-mono" 
              />
            </div>
          )}
          <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "outline" : "primary"} className="w-full sm:w-auto">
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
            
            {/* Template Selector */}
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
            
            {/* Template Instructions - Full Width */}
            {template && TEMPLATE_INSTRUCTIONS[template] && (
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-4 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-blue-900">{TEMPLATE_INSTRUCTIONS[template].title}</h3>
                  <p className="text-sm text-blue-700 mt-1">{TEMPLATE_INSTRUCTIONS[template].description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">✨ Key Features</p>
                    <ul className="space-y-1.5">
                      {TEMPLATE_INSTRUCTIONS[template].features.map((feature, i) => (
                        <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">🔄 How It Works</p>
                    <ul className="space-y-1.5">
                      {TEMPLATE_INSTRUCTIONS[template].workflow.map((step, i) => (
                        <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 font-medium min-w-[16px]">{step.startsWith(String(i+1)) ? '' : `${i+1}.`}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
        <div className="text-center py-12 sm:py-20 bg-gray-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 px-4">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤖</div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900">No bots found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-4 sm:mb-6">
            {search ? "Try adjusting your search terms." : "Get started by creating your first AI assistant to help your customers."}
          </p>
          {!search && (
            <Button onClick={() => setIsCreating(true)} variant="primary" className="w-full sm:w-auto">Create Your First Bot</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
