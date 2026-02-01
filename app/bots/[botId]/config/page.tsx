"use client";
import Link from "next/link";
import { useState, useEffect, use as usePromise, useCallback } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import Builder, { type Win } from "./builder";
import QRCode from "qrcode";

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
      'User asks a support question',
      'Bot searches knowledge base for relevant answers',
      'Bot provides helpful, accurate solution',
      'If escalation needed, bot guides to support team'
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
      'User asks about products or pricing',
      'Bot answers with benefits & features',
      'User shows sales intent (demo/pricing request)',
      'Backend detects intent & opens inquiry form automatically',
      'Form captures lead details automatically'
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
      'NEW BOOKING: User wants to book → Backend triggers booking form',
      'RESCHEDULE: User wants to reschedule → Backend triggers reschedule form',
      'CANCEL: User provides appointment ID → Backend processes cancellation',
      'STATUS: User provides appointment ID → Bot returns appointment status',
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
      'User asks any question',
      'Bot searches knowledge base',
      'If found: Bot provides accurate answer',
      'If not found: Bot says "I do not have that information"',
      'No forms or data collection'
    ]
  }
};

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

// Helper function to generate and download QR code
async function downloadQRCode(url: string, filename: string) {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${filename}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating QR code:', error);
    alert('Failed to generate QR code');
  }
}

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
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [formConfig, setFormConfig] = useState<{ email_domains?: string[]; phone_restriction?: string; phone_country_code?: string }>({});
  const [emailDomainsInput, setEmailDomainsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [rotatedAt, setRotatedAt] = useState<string | null>(null);
  const [connectBusy, setConnectBusy] = useState<boolean>(false);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [tz, setTz] = useState<string>("");
  const [slotMin, setSlotMin] = useState<number>(30);
  const [cap, setCap] = useState<number>(1);
  const [minNotice, setMinNotice] = useState<number>(60);
  const [maxFuture, setMaxFuture] = useState<number>(60);
  const [windowsVal, setWindowsVal] = useState<Win[]>([]);
  const [helper, setHelper] = useState<string>("");

  const addService = useCallback(() => {
    if (!newService.trim()) return;
    if (services.includes(newService.trim())) return;
    setServices([...services, newService.trim()]);
    setNewService("");
  }, [services, newService]);

  const removeService = useCallback((index: number) => {
    setServices(services.filter((_, i) => i !== index));
  }, [services]);

  const handleWindowsChange = useCallback((val: Win[]) => {
    setWindowsVal(val);
  }, []);

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
    setServices(d.services || []);
    const fc = d.form_config || {};
    setFormConfig(fc);
    if (fc.email_domains && Array.isArray(fc.email_domains)) {
        setEmailDomainsInput(fc.email_domains.join(', '));
    } else {
        setEmailDomainsInput("");
    }
    setLoading(false);
    const rk = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key?org_id=${encodeURIComponent(org)}`, { headers });
    const kt = await rk.text();
    if (rk.ok) { try { const kj = JSON.parse(kt); setPubKey(kj.public_api_key || null); /* setRotatedAt(kj.rotated_at || null); */ } catch { setPubKey(null); /* setRotatedAt(null); */ } } else { setPubKey(null); /* setRotatedAt(null); */ }
    try {
      const rcal = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/calendar/config?org_id=${encodeURIComponent(org)}`, { headers });
      const tcal = await rcal.text();
      if (rcal.ok) { const j = JSON.parse(tcal); setCalendarId(j.calendar_id || null); } else { setCalendarId(null); }
    } catch { setCalendarId(null); }
    try {
      if (!org) { console.warn("No org_id found, skipping booking settings load"); return; }
      const rbs = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/settings?org_id=${encodeURIComponent(org)}`, { headers });
      const tbs = await rbs.text();
      if (rbs.ok) {
        const j = JSON.parse(tbs);
        setTz(j.timezone||"");
        setSlotMin(j.slot_duration_minutes||30);
        setCap(j.capacity_per_slot||1);
        setMinNotice(j.min_notice_minutes||60);
        setMaxFuture(j.max_future_days||60);
        
        // Handle potentially stringified JSON or null
        let wins = j.available_windows || [];
        if (typeof wins === 'string') {
            try { wins = JSON.parse(wins); } catch {}
        }
        if (!Array.isArray(wins)) wins = [];
        
        // Normalize windows data to ensure clean matching
        const dayMap: Record<string, string> = {
            "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday", "thu": "Thursday", "fri": "Friday", "sat": "Saturday", "sun": "Sunday",
            "monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday", "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday", "sunday": "Sunday"
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wins = wins.map((w: any) => {
            if (!w || typeof w !== 'object') return null;
            let d = String(w.day || "").trim().toLowerCase();
            // Map abbreviations to full names
            if (dayMap[d]) {
                d = dayMap[d];
            } else if (d && d.length > 0) {
                 // Fallback: Ensure proper capitalization
                d = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
            }
            return { ...w, day: d };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).filter((w: any) => w && w.day);

        setWindowsVal(wins as Win[]);
      } else {
        console.error("Failed to load booking settings:", tbs);
      }
    } catch (e) {
        console.error("Load error:", e);
    }
    try {
      const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTz(prev => { if (!prev && userTZ) return userTZ; return prev; });
    } catch {}
  }, [org, botId]);
  useEffect(() => { if (org && botId) { load(); } }, [load, org, botId]);

  const save = useCallback(async () => {
    if (!org || !behavior) { alert("Missing org or bot type"); return; }
    setLoading(true);
    setSaved(false);
    try {
      const allowed = ["support","sales","appointment","qna"];
      const vb = (behavior || "").trim().toLowerCase();
      if (!allowed.includes(vb)) { throw new Error(`Bot type must be one of ${allowed.join(", ")}`); }

      const emailDomains = emailDomainsInput
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);
      
      const finalFormConfig = {
        ...formConfig,
        email_domains: emailDomains.length > 0 ? emailDomains : undefined,
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
      const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/config`, { method: "POST", headers, body: JSON.stringify({ org_id: org, behavior: vb, system_prompt: system, welcome_message: welcome, services: services, form_config: finalFormConfig }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
      const d = JSON.parse(t);
      setBehavior(d.behavior || vb);
      setSystem(d.system_prompt || system);
      setWelcome(d.welcome_message || welcome);
      setServices(d.services || services);
      
      // Update local form config state if returned
      if (d.form_config) {
          // If the backend returns it as string (legacy), parse it, but here it should be dict
          const fc = typeof d.form_config === 'string' ? JSON.parse(d.form_config) : d.form_config;
          setFormConfig(fc);
          if (fc.email_domains && Array.isArray(fc.email_domains)) {
              setEmailDomainsInput(fc.email_domains.join(', '));
          }
      }

      setSaved(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  }, [org, behavior, botId, system, welcome, services, emailDomainsInput, formConfig]);

  const clearData = useCallback(async () => {
    if (!org) { alert("Missing org"); return; }
    if (!confirm("Remove all saved content (ingested documents) for this bot? This cannot be undone.")) return;
    try {
      setLoading(true);
      const keyInfo = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key?org_id=${encodeURIComponent(org)}`, { headers: typeof window !== "undefined" && localStorage.getItem("token") ? {"Authorization": `Bearer ${localStorage.getItem("token")}`} : {} });
      const kt = await keyInfo.text();
      let k = "";
      try { k = JSON.parse(kt).public_api_key; } catch {}
      
      const headers: Record<string, string> = { "Content-Type": "application/json", ...(typeof window !== "undefined" && localStorage.getItem("token") ? {"Authorization": `Bearer ${localStorage.getItem("token")}`} : {}) };
      if (k) { headers["X-Bot-Key"] = k; }
      
      const res = await fetch(`${B()}/api/ingest/clear/${botId}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, confirm: true }) });
      const rt = await res.text();
      const j = JSON.parse(rt);
      alert(`Removed ${j.deleted} items`);
    } catch {
      alert("Failed to clear data");
    } finally {
      setLoading(false);
    }
  }, [org, botId]);

  const deleteBot = useCallback(async () => {
    if (!org) { alert("Missing org"); return; }
    if (!confirm("Delete this bot and ALL of its data? This cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/delete`, { method: "POST", headers: { "Content-Type": "application/json", ...(typeof window !== "undefined" && localStorage.getItem("token") ? {"Authorization": `Bearer ${localStorage.getItem("token")}`} : {}) }, body: JSON.stringify({ org_id: org, confirm: true }) });
      const rt = await res.text();
      const j = JSON.parse(rt);
      const total = Object.values(j.deleted || {}).reduce((a: number, b: unknown) => a + ((b as number) || 0), 0);
      alert(`Bot deleted. Rows removed: ${total}`);
      window.location.href = "/bots";
    } catch {
      alert("Failed to delete bot");
      setLoading(false);
    }
  }, [org, botId]);

  const saveBooking = useCallback(async () => {
    try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
        const clean = (windowsVal || []).filter(w => Boolean(w?.day) && Boolean(w?.start) && Boolean(w?.end));
        for (const w of clean) {
        const [sh, sm] = (w.start || "00:00").split(":").map(x=>parseInt(x,10));
        const [eh, em] = (w.end || "00:00").split(":").map(x=>parseInt(x,10));
        if (eh*60+em <= sh*60+sm) { alert(`On ${w.day}, End must be after Start`); return; }
        }
        const payload = { org_id: org, timezone: (tz||undefined), available_windows: (clean.length>0 ? clean : undefined), slot_duration_minutes: slotMin, capacity_per_slot: cap, min_notice_minutes: minNotice, max_future_days: maxFuture };
        const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/settings`, { method: "POST", headers, body: JSON.stringify(payload) });
        const t = await r.text();
        if (!r.ok) { alert(t); return; }
        const j = JSON.parse(t);
        setTz(j.timezone||""); setSlotMin(j.slot_duration_minutes||30); setCap(j.capacity_per_slot||1); setMinNotice(j.min_notice_minutes||60); setMaxFuture(j.max_future_days||60); setWindowsVal((j.available_windows||[]) as Win[]);
        setHelper("Saved! Your availability is updated.");
        setTimeout(() => setHelper(""), 3000);
    } catch (e) { alert(String(e||"Failed")); }
  }, [org, botId, windowsVal, tz, slotMin, cap, minNotice, maxFuture]);


  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
            <Link href="/bots" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
                ←
            </Link>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bot Configuration</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{botId}</span>
                    <span>•</span>
                    <span className="capitalize">{behavior || "Unknown"} Assistant</span>
                </div>
            </div>
        </div>
        
        {mounted && (
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 text-xs text-gray-600">
                    <span className="font-medium">Org:</span>
                    <span className="font-mono">{org}</span>
                </div>
                <Button variant="outline" onClick={load} className="text-gray-600">↻ Reload</Button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* General Settings */}
            <Card title="General Settings" subtitle="Core behavior and personality" actions={
                <div className="flex items-center gap-3">
                    {saved && <span className="text-xs font-medium text-green-600 animate-in fade-in">Saved!</span>}
                    <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            }>
                <div className="grid grid-cols-1 gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Template"
                            value={['support','sales','appointment','qna'].includes((behavior||'').toLowerCase()) ? (behavior||'') : ''}
                            onChange={e=>{
                                const v=e.target.value; 
                                if(v){ 
                                    setBehavior(v); 
                                    if(v==='support'){setSystem('Answer customer support questions using provided context. Be concise and helpful.');} 
                                    else if(v==='sales'){setSystem('Assist with product questions and sales. Use provided context and be persuasive but honest.');} 
                                    else if(v==='appointment'){setSystem('Help users schedule appointments. Collect required details and respect constraints from provided context.');} 
                                    else if(v==='qna'){setSystem('Answer strictly from the provided Q&A knowledge. If not found, say: "I do not have that information."');} 
                                } 
                            }}
                            options={[
                                { value: '', label: 'Select a template...' },
                                { value: 'support', label: 'Customer Support' },
                                { value: 'sales', label: 'Sales Representative' },
                                { value: 'appointment', label: 'Appointment Booking' },
                                { value: 'qna', label: 'Knowledge Base Q&A' }
                            ]}
                        />
                        <Input 
                            label="Bot Type (Internal ID)" 
                            value={behavior} 
                            onChange={e=>setBehavior(e.target.value)} 
                            placeholder="support / sales / appointment" 
                        />
                    </div>

                    {/* Template Instructions - Show when template is selected */}
                    {behavior && TEMPLATE_INSTRUCTIONS[behavior.toLowerCase()] && (
                      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-4 shadow-sm">
                        <div>
                          <h3 className="text-base font-bold text-blue-900">{TEMPLATE_INSTRUCTIONS[behavior.toLowerCase()].title}</h3>
                          <p className="text-sm text-blue-700 mt-1">{TEMPLATE_INSTRUCTIONS[behavior.toLowerCase()].description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">✨ Key Features</p>
                            <ul className="space-y-1.5">
                              {TEMPLATE_INSTRUCTIONS[behavior.toLowerCase()].features.map((feature, i) => (
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
                              {TEMPLATE_INSTRUCTIONS[behavior.toLowerCase()].workflow.map((step, i) => (
                                <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                                  <span className="text-blue-600 font-medium min-w-[16px]">{i+1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--text-soft)]">System Instructions</label>
                        <textarea 
                            value={system} 
                            onChange={e=>setSystem(e.target.value)} 
                            placeholder="Write detailed guidance and constraints for the bot..." 
                            className="input-base w-full min-h-[160px] resize-y text-sm leading-relaxed font-mono text-gray-800" 
                        />
                        <p className="text-[10px] text-gray-400">These instructions define the bot&apos;s personality and rules.</p>
                        
                        {/* System Instructions Guide */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                          <p className="text-xs font-semibold text-blue-900">💡 How to write better instructions:</p>
                          <ul className="text-xs text-blue-800 space-y-1.5 ml-4 list-disc">
                            <li><strong>Define the role:</strong> &quot;You are a customer support specialist for XYZ company&quot;</li>
                            <li><strong>Set tone:</strong> &quot;Be friendly, professional, and concise in your responses&quot;</li>
                            <li><strong>Add constraints:</strong> &quot;Only answer questions about our products. For billing issues, ask for email.&quot;</li>
                            <li><strong>Provide context:</strong> &quot;Our business hours are 9AM-6PM EST. Recommend support tickets after hours.&quot;</li>
                            <li><strong>Give examples:</strong> &quot;Good response: &#39;That&apos;s a great question! Here&apos;s how...&#39; Bad: &#39;I don&apos;t know&#39;&quot;</li>
                          </ul>
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-xs text-blue-700"><strong>Example:</strong></p>
                            <code className="text-[11px] text-blue-600 block mt-1">You are a helpful support agent for TechCorp. Answer questions about our products using the knowledge base. If you don&apos;t find an answer, be honest and offer to escalate to a human agent. Be friendly but professional.</code>
                          </div>
                        </div>
                    </div>

                    <Input 
                        label="Welcome Message" 
                        value={welcome} 
                        onChange={e=>setWelcome(e.target.value)} 
                        placeholder="e.g. Hello! How can I help you today?" 
                    />
                </div>
            </Card>

            {/* Services Configuration */}
            {(behavior || '').toLowerCase() === 'sales' && (
            <Card title="Enquiry Form Services" subtitle="Services available for selection in lead forms" actions={
                <div className="flex items-center gap-3">
                    {saved && <span className="text-xs font-medium text-green-600 animate-in fade-in">Saved!</span>}
                    <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save Services'}</Button>
                </div>
            }>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            value={newService} 
                            onChange={e=>setNewService(e.target.value)} 
                            placeholder="Add a new service..." 
                            onKeyDown={e=>{if(e.key==='Enter'){addService()}}}
                        />
                        <Button onClick={addService} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {services.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                <span>{s}</span>
                                <button onClick={()=>removeService(i)} className="text-gray-500 hover:text-red-500 font-bold">&times;</button>
                            </div>
                        ))}
                        {services.length === 0 && <p className="text-sm text-gray-400 italic">No services added yet.</p>}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Input Restrictions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Input
                                    label="Allowed Email Domains"
                                    value={emailDomainsInput}
                                    onChange={e => setEmailDomainsInput(e.target.value)}
                                    placeholder="e.g. gmail.com, company.com"
                                />
                                <p className="text-[10px] text-gray-400">Comma-separated list. Leave empty to allow all.</p>
                            </div>
                            <Select
                                label="Phone Number Restriction"
                                value={formConfig.phone_restriction || ""}
                                onChange={e => setFormConfig({...formConfig, phone_restriction: e.target.value})}
                                options={[
                                    { value: "", label: "No Restriction" },
                                    { value: "digits_only", label: "Digits Only" },
                                    { value: "10_digits", label: "Exactly 10 Digits" },
                                    { value: "10_plus_digits", label: "10 or more Digits" }
                                ]}
                            />
                            <Select
                                label="Country Code"
                                value={formConfig.phone_country_code || ""}
                                onChange={e => setFormConfig({...formConfig, phone_country_code: e.target.value})}
                                options={[
                                    { value: "", label: "No Country Code" },
                                    { value: "+1", label: "US/Canada (+1)" },
                                    { value: "+44", label: "UK (+44)" },
                                    { value: "+91", label: "India (+91)" },
                                    { value: "+61", label: "Australia (+61)" },
                                    { value: "+49", label: "Germany (+49)" },
                                    { value: "+33", label: "France (+33)" },
                                    { value: "+81", label: "Japan (+81)" },
                                    { value: "+86", label: "China (+86)" },
                                    { value: "+55", label: "Brazil (+55)" },
                                    { value: "+971", label: "UAE (+971)" }
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </Card>
            )}

            {/* Booking Settings */}
            {(behavior || '').toLowerCase() === 'appointment' && (
            <Card title="Booking Configuration" subtitle="Availability and constraints" actions={<Button onClick={saveBooking} variant="outline">Update Settings</Button>}>
                <div className="space-y-6">
                    {helper && <div className="p-2 bg-green-50 text-green-700 text-xs rounded border border-green-100">{helper}</div>}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <label className="text-xs font-medium text-gray-700">Timezone</label>
                             <select value={tz} onChange={e=>setTz(e.target.value)} className="input-base w-full h-10">
                                <option value="">Select timezone...</option>
                                {tz && !["Asia/Kolkata","America/New_York","America/Los_Angeles","America/Chicago","Europe/London","Europe/Paris","Asia/Tokyo","Asia/Shanghai","Australia/Sydney","UTC","Asia/Dubai","Asia/Singapore","Asia/Hong_Kong","Asia/Seoul","Asia/Bangkok","Europe/Berlin","Europe/Amsterdam","Europe/Moscow","America/Toronto","America/Denver","America/Phoenix","America/Sao_Paulo","America/Mexico_City","Pacific/Auckland","Pacific/Fiji","Pacific/Honolulu"].includes(tz) && (
                                <option value={tz}>✓ {tz} (Custom)</option>
                                )}
                                <optgroup label="Common">
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">New York</option>
                                    <option value="America/Los_Angeles">Los Angeles</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Asia/Tokyo">Tokyo</option>
                                </optgroup>
                                <optgroup label="Asia">
                                    <option value="Asia/Kolkata">Kolkata (IST)</option>
                                    <option value="Asia/Dubai">Dubai</option>
                                    <option value="Asia/Singapore">Singapore</option>
                                </optgroup>
                                <optgroup label="Europe">
                                    <option value="Europe/Paris">Paris</option>
                                    <option value="Europe/Berlin">Berlin</option>
                                </optgroup>
                             </select>
                             <div className="flex justify-between items-center">
                                <p className="text-[10px] text-gray-500">Bot operates in this timezone.</p>
                                <button type="button" onClick={()=>{try{const z=Intl.DateTimeFormat().resolvedOptions().timeZone;if(z){setTz(z);}}catch{}}} className="text-[10px] text-blue-600 hover:underline">
                                    Detect My Timezone
                                </button>
                             </div>
                        </div>
                        <Input 
                            type="number" 
                            label="Slot Duration (min)" 
                            description="Length of each appointment slot."
                            value={slotMin} 
                            onChange={e=>setSlotMin(Number(e.target.value||30))} 
                        />
                        <Input 
                            type="number" 
                            label="Capacity per Slot" 
                            description="Max bookings allowed per time slot."
                            value={cap} 
                            onChange={e=>setCap(Number(e.target.value||1))} 
                            min={1} 
                        />
                        <Input 
                            type="number" 
                            label="Min Notice (min)" 
                            description="Minimum time before booking allowed."
                            value={minNotice} 
                            onChange={e=>setMinNotice(Number(e.target.value||60))} 
                            min={0} 
                        />
                        <Input 
                            type="number" 
                            label="Max Future (days)" 
                            description="How far in advance users can book."
                            value={maxFuture} 
                            onChange={e=>setMaxFuture(Number(e.target.value||60))} 
                            min={1} 
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Weekly Schedule</h4>
                                <p className="text-xs text-gray-500">
                                    {windowsVal.length > 0 
                                        ? `Currently active on ${windowsVal.length} days.` 
                                        : "No active days set (Bot is unavailable)."}
                                </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                                {windowsVal.length > 0 ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <Builder value={windowsVal} onChange={handleWindowsChange} />
                    </div>
                </div>
            </Card>
            )}

            {/* Danger Zone */}
            <Card title="Danger Zone" className="border-red-100 bg-red-50/20" padding="md">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                        <h4 className="text-sm font-medium text-red-900">Clear Knowledge Base</h4>
                        <p className="text-xs text-red-700/70">Remove all ingested documents and vectors.</p>
                        </div>
                        <Button onClick={clearData} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300">Clear Data</Button>
                    </div>
                    <div className="h-px bg-red-100" />
                    <div className="flex items-center justify-between">
                        <div>
                        <h4 className="text-sm font-medium text-red-900">Delete Assistant</h4>
                        <p className="text-xs text-red-700/70">Permanently delete this bot and all its history.</p>
                        </div>
                        <Button onClick={deleteBot} className="bg-red-600 hover:bg-red-700 text-white border-none shadow-none">Delete Bot</Button>
                    </div>
                </div>
            </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card title="Quick Actions" subtitle="Manage your bot">
                <div className="grid grid-cols-2 gap-3">
                    <Link href={`/usage/${botId}`} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                        <span className="text-xs font-medium">Analytics</span>
                    </Link>
                    <Link href={`/embed/${botId}`} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🔌</span>
                        <span className="text-xs font-medium">Embed</span>
                    </Link>
                    {(behavior || '').toLowerCase() === 'appointment' && (
                    <>
                    <Link href={`/bots/${botId}/calendar`} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                        <span className="text-xs font-medium">Calendar</span>
                    </Link>
                    <Link href={`/bots/${botId}/form-builder`} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                        <span className="text-xs font-medium">Forms</span>
                    </Link>
                    </>
                    )}
                </div>
            </Card>

            {/* Integrations */}
            <Card title="Integrations" subtitle="Connect external services">
                <div className="space-y-4">
                    {(behavior || '').toLowerCase() === 'appointment' && (
                    <>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📅</span>
                                <span className="text-sm font-medium">Google Calendar</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${calendarId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            {calendarId ? `Connected: ${calendarId}` : "Not connected. Required for appointment booking."}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <Link href={`/bots/${botId}/calendar`} className="btn-base px-3 py-1.5 text-xs text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md shadow-sm">
                                View Calendar
                            </Link>
                            <button 
                                disabled={connectBusy} 
                                onClick={async()=>{
                                    try {
                                    setConnectBusy(true);
                                    const headers: Record<string,string> = {};
                                    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
                                    const cb = `${window.location.origin}/oauth/google/callback`;
                                    const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/calendar/google/oauth/start?org_id=${encodeURIComponent(org)}&redirect_uri=${encodeURIComponent(cb)}`, { headers });
                                    const t = await r.text();
                                    if (!r.ok) { alert(t); return; }
                                    const j = JSON.parse(t);
                                    window.location.href = j.url;
                                    } finally {
                                    setConnectBusy(false);
                                    }
                                }} 
                                className={`px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-sm transition-all ${calendarId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {connectBusy ? '...' : (calendarId ? 'Reconnect' : 'Connect')}
                            </button>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                         <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📋</span>
                                <span className="text-sm font-medium">Form Builder</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Customize intake forms and booking questions.</p>
                        <Link href={`/bots/${botId}/form-builder`} className="block w-full btn-base px-3 py-1.5 text-xs text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md shadow-sm">
                            Open Form Builder
                        </Link>
                    </div>
                    </>
                    )}
                    {(behavior || '').toLowerCase() !== 'appointment' && (
                        <p className="text-sm text-gray-400 italic text-center py-4">No integrations available for this bot type.</p>
                    )}
                </div>
            </Card>

            {/* API Key */}
            <Card title="Public API Access" subtitle="For embedding on websites">
                <div className="space-y-4">
                     <div className="relative">
                        <Input 
                            readOnly 
                            value={pubKey || ""} 
                            placeholder="No active key" 
                            className="pr-16 font-mono text-xs bg-gray-50" 
                        />
                        <button 
                            onClick={async()=>{
                                const k = pubKey || "";
                                if(!k) return;
                                try { await navigator.clipboard.writeText(k); alert("Key copied"); } catch {}
                            }} 
                            disabled={!pubKey}
                            className="absolute right-1 top-1 bottom-1 px-3 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50"
                        >
                            COPY
                        </button>
                     </div>
                     
                     <div className="flex gap-2">
                        <button onClick={async()=>{
                            const headers: Record<string, string> = { "Content-Type": "application/json" };
                            if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
                            if(!confirm("Rotate the public API key? Old embeds will stop working.")) return;
                            const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key/rotate`, { method: "POST", headers, body: JSON.stringify({ org_id: org }) });
                            const j = await r.json();
                            setPubKey(j.public_api_key || null);
                            setRotatedAt(j.rotated_at || null);
                        }} className="flex-1 px-3 py-2 rounded-md bg-gray-900 text-white text-xs hover:bg-black transition-colors">
                            Rotate Key
                        </button>
                        <button onClick={async()=>{
                            const headers: Record<string, string> = { "Content-Type": "application/json" };
                            if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
                            if(!confirm("Revoke the public API key? Public embeds will be disabled.")) return;
                            await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key/revoke`, { method: "POST", headers, body: JSON.stringify({ org_id: org }) });
                            setPubKey(null);
                            setRotatedAt(null);
                        }} className="px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-100 text-xs hover:bg-red-100 transition-colors">
                            Revoke
                        </button>
                     </div>

                     {rotatedAt && (
                        <p className="text-[10px] text-gray-400 text-center">
                            Last rotated: {new Date(rotatedAt).toLocaleDateString()}
                        </p>
                     )}
                </div>
            </Card>

            {/* Form Links Section */}
            {behavior && ['sales', 'appointment'].includes(behavior.toLowerCase()) && (
              <Card 
                title="Form Links" 
                subtitle={`${behavior === 'sales' ? 'Enquiry form' : 'Booking & scheduling forms'} for external use`}
              >
                <div className="space-y-4">
                  {behavior === 'sales' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">💼 Enquiry Form</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Sales</span>
                      </div>
                      <div className="relative">
                        <Input 
                          readOnly 
                          value={`${B()}/api/form/lead/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`} 
                          className="pr-28 font-mono text-xs bg-gray-50" 
                        />
                        <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                          <button 
                            onClick={async()=>{
                              const link = `${B()}/api/form/lead/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                              await downloadQRCode(link, 'enquiry-form');
                            }}
                            className="px-2 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-purple-600 hover:border-purple-200"
                            title="Download QR Code"
                          >
                            QR
                          </button>
                          <button 
                            onClick={async()=>{
                              const link = `${B()}/api/form/lead/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                              try { 
                                await navigator.clipboard.writeText(link); 
                                alert("Enquiry form link copied!"); 
                              } catch {}
                            }}
                            className="px-3 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-200"
                          >
                            COPY
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Captures lead information including name, email, phone, and service interests
                      </p>
                    </div>
                  )}

                  {behavior === 'appointment' && (
                    <div className="space-y-4">
                      {/* Booking Form */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">📅 Appointment Booking Form</span>
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Book</span>
                        </div>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={`${B()}/api/form/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`} 
                            className="pr-28 font-mono text-xs bg-gray-50" 
                          />
                          <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                            <button 
                              onClick={async()=>{
                                const link = `${B()}/api/form/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                                await downloadQRCode(link, 'booking-form');
                              }}
                              className="px-2 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-purple-600 hover:border-purple-200"
                              title="Download QR Code"
                            >
                              QR
                            </button>
                            <button 
                              onClick={async()=>{
                                const link = `${B()}/api/form/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                                try { 
                                  await navigator.clipboard.writeText(link); 
                                  alert("Booking form link copied!"); 
                                } catch {}
                              }}
                              className="px-3 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-200"
                            >
                              COPY
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          For users to schedule new appointments with available time slots
                        </p>
                      </div>

                      {/* Reschedule Form */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">🔄 Appointment Reschedule Form</span>
                          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">Reschedule</span>
                        </div>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={`${B()}/api/reschedule/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`} 
                            className="pr-28 font-mono text-xs bg-gray-50" 
                          />
                          <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                            <button 
                              onClick={async()=>{
                                const link = `${B()}/api/reschedule/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                                await downloadQRCode(link, 'reschedule-form');
                              }}
                              className="px-2 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-purple-600 hover:border-purple-200"
                              title="Download QR Code"
                            >
                              QR
                            </button>
                            <button 
                              onClick={async()=>{
                                const link = `${B()}/api/reschedule/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                                try { 
                                  await navigator.clipboard.writeText(link); 
                                  alert("Reschedule form link copied!"); 
                                } catch {}
                              }}
                              className="px-3 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-200"
                            >
                              COPY
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          For users to modify existing appointment times (requires appointment ID)
                        </p>
                      </div>

                      {/* Unified Appointment Portal */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">🎯 Unified Appointment Portal</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Standalone</span>
                        </div>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={`${B()}/api/appointment-portal/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`} 
                            className="pr-28 font-mono text-xs bg-gray-50" 
                          />
                          <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                            <button 
                              onClick={async()=>{
                                const link = `${B()}/api/appointment-portal/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                                await downloadQRCode(link, 'appointment-portal');
                              }}
                              className="px-2 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-purple-600 hover:border-purple-200"
                              title="Download QR Code"
                            >
                              QR
                            </button>
                            <button 
                              onClick={async()=>{
                                const link = `${B()}/api/appointment-portal/${botId}?org_id=${org}&bot_key=${pubKey || '{bot_key}'}`;
                                try { 
                                  await navigator.clipboard.writeText(link); 
                                  alert("Unified appointment portal link copied!"); 
                                } catch {}
                              }}
                              className="px-3 text-[10px] font-medium bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-200"
                            >
                              COPY
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Standalone appointment portal:</strong> No login required • Contains booking and reschedule form links • Status checking and cancellation • Perfect for sharing with external customers
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded">📅 Book</span>
                          <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded">🔄 Reschedule</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">📋 Status</span>
                          <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">❌ Cancel</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
        </div>
        {/* Sidebar Column - if needed in future */}
        {/* <div className="space-y-6">
        </div> */}
      </div>
    </div>
  );
}


