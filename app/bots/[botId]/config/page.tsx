"use client";
import { useState, useEffect, use as usePromise, useCallback } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
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
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [rotatedAt, setRotatedAt] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [tz, setTz] = useState<string>("");
  const [slotMin, setSlotMin] = useState<number>(30);
  const [cap, setCap] = useState<number>(1);
  const [minNotice, setMinNotice] = useState<number>(60);
  const [maxFuture, setMaxFuture] = useState<number>(60);
  type Win = { day: string; start: string; end: string };
  const [windowsVal, setWindowsVal] = useState<Win[]>([]);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [rfInput, setRfInput] = useState<string>("");
  const [helper, setHelper] = useState<string>("");
  const [connectBusy, setConnectBusy] = useState<boolean>(false);
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
    try {
      const rcal = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/calendar/config?org_id=${encodeURIComponent(org)}`, { headers });
      const tcal = await rcal.text();
      if (rcal.ok) { const j = JSON.parse(tcal); setCalendarId(j.calendar_id || null); }
    } catch {}
    try {
      const rbs = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/settings?org_id=${encodeURIComponent(org)}`, { headers });
      const tbs = await rbs.text();
      if (rbs.ok) {
        const j = JSON.parse(tbs);
        setTz(j.timezone||"");
        setSlotMin(j.slot_duration_minutes||30);
        setCap(j.capacity_per_slot||1);
        setMinNotice(j.min_notice_minutes||60);
        setMaxFuture(j.max_future_days||60);
        setWindowsVal((j.available_windows||[]) as Win[]);
        setRequiredFields(Array.isArray(j.required_user_fields) ? j.required_user_fields.filter((x: unknown)=>typeof x === 'string') as string[] : []);
      }
    } catch {}
    try {
      const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz && userTZ) setTz(userTZ);
    } catch {}
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
      <div className="rounded-xl border border-black/10 bg-white">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Google Calendar</h2>
              <p className="text-xs text-black/60">Connect your Google account to allow the assistant to check availability and add bookings.</p>
            </div>
            <div className="flex gap-2">
              <a href={`/bots/${botId}/calendar`} className="px-3 py-2 rounded-md bg-purple-600 text-white text-sm">Open Calendar</a>
              <button disabled={!!calendarId || connectBusy} onClick={async()=>{
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
              }} className={`px-3 py-2 rounded-md ${calendarId ? 'bg-gray-300 text-gray-700' : 'bg-green-600 text-white'} text-sm`}>{calendarId ? 'Connected' : (connectBusy ? 'Opening...' : 'Connect')}</button>
            </div>
          </div>
          <div className="text-sm">Calendar: {calendarId || "Not connected"}</div>
        </div>
      </div>
      <div className="rounded-xl border border-black/10 bg-white">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Booking Settings</h2>
              <p className="text-xs text-black/60">Choose how long each appointment is and when you’re available.</p>
            </div>
            <button onClick={async()=>{
              try {
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
                const clean = (windowsVal || []).filter(w => Boolean(w?.day) && Boolean(w?.start) && Boolean(w?.end));
                for (const w of clean) {
                  const [sh, sm] = (w.start || "00:00").split(":").map(x=>parseInt(x,10));
                  const [eh, em] = (w.end || "00:00").split(":").map(x=>parseInt(x,10));
                  if (eh*60+em <= sh*60+sm) { alert(`On ${w.day}, End must be after Start`); return; }
                }
                const payload = { org_id: org, timezone: (tz||undefined), available_windows: (clean.length>0 ? clean : undefined), slot_duration_minutes: slotMin, capacity_per_slot: cap, min_notice_minutes: minNotice, max_future_days: maxFuture, required_user_fields: (requiredFields && requiredFields.length ? requiredFields : undefined) };
                const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/settings`, { method: "POST", headers, body: JSON.stringify(payload) });
                const t = await r.text();
                if (!r.ok) { alert(t); return; }
                const j = JSON.parse(t);
                setTz(j.timezone||""); setSlotMin(j.slot_duration_minutes||30); setCap(j.capacity_per_slot||1); setMinNotice(j.min_notice_minutes||60); setMaxFuture(j.max_future_days||60); setWindowsVal((j.available_windows||[]) as Win[]); setRequiredFields(Array.isArray(j.required_user_fields) ? j.required_user_fields.filter((x: unknown)=>typeof x === 'string') as string[] : []);
                setHelper("Saved! Your availability is updated.");
              } catch (e) { alert(String(e||"Failed")); }
            }} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">Save</button>
          </div>
          {helper && <div className="text-xs text-green-600">{helper}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Timezone</label>
              <input value={tz} onChange={e=>setTz(e.target.value)} placeholder="e.g. America/New_York" className="px-3 py-2 rounded-md border border-black/10 w-full" />
              <button onClick={()=>{ try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone; if (z) setTz(z); } catch {} }} className="mt-1 px-2 py-1 rounded-md bg-black/10 text-xs">Use my timezone</button>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Slot minutes</label>
              <input type="number" value={slotMin} onChange={e=>setSlotMin(Number(e.target.value||30))} className="px-3 py-2 rounded-md border border-black/10 w-full" />
              
            </div>
            <div className="space-y-2">
              <label className="text-sm">Capacity per slot</label>
              <input type="number" value={cap} onChange={e=>setCap(Number(e.target.value||1))} className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Min notice (minutes)</label>
              <input type="number" value={minNotice} onChange={e=>setMinNotice(Number(e.target.value||60))} className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Max future (days)</label>
              <input type="number" value={maxFuture} onChange={e=>setMaxFuture(Number(e.target.value||60))} className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Required user fields (for booking)</label>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {['name','email','phone','notes'].map(f => (
                  <label key={f} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-black/10">
                    <input type="checkbox" checked={requiredFields.includes(f)} onChange={e=>{
                      const on = e.target.checked;
                      setRequiredFields(prev => on ? (prev.includes(f) ? prev : [...prev, f]) : prev.filter(x=>x!==f));
                    }} />
                    {f}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input value={rfInput} onChange={e=>setRfInput(e.target.value)} placeholder="Custom field (e.g. company)" className="px-3 py-2 rounded-md border border-black/10 w-full" />
                <button type="button" onClick={()=>{
                  const v = (rfInput||'').trim();
                  if (!v) return;
                  setRequiredFields(prev => prev.includes(v) ? prev : [...prev, v]);
                  setRfInput('');
                }} className="px-3 py-2 rounded-md bg-black/10">Add</button>
              </div>
              {!!requiredFields.length && (
                <div className="text-xs text-black/60">Required: {requiredFields.join(', ')}</div>
              )}
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Quick Availability</h3>
            <p className="text-xs text-black/60">Pick the days and working hours; we’ll save them for you.</p>
            <Builder value={windowsVal} onChange={useCallback((val)=>setWindowsVal(val), [])} />
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

function Builder({ value, onChange }: { value: Array<{day:string,start:string,end:string}>; onChange: (val: Array<{day:string,start:string,end:string}>) => void }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ Mon:true, Tue:true, Wed:true, Thu:true, Fri:true, Sat:false, Sun:false });
  const [start, setStart] = useState<Record<string, string>>({ Mon:"09:00", Tue:"09:00", Wed:"09:00", Thu:"09:00", Fri:"09:00", Sat:"10:00", Sun:"10:00" });
  const [end, setEnd] = useState<Record<string, string>>({ Mon:"17:00", Tue:"17:00", Wed:"17:00", Thu:"17:00", Fri:"17:00", Sat:"14:00", Sun:"14:00" });
  const times = Array.from({ length: 24 * 2 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    const hh = h < 10 ? `0${h}` : String(h);
    return `${hh}:${m}`;
  });
  useEffect(() => {
    if (Array.isArray(value) && value.length > 0) {
      const en: Record<string, boolean> = { Mon:false, Tue:false, Wed:false, Thu:false, Fri:false, Sat:false, Sun:false };
      const st: Record<string, string> = { ...start };
      const ed: Record<string, string> = { ...end };
      for (const v of value) {
        en[v.day] = true;
        st[v.day] = v.start;
        ed[v.day] = v.end;
      }
      setEnabled(en);
      setStart(st);
      setEnd(ed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const out: Array<{day:string,start:string,end:string}> = [];
    for (const d of days) if (enabled[d]) out.push({ day: d, start: start[d], end: end[d] });
    onChange(out);
  }, [enabled, start, end]);
  function presetMF() {
    const en: Record<string, boolean> = { Mon:true, Tue:true, Wed:true, Thu:true, Fri:true, Sat:false, Sun:false };
    setEnabled(en);
    setStart({ Mon:"09:00", Tue:"09:00", Wed:"09:00", Thu:"09:00", Fri:"09:00", Sat:start.Sat, Sun:start.Sun });
    setEnd({ Mon:"17:00", Tue:"17:00", Wed:"17:00", Thu:"17:00", Fri:"17:00", Sat:end.Sat, Sun:end.Sun });
  }
  function presetAll() {
    const en: Record<string, boolean> = { Mon:true, Tue:true, Wed:true, Thu:true, Fri:true, Sat:true, Sun:true };
    setEnabled(en);
    setStart({ Mon:"09:00", Tue:"09:00", Wed:"09:00", Thu:"09:00", Fri:"09:00", Sat:"09:00", Sun:"09:00" });
    setEnd({ Mon:"17:00", Tue:"17:00", Wed:"17:00", Thu:"17:00", Fri:"17:00", Sat:"17:00", Sun:"17:00" });
  }
  function clearAll() {
    setEnabled({ Mon:false, Tue:false, Wed:false, Thu:false, Fri:false, Sat:false, Sun:false });
  }
  function weekendsOff() {
    setEnabled({ ...enabled, Sat:false, Sun:false });
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={presetMF} className="px-2 py-1 rounded-md bg-black/10 text-xs">Mon–Fri 9–5</button>
        <button type="button" onClick={presetAll} className="px-2 py-1 rounded-md bg-black/10 text-xs">All days 9–5</button>
        <button type="button" onClick={weekendsOff} className="px-2 py-1 rounded-md bg-black/10 text-xs">Weekends off</button>
        <button type="button" onClick={clearAll} className="px-2 py-1 rounded-md bg-black/10 text-xs">Clear</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {days.map((d) => (
          <div className="p-3 border border-black/10 rounded-md" key={d}>
            <label className="text-xs font-semibold flex items-center gap-2"><input type="checkbox" checked={!!enabled[d]} onChange={e=>setEnabled({ ...enabled, [d]: e.target.checked })} /> {d}</label>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs w-10">Start</span>
                <select aria-label={`${d} start time`} disabled={!enabled[d]} value={start[d]} onChange={e=>{
                  setStart({ ...start, [d]: e.target.value });
                }} className="px-2 py-1 rounded-md border border-black/10 w-24 h-8 text-sm">
                  {times.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs w-10">End</span>
                <select aria-label={`${d} end time`} disabled={!enabled[d]} value={end[d]} onChange={e=>{
                  setEnd({ ...end, [d]: e.target.value });
                }} className="px-2 py-1 rounded-md border border-black/10 w-24 h-8 text-sm">
                  {times.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
