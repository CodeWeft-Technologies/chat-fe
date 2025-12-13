"use client";
import { use as usePromise, useEffect, useState, useCallback } from "react";

type GEvent = { 
  id?: string;
  summary?: string; 
  start?: { dateTime?: string; date?: string }; 
  end?: { dateTime?: string; date?: string } 
};
type Appointment = {
  id: number;
  summary?: string;
  start_iso: string;
  end_iso: string;
  status: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  info?: Record<string, unknown> | null;
  form_data?: Record<string, unknown> | null;
  event_description?: string | null;
  external_event_id?: string | null;
};

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function BotCalendarPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = usePromise(params as Promise<{ botId: string }>);
  const [org] = useState(() => (typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : ""));
  const [events, setEvents] = useState<GEvent[]>([]);
  const [from, setFrom] = useState<string>(new Date().toISOString());
  const [to, setTo] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() + 7*24*3600*1000).toISOString();
  });
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [view, setView] = useState<"month"|"week"|"day">("week");
  const [now, setNow] = useState<Date>(() => new Date());
  const [calendarId, setCalendarId] = useState<string|null>(null);
  const [tz, setTz] = useState<string|undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const load = useCallback(async () => {
    if (!org) return;
    setBusy(true);
    const headers: Record<string,string> = {};
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    
    // Fetch bookings first to get external_event_ids
    const r2 = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/appointments?org_id=${encodeURIComponent(org)}`, { headers });
    const t2 = await r2.text();
    let bookings: Appointment[] = [];
    const externalEventIds = new Set<string>();
    if (r2.ok) { 
      try { 
        const j2 = JSON.parse(t2); 
        bookings = (j2.appointments||[]) as Appointment[];
        setAppts(bookings);
        // Collect external event IDs to filter duplicates
        bookings.forEach(b => {
          if (b.external_event_id) externalEventIds.add(b.external_event_id);
        });
      } catch {} 
    }
    
    // Fetch Google Calendar events and filter out duplicates
    const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/calendar/events?org_id=${encodeURIComponent(org)}&time_min_iso=${encodeURIComponent(from)}&time_max_iso=${encodeURIComponent(to)}`, { headers });
    const t = await r.text();
    if (!r.ok) { alert(t); return; }
    const j = JSON.parse(t);
    const allEvents = (j.events || []) as GEvent[];
    // Filter out events that are already in bookings
    const filteredEvents = allEvents.filter(ev => !externalEventIds.has(ev.id));
    setEvents(filteredEvents);
    
    setBusy(false);
  }, [org, botId, from, to]);
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => { load(); }, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);
  useEffect(() => {
    const id = setTimeout(() => { load(); }, 0);
    return () => clearTimeout(id);
  }, [load]);
  useEffect(() => {
    const t = setInterval(() => { setNow(new Date()); }, 60000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => { setMounted(true); }, 0);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    try {
      if (mounted && typeof window !== "undefined" && window.innerWidth < 768) {
        const id = setTimeout(() => { setView("day"); }, 0);
        return () => clearTimeout(id);
      }
    } catch {}
  }, [mounted]);
  useEffect(() => {
    async function cfg() {
      try {
        if (!org) return;
        const headers: Record<string,string> = {};
        if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
        const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/calendar/config?org_id=${encodeURIComponent(org)}`, { headers });
        const t = await r.text();
        if (!r.ok) return;
        const j = JSON.parse(t);
        setCalendarId(j.calendar_id || null);
        setTz(j.timezone || undefined);
      } catch {}
    }
    cfg();
  }, [org, botId]);
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const base = new Date();
        if (view === "month") {
          const s = new Date(base.getFullYear(), base.getMonth(), 1);
          const e = new Date(base.getFullYear(), base.getMonth()+1, 0);
          setFrom(s.toISOString());
          setTo(new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59).toISOString());
        } else if (view === "week") {
          const s = new Date(base);
          s.setDate(s.getDate() - s.getDay());
          const e = new Date(s.getTime()); e.setDate(e.getDate() + 6);
          setFrom(s.toISOString()); setTo(new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23,59,59).toISOString());
        } else {
          const s = new Date(base.getFullYear(), base.getMonth(), base.getDate());
          const e = new Date(s.getTime());
          setFrom(s.toISOString()); setTo(new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23,59,59).toISOString());
        }
      } catch {}
    }, 0);
    return () => clearTimeout(id);
  }, [view]);
  const days = (() => {
    try {
      const s = new Date(from);
      const e = new Date(to);
      const out: Array<{ key: string; label: string; date: Date }> = [];
      const cur = new Date(s.getTime());
      while (cur <= e && out.length < 7) {
        const key = cur.toISOString().slice(0,10);
        const label = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(cur);
        out.push({ key, label, date: new Date(cur.getTime()) });
        cur.setDate(cur.getDate() + 1);
      }
      return out;
    } catch {
      return [] as Array<{ key: string; label: string; date: Date }>;
    }
  })();
  // removed selectedDay state; use first day as default for 'day' view
  const hourStart = 0;
  const hourEnd = 24;
  const hourHeight = 40;
  const gridHeight = (hourEnd - hourStart + 1) * hourHeight;
  const timeCol = 64;
  const dayCount = view === "week" ? days.length : 1;
  const dayList = view === "week" ? days : (days.length ? [days[0]] : []);
  function evToBlock(ev: { start: string; end: string; title: string }) {
    const s = new Date(ev.start);
    const e = new Date(ev.end);
    const dkey = s.toISOString().slice(0,10);
    const sh = s.getHours();
    const sm = s.getMinutes();
    const eh = e.getHours();
    const em = e.getMinutes();
    let top = ((sh - hourStart) * 60 + sm) / 60 * hourHeight;
    let h = ((eh * 60 + em) - (sh * 60 + sm)) / 60 * hourHeight;
    if (!isFinite(top) || top < 0) top = 0;
    if (!isFinite(h) || h <= 0) h = hourHeight;
    if (top + h > gridHeight) h = Math.max(10, gridHeight - top);
    return { dkey, top, h, title: ev.title };
  }
  const blocksByDay: Record<string, Array<{ top: number; h: number; title: string; kind: "event" | "appt"; start: string; end: string; id?: number }>> = {};
  for (const d of days) blocksByDay[d.key] = [];
  for (const ev of events) {
    const s = ev.start?.dateTime || ev.start?.date || "";
    const e = ev.end?.dateTime || ev.end?.date || "";
    if (!s || !e) continue;
    const allDay = !!ev.start?.date && !!ev.end?.date && !ev.start?.dateTime && !ev.end?.dateTime;
    if (allDay) {
      const dkey = new Date(s).toISOString().slice(0,10);
      if (blocksByDay[dkey]) blocksByDay[dkey].push({ top: 0, h: gridHeight, title: ev.summary || "(no title)", kind: "event", start: s, end: e });
      continue;
    }
    const b = evToBlock({ start: s, end: e, title: ev.summary || "(no title)" });
    if (blocksByDay[b.dkey]) blocksByDay[b.dkey].push({ top: b.top, h: b.h, title: b.title, kind: "event", start: s, end: e });
  }
  for (const a of appts) {
    if ((a.status || "").toLowerCase() === "cancelled") continue;
    const b = evToBlock({ start: a.start_iso, end: a.end_iso, title: a.summary || `Appointment #${a.id}` });
    if (blocksByDay[b.dkey]) blocksByDay[b.dkey].push({ top: b.top, h: b.h, title: b.title, kind: "appt", start: a.start_iso, end: a.end_iso, id: a.id });
  }
  const [selected, setSelected] = useState<null | { type: "event" | "appt"; id?: number; title: string; start: string; end: string }>(null);
  const selectedAppt = selected?.type === 'appt' && typeof selected.id === 'number'
    ? appts.find(a => a.id === selected.id)
    : null;
  function fmt(dt: string) {
    try { return new Date(dt).toLocaleString(); } catch { return dt; }
  }
  function isTodayKey(k: string) {
    try { return k === new Date().toISOString().slice(0,10); } catch { return false; }
  }
  function prev() {
    try {
      const s = new Date(from);
      if (view === "month") {
        const cur = new Date(s);
        const mStart = new Date(cur.getFullYear(), cur.getMonth()-1, 1);
        const mEnd = new Date(cur.getFullYear(), cur.getMonth(), 0);
        setFrom(mStart.toISOString());
        setTo(new Date(mEnd.getFullYear(), mEnd.getMonth(), mEnd.getDate(), 23,59,59).toISOString());
        return;
      }
      const delta = view === "week" ? 7 : 1;
      s.setDate(s.getDate() - delta);
      const e = new Date(s.getTime());
      e.setDate(e.getDate() + (view === "week" ? 6 : 0));
      setFrom(s.toISOString());
      setTo(e.toISOString());
    } catch {}
  }
  function next() {
    try {
      const s = new Date(from);
      if (view === "month") {
        const cur = new Date(s);
        const mStart = new Date(cur.getFullYear(), cur.getMonth()+1, 1);
        const mEnd = new Date(cur.getFullYear(), cur.getMonth()+2, 0);
        setFrom(mStart.toISOString());
        setTo(new Date(mEnd.getFullYear(), mEnd.getMonth(), mEnd.getDate(), 23,59,59).toISOString());
        return;
      }
      const delta = view === "week" ? 7 : 1;
      s.setDate(s.getDate() + delta);
      const e = new Date(s.getTime());
      e.setDate(e.getDate() + (view === "week" ? 6 : 0));
      setFrom(s.toISOString());
      setTo(e.toISOString());
    } catch {}
  }
  function today() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime());
    if (view === "month") {
      const mEnd = new Date(start.getFullYear(), start.getMonth()+1, 0);
      setFrom(new Date(start.getFullYear(), start.getMonth(), 1).toISOString());
      setTo(new Date(mEnd.getFullYear(), mEnd.getMonth(), mEnd.getDate(), 23,59,59).toISOString());
    } else {
      end.setDate(end.getDate() + (view === "week" ? 6 : 0));
      setFrom(start.toISOString());
      setTo(new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23,59,59).toISOString());
    }
    // no selectedDay state; 'day' view uses first day in computed range
  }
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-black/10 bg-[#0f172a] text-white">
        <div className="p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-600">📅</span>
            <div>
              <div className="text-lg font-semibold">Calendar</div>
              <div className="text-xs opacity-80">{calendarId || 'primary'}{tz ? ` • ${tz}` : ''}</div>
            </div>
          </div>
          <button onClick={load} className="px-3 py-2 rounded-md bg-white/10 text-white text-sm">Refresh</button>
        </div>
        <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
          <button onClick={today} className="px-2 py-1 rounded-md bg-white/10 text-sm">today</button>
          <button onClick={prev} className="px-2 py-1 rounded-md bg-white/10 text-sm">◀</button>
          <button onClick={next} className="px-2 py-1 rounded-md bg-white/10 text-sm">▶</button>
          <div className="ml-auto flex gap-2">
            <select value={view} onChange={(e)=>setView(e.currentTarget.value as ("month"|"week"|"day"))} className="px-2 py-1 rounded-md bg-white/10 text-white text-sm">
              <option value="month">month</option>
              <option value="week">week</option>
              <option value="day">day</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm">From</label>
        <input value={from} onChange={e=>setFrom(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full sm:w-96" />
        <label className="text-sm">To</label>
        <input value={to} onChange={e=>setTo(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full sm:w-96" />
        <button onClick={load} className="px-3 py-2 rounded-md bg-blue-600 text-white">Reload</button>
        <label className="flex items-center gap-2 text-sm ml-auto"><input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)} /> Auto refresh</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)} /> Week preview</label>
        <div className="flex gap-2 ml-auto">
          <button onClick={today} className="px-2 py-1 rounded-md bg-black/10 text-sm">Today</button>
          <button onClick={prev} className="px-2 py-1 rounded-md bg-black/10 text-sm">Prev</button>
          <button onClick={next} className="px-2 py-1 rounded-md bg-black/10 text-sm">Next</button>
          <select value={view} onChange={(e)=>setView(e.currentTarget.value as ("month"|"week"|"day"))} className="px-2 py-1 rounded-md border border-black/10 text-sm">
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
      </div>
      {showGrid && view !== 'month' && (
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          <div className="grid" style={{ gridTemplateRows: `36px ${gridHeight}px`, gridTemplateColumns: `${timeCol}px repeat(${dayCount}, 1fr)` }}>
            <div className="px-2 text-xs text-black/60 flex items-center">All‑day</div>
            {dayList.map((d, i) => (
              <div key={d.key} className={`px-2 text-xs font-semibold flex items-center ${i>0?'border-l':''} border-black/10 ${isTodayKey(d.key) ? 'bg-black/5' : ''}`}>{d.label}</div>
            ))}
            <div className="relative" style={{ height: gridHeight }}>
              {Array.from({ length: hourEnd - hourStart + 1 }).map((_, i) => (
                <div key={i} className="absolute left-0 right-0 border-t border-black/10" style={{ top: i * hourHeight }}>
                  <div className="absolute -translate-y-1/2 left-2 text-[11px] text-black/60">{String(hourStart + i).padStart(2, '0')}:00</div>
                </div>
              ))}
              {mounted ? (() => {
                try { const h = now.getHours(); const m = now.getMinutes(); const t = ((h - hourStart) * 60 + m)/60*hourHeight; return <div className="absolute left-0 right-0" style={{ top: t }}><div className="h-px bg-red-500" /></div>; } catch { return null; }
              })() : null}
            </div>
            {dayList.map((d, i) => {
              const timedBlocks = blocksByDay[d.key].filter(b=>!(b.top===0 && b.h>=gridHeight));
              // Calculate overlaps and assign columns
              const blocksWithColumns = timedBlocks.map((block, idx) => {
                const overlapping = timedBlocks.filter((other, oidx) => 
                  oidx !== idx && 
                  ((block.top >= other.top && block.top < other.top + other.h) ||
                   (block.top + block.h > other.top && block.top + block.h <= other.top + other.h) ||
                   (block.top <= other.top && block.top + block.h >= other.top + other.h))
                );
                return { ...block, overlapCount: overlapping.length + 1, column: overlapping.filter(o => timedBlocks.indexOf(o) < idx).length };
              });
              return (
                <div key={d.key} className={`relative ${i>0?'border-l':''} border-black/10`} style={{ height: gridHeight }}>
                  {Array.from({ length: hourEnd - hourStart + 1 }).map((_, i2) => (
                    <div key={i2} className="absolute left-0 right-0 border-t border-black/10" style={{ top: i2 * hourHeight }} />
                  ))}
                  <div className="absolute left-1 right-1 top-1 space-y-1">
                    {blocksByDay[d.key].filter(b=>b.top===0 && b.h>=gridHeight).map((b, idx) => (
                      <button key={idx} onClick={()=>setSelected({ type: b.kind, id: b.id, title: b.title, start: b.start, end: b.end })} className={`px-2 py-1 rounded-md text-[11px] w-full ${b.kind==='appt' ? 'bg-green-100 text-green-800 border border-green-400 hover:bg-green-200' : 'bg-blue-100 text-blue-800 border border-blue-400 hover:bg-blue-200'}`}>{b.title}</button>
                    ))}
                  </div>
                  {blocksWithColumns.map((b, idx) => {
                    const widthPercent = 100 / b.overlapCount;
                    const leftPercent = (b.column * widthPercent);
                    return (
                      <button key={idx} onClick={()=>setSelected({ type: b.kind, id: b.id, title: b.title, start: b.start, end: b.end })} className={`absolute rounded-md px-1 py-1 text-[10px] shadow-sm text-left overflow-hidden ${b.kind==='appt' ? 'bg-green-100 border border-green-400 text-green-800 hover:bg-green-200' : 'bg-blue-100 border border-blue-400 text-blue-800 hover:bg-blue-200'}`} style={{ top: b.top, height: Math.max(b.h, 20), left: `calc(0.25rem + ${leftPercent}%)`, width: `calc(${widthPercent}% - 0.5rem)` }}>
                        <div className="truncate font-medium">{b.title}</div>
                        <div className="text-[9px] opacity-70 truncate">{new Date(b.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showGrid && view === 'month' && (
        <div className="rounded-xl border border-black/10 bg-[#0f172a] text-white p-4">
          <div className="text-center font-semibold mb-3">
            {(() => { try { const d = new Date(from); return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); } catch { return ''; } })()}
          </div>
          <div className="grid grid-cols-7 gap-[1px] bg-black/20 rounded-md overflow-hidden">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w,i)=> (
              <div key={i} className="p-2 text-xs bg-black/20">{w}</div>
            ))}
            {(() => {
              try {
                const base = new Date(from);
                const mStart = new Date(base.getFullYear(), base.getMonth(), 1);
                const startGrid = new Date(mStart.getTime()); startGrid.setDate(mStart.getDate() - mStart.getDay());
                const cells: Array<{ key: string; inMonth: boolean; date: Date }> = [];
                for (let i=0;i<42;i++) { const d = new Date(startGrid.getTime()); d.setDate(startGrid.getDate()+i); const key = d.toISOString().slice(0,10); const inMonth = d.getMonth() === base.getMonth(); cells.push({ key, inMonth, date: d }); }
                return cells.map((c, idx) => (
                  <div key={idx} className={`relative min-h-24 p-2 ${c.inMonth ? 'bg-black/10' : 'bg-black/5 opacity-70'}`}>
                    <div className="absolute top-2 right-2 text-[11px] opacity-80">{c.date.getDate()}</div>
                    <div className="space-y-1 mt-5">
                      {blocksByDay[c.key].filter(b=>b.top===0 && b.h>=gridHeight).slice(0,3).map((b, i2) => (
                        <button key={i2} onClick={()=>setSelected({ type: b.kind, id: b.id, title: b.title, start: b.start, end: b.end })} className={`px-2 py-1 rounded-md text-[11px] ${b.kind==='appt' ? 'bg-green-600/60 hover:bg-green-600/80' : 'bg-blue-600/60 hover:bg-blue-600/80'}`}>{b.title}</button>
                      ))}
                      {blocksByDay[c.key].filter(b=>b.top===0 && b.h>=gridHeight).length > 3 && (
                        <div className="text-[11px] opacity-80">+{blocksByDay[c.key].filter(b=>b.top===0 && b.h>=gridHeight).length - 3} more</div>
                      )}
                    </div>
                  </div>
                ));
              } catch { return null; }
            })()}
          </div>
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-[95vw] max-w-lg rounded-lg bg-white shadow-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">{selected.type === 'appt' ? 'Appointment' : 'Event'}</div>
              <button onClick={()=>setSelected(null)} className="px-2 py-1 rounded-md bg-black/10">Close</button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div><span className="font-semibold">Title:</span> {selected.title}</div>
              <div><span className="font-semibold">Start:</span> {fmt(selected.start)}</div>
              <div><span className="font-semibold">End:</span> {fmt(selected.end)}</div>
              {selectedAppt && (
                <>
                  <div><span className="font-semibold">ID:</span> {selectedAppt.id}</div>
                  <div><span className="font-semibold">Name:</span> {selectedAppt.name || '—'}</div>
                  <div><span className="font-semibold">Email:</span> {selectedAppt.email || '—'}</div>
                  <div><span className="font-semibold">Phone:</span> {selectedAppt.phone || '—'}</div>
                  <div><span className="font-semibold">Notes:</span> {selectedAppt.notes || '—'}</div>
                  <div><span className="font-semibold">Status:</span> {selectedAppt.status || '—'}</div>
                  {selectedAppt.form_data && Object.keys(selectedAppt.form_data).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="font-semibold mb-2">📋 Form Details:</div>
                      <div className="space-y-1 pl-2">
                        {Object.entries(selectedAppt.form_data).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>{' '}
                            <span className="text-black/70">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedAppt.event_description && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="font-semibold mb-2">📄 Calendar Event Description:</div>
                      <div className="text-sm text-black/70 whitespace-pre-wrap pl-2">
                        {selectedAppt.event_description}
                      </div>
                    </div>
                  )}
                </>
              )}
              {selected.type === 'appt' && typeof selected.id === 'number' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={async()=>{
                    try {
                      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                      if (typeof window !== 'undefined') { const t = localStorage.getItem('token'); if (t) headers['Authorization'] = `Bearer ${t}`; }
                      const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/cancel`, { method: 'POST', headers, body: JSON.stringify({ org_id: org, appointment_id: selected.id }) });
                      if (!r.ok) { alert(await r.text()); return; }
                      setAppts(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'cancelled' } : a));
                      setSelected(null);
                      await load();
                    } catch (e) { alert(String(e||'Failed')); }
                  }} className="px-3 py-2 rounded-md bg-red-600 text-white">Cancel Appointment</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="rounded-xl border border-black/10 bg-white p-4">
        <div className="space-y-2">
          {events.length === 0 && <div className="text-sm text-black/60">No events</div>}
          {Array.isArray(events) && events.map((ev, idx) => {
            const s = ev.start?.dateTime || ev.start?.date || "";
            const e = ev.end?.dateTime || ev.end?.date || "";
            let sf = s, ef = e;
            try { sf = new Date(s).toLocaleString(); ef = new Date(e).toLocaleString(); } catch {}
            return (
              <div key={idx} className="p-3 border border-black/10 rounded-md">
                <div className="text-sm font-semibold">{ev.summary || "(no title)"}</div>
                <div className="text-xs text-black/60">{sf} → {ef}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border border-black/10 bg-white p-4">
        <h2 className="text-lg font-semibold mb-2">Appointments</h2>
        <div className="space-y-2">
          {appts.length === 0 && <div className="text-sm text-black/60">No appointments</div>}
          {Array.isArray(appts) && appts.map((a) => (
            <div key={a.id} className="p-3 border border-black/10 rounded-md">
              <div className="text-sm font-semibold">{a.summary || "Appointment"} <span className="text-xs text-black/60">#{a.id}</span></div>
              <div className="text-xs text-black/60">{a.start_iso} → {a.end_iso} | {a.status}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={async()=>{
                  const headers: Record<string,string> = { "Content-Type": "application/json" };
                  if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
                  const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/cancel`, { method: "POST", headers, body: JSON.stringify({ org_id: org, appointment_id: a.id }) });
                  if (r.ok) {
                    setAppts(prev => prev.map(x => x.id === a.id ? { ...x, status: 'cancelled' } : x));
                    await load();
                  } else { alert(await r.text()); }
                }} className="px-3 py-2 rounded-md bg-red-600 text-white text-sm">Cancel</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Test a booking</h3>
          <TestBooking botId={botId} org={org} onDone={load} />
        </div>
        {busy && <div className="text-xs text-black/60 mt-2">Loading...</div>}
      </div>
    </div>
  );
}

function TestBooking({ botId, org, onDone }: { botId: string; org: string; onDone: () => void }) {
  const [start, setStart] = useState<string>(new Date().toISOString().slice(0,16));
  const [duration, setDuration] = useState<number>(30);
  const [summary, setSummary] = useState<string>("Test appointment");
  async function check() {
    const headers: Record<string,string> = {};
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    const s = new Date(start);
    const e = new Date(s.getTime() + duration*60000);
    const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/availability?org_id=${encodeURIComponent(org)}&time_min_iso=${encodeURIComponent(s.toISOString())}&time_max_iso=${encodeURIComponent(e.toISOString())}`, { headers });
    const t = await r.text();
    if (!r.ok) { alert(t); return; }
    const j = JSON.parse(t);
    alert((j.available?.length || 0) > 0 ? "Available" : "Not available");
  }
  async function book() {
    const headers: Record<string,string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    const s = new Date(start);
    const e = new Date(s.getTime() + duration*60000);
    const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/book`, { method: "POST", headers, body: JSON.stringify({ org_id: org, summary, start_iso: s.toISOString(), end_iso: e.toISOString() }) });
    const t = await r.text();
    if (!r.ok) { alert(t); return; }
    const j = JSON.parse(t);
    alert(`Booked! #${j.appointment_id}`);
    onDone();
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
      <div className="space-y-1">
        <label className="text-xs">Start</label>
        <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full" />
      </div>
      <div className="space-y-1">
        <label className="text-xs">Duration (min)</label>
        <input type="number" value={duration} onChange={e=>setDuration(Number(e.target.value||30))} className="px-3 py-2 rounded-md border border-black/10 w-full" />
      </div>
      <div className="space-y-1">
        <label className="text-xs">Title</label>
        <input value={summary} onChange={e=>setSummary(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full" />
      </div>
      <div className="flex items-end gap-2">
        <button onClick={check} className="px-3 py-2 rounded-md bg-black/80 text-white text-sm">Check</button>
        <button onClick={book} className="px-3 py-2 rounded-md bg-green-600 text-white text-sm">Book</button>
      </div>
    </div>
  );
}
