"use client";
import { use as usePromise, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

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
  calendar_event_id?: string | null;
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
    try {
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
            if (b.calendar_event_id) externalEventIds.add(b.calendar_event_id);
            });
        } catch {} 
        }
        
        // Fetch Google Calendar events and filter out duplicates
        const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/calendar/events?org_id=${encodeURIComponent(org)}&time_min_iso=${encodeURIComponent(from)}&time_max_iso=${encodeURIComponent(to)}`, { headers });
        const t = await r.text();
        if (!r.ok) { 
            console.error(t); 
        } else {
            const j = JSON.parse(t);
            const allEvents = (j.events || []) as GEvent[];
            // Filter out events that are already in bookings
            const filteredEvents = allEvents.filter(ev => ev.id && !externalEventIds.has(ev.id));
            setEvents(filteredEvents);
        }
    } catch (e) {
        console.error(e);
    }
    
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

  function getLocalDayKey(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const days = (() => {
    try {
      const s = new Date(from);
      const e = new Date(to);
      const out: Array<{ key: string; label: string; date: Date }> = [];
      const cur = new Date(s.getTime());
      while (cur <= e && out.length < 7) {
        const key = getLocalDayKey(cur);
        const label = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(cur);
        out.push({ key, label, date: new Date(cur.getTime()) });
        cur.setDate(cur.getDate() + 1);
      }
      return out;
    } catch {
      return [] as Array<{ key: string; label: string; date: Date }>;
    }
  })();

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
    const dkey = getLocalDayKey(s);
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
      const dkey = getLocalDayKey(new Date(s));
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
    return k === getLocalDayKey(new Date());
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
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          <Link href={`/bots/${botId}/config`} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Calendar & Bookings</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{calendarId || 'primary'}</span>
              {tz && <span>• {tz}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={busy}>
                {busy ? "Refreshing..." : "Refresh"}
            </Button>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button onClick={() => setView("month")} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === "month" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-900"}`}>Month</button>
                <button onClick={() => setView("week")} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === "week" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-900"}`}>Week</button>
                <button onClick={() => setView("day")} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === "day" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-900"}`}>Day</button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-4">
            <Card className="p-4 border-gray-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={today}>Today</Button>
                        <div className="flex items-center rounded-md border border-gray-200 bg-white">
                            <button onClick={prev} className="px-3 py-1.5 hover:bg-gray-50 border-r border-gray-200">◀</button>
                            <button onClick={next} className="px-3 py-1.5 hover:bg-gray-50">▶</button>
                        </div>
                        <span className="text-sm font-medium text-gray-900 ml-2">
                            {(() => { try { const d = new Date(from); return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); } catch { return ''; } })()}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> 
                            Week preview
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> 
                            Auto refresh
                        </label>
                    </div>
                </div>

                {/* Calendar Grid */}
                {showGrid && view !== 'month' && (
                    <div className="rounded-lg border border-gray-100 bg-white overflow-hidden relative">
                    <div className="grid" style={{ gridTemplateRows: `36px ${gridHeight}px`, gridTemplateColumns: `${timeCol}px repeat(${dayCount}, 1fr)` }}>
                        <div className="px-2 text-xs font-medium text-gray-400 flex items-center justify-end border-b border-r border-gray-100 bg-gray-50/50">GMT{new Date().getTimezoneOffset()/60 > 0 ? '-' : '+'}{Math.abs(new Date().getTimezoneOffset()/60)}</div>
                        {dayList.map((d, i) => (
                        <div key={d.key} className={`px-2 text-xs font-semibold flex items-center justify-center border-b border-gray-100 ${i>0?'border-l':''} ${isTodayKey(d.key) ? 'bg-blue-50/50 text-blue-700' : 'text-gray-700'}`}>
                            {d.label}
                        </div>
                        ))}
                        
                        {/* Time labels column */}
                        <div className="relative border-r border-gray-100 bg-gray-50/30" style={{ height: gridHeight }}>
                        {Array.from({ length: hourEnd - hourStart + 1 }).map((_, i) => (
                            <div key={i} className="absolute left-0 right-0" style={{ top: i * hourHeight }}>
                                <div className="absolute -translate-y-1/2 right-2 text-[10px] text-gray-400 font-mono">{String(hourStart + i).padStart(2, '0')}:00</div>
                            </div>
                        ))}
                        </div>

                        {/* Days columns */}
                        {dayList.map((d, i) => {
                        const timedBlocks = blocksByDay[d.key].filter(b=>!(b.top===0 && b.h>=gridHeight));
                        // Calculate overlaps
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
                            <div key={d.key} className={`relative ${i>0?'border-l border-gray-100':''}`} style={{ height: gridHeight }}>
                            {/* Horizontal grid lines */}
                            {Array.from({ length: hourEnd - hourStart + 1 }).map((_, i2) => (
                                <div key={i2} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: i2 * hourHeight }} />
                            ))}
                            
                            {/* All-day events at top */}
                            <div className="absolute left-1 right-1 top-1 space-y-1 z-10">
                                {blocksByDay[d.key].filter(b=>b.top===0 && b.h>=gridHeight).map((b, idx) => (
                                <button key={idx} onClick={()=>setSelected({ type: b.kind, id: b.id, title: b.title, start: b.start, end: b.end })} 
                                    className={`px-2 py-1 rounded text-[10px] font-medium w-full text-left shadow-sm transition-all
                                    ${b.kind==='appt' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'}`}>
                                    {b.title}
                                </button>
                                ))}
                            </div>

                            {/* Timed events */}
                            {blocksWithColumns.map((b, idx) => {
                                const widthPercent = 100 / b.overlapCount;
                                const leftPercent = (b.column * widthPercent);
                                return (
                                <button key={idx} 
                                    onClick={()=>setSelected({ type: b.kind, id: b.id, title: b.title, start: b.start, end: b.end })}
                                    className={`absolute rounded px-2 py-1 text-xs text-left overflow-hidden transition-all hover:z-50 hover:shadow-lg border-l-4 group
                                    ${b.kind==='appt' ? 'bg-emerald-50 text-emerald-900 border-emerald-500 hover:bg-emerald-100' : 'bg-blue-50 text-blue-900 border-blue-500 hover:bg-blue-100'}`}
                                    style={{ top: b.top, height: b.h, width: `${widthPercent}%`, left: `${leftPercent}%`, zIndex: 10 + b.column }}
                                    aria-label={`${b.kind === 'appt' ? 'Appointment' : 'Event'}: ${b.title}`}
                                >
                                    <div className="font-semibold truncate leading-tight">{b.title}</div>
                                    {b.h > 30 && (
                                        <div className="text-[10px] opacity-80 truncate">
                                            {new Date(b.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                    )}
                                    
                                    {/* Hover Details */}
                                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-48 bg-white p-2 rounded shadow-xl border border-gray-200 z-50 text-xs">
                                        <div className="font-bold mb-1">{b.title}</div>
                                        <div>{new Date(b.start).toLocaleTimeString()} - {new Date(b.end).toLocaleTimeString()}</div>
                                    </div>
                                </button>
                                );
                            })}
                            
                            {/* Current time indicator */}
                            {mounted && isTodayKey(d.key) && (() => {
                                try { const h = now.getHours(); const m = now.getMinutes(); const t = ((h - hourStart) * 60 + m)/60*hourHeight; 
                                return (
                                    <div className="absolute left-0 right-0 pointer-events-none z-20" style={{ top: t }}>
                                        <div className="h-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                                        <div className="absolute -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
                                    </div>
                                ); } catch { return null; }
                            })()}
                            </div>
                        );
                        })}
                    </div>
                    </div>
                )}

                {/* Month View */}
                {showGrid && view === 'month' && (
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w,i)=> (
                        <div key={i} className="p-3 text-xs font-semibold text-gray-500 text-center uppercase tracking-wider">{w}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 bg-gray-200 gap-px">
                        {(() => {
                        try {
                            const base = new Date(from);
                            const mStart = new Date(base.getFullYear(), base.getMonth(), 1);
                            const startGrid = new Date(mStart.getTime()); startGrid.setDate(mStart.getDate() - mStart.getDay());
                            const cells: Array<{ key: string; inMonth: boolean; date: Date }> = [];
                            for (let i=0;i<42;i++) { const d = new Date(startGrid.getTime()); d.setDate(startGrid.getDate()+i); const key = d.toISOString().slice(0,10); const inMonth = d.getMonth() === base.getMonth(); cells.push({ key, inMonth, date: d }); }
                            return cells.map((c, idx) => (
                            <div key={idx} className={`relative min-h-[100px] p-2 bg-white ${!c.inMonth ? 'bg-gray-50/50 text-gray-400' : ''}`}>
                                <div className={`text-xs font-medium mb-1 ${c.inMonth ? 'text-gray-700' : 'text-gray-400'}`}>{c.date.getDate()}</div>
                                <div className="space-y-1">
                                {blocksByDay[c.key].filter(b=>b.top===0 && b.h>=gridHeight).slice(0,3).map((b, i2) => (
                                    <button key={i2} onClick={()=>setSelected({ type: b.kind, id: b.id, title: b.title, start: b.start, end: b.end })} 
                                    className={`px-1.5 py-0.5 rounded text-[10px] w-full text-left truncate
                                    ${b.kind==='appt' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {b.title}
                                    </button>
                                ))}
                                {blocksByDay[c.key].filter(b=>b.top===0 && b.h>=gridHeight).length > 3 && (
                                    <div className="text-[10px] text-gray-400 pl-1">+{blocksByDay[c.key].filter(b=>b.top===0 && b.h>=gridHeight).length - 3} more</div>
                                )}
                                </div>
                            </div>
                            ));
                        } catch { return null; }
                        })()}
                    </div>
                    </div>
                )}
            </Card>
        </div>

        <div className="space-y-6">


            <Card title="Upcoming" subtitle="Next 7 days">
                <div className="p-0">
                    {appts.length === 0 && <div className="p-4 text-sm text-gray-500 text-center italic">No upcoming appointments</div>}
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                        {Array.isArray(appts) && appts.map((a) => (
                            <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="font-medium text-sm text-gray-900 line-clamp-1">{a.summary || "Appointment"}</div>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${a.status==='cancelled'?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>{a.status}</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    {new Date(a.start_iso).toLocaleString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-7 text-xs w-full" onClick={()=>setSelected({ type: 'appt', id: a.id, title: a.summary||'Appt', start: a.start_iso, end: a.end_iso })}>View</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="text-lg font-semibold text-gray-900">{selected.type === 'appt' ? 'Appointment Details' : 'Event Details'}</div>
              <button onClick={()=>setSelected(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">{selected.title}</h3>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>{fmt(selected.start)}</span>
                            <span>→</span>
                            <span>{fmt(selected.end)}</span>
                        </div>
                    </div>

                    {selectedAppt && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div><div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</div><div className="text-sm">{selectedAppt.name || '—'}</div></div>
                                <div><div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div><div className="text-sm capitalize">{selectedAppt.status || '—'}</div></div>
                                <div><div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</div><div className="text-sm break-all">{selectedAppt.email || '—'}</div></div>
                                <div><div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</div><div className="text-sm">{selectedAppt.phone || '—'}</div></div>
                            </div>
                            
                            {selectedAppt.notes && (
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Notes</div>
                                    <div className="text-sm bg-white p-2 rounded border border-gray-200">{selectedAppt.notes}</div>
                                </div>
                            )}

                            {selectedAppt.form_data && Object.keys(selectedAppt.form_data).length > 0 && (
                                <div className="pt-2 border-t border-gray-200 mt-2">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Form Data</div>
                                    <div className="space-y-2">
                                        {Object.entries(selectedAppt.form_data).map(([key, value]) => (
                                        <div key={key} className="text-sm grid grid-cols-3 gap-2">
                                            <span className="font-medium text-gray-700 col-span-1">{key.replace(/_/g, ' ')}:</span>
                                            <span className="text-gray-600 col-span-2">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {selected.type === 'appt' && typeof selected.id === 'number' && selectedAppt?.status !== 'cancelled' && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <Button variant="destructive" onClick={async()=>{
                    if(!confirm("Are you sure you want to cancel this appointment?")) return;
                    try {
                      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                      if (typeof window !== 'undefined') { const t = localStorage.getItem('token'); if (t) headers['Authorization'] = `Bearer ${t}`; }
                      const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/booking/cancel`, { method: 'POST', headers, body: JSON.stringify({ org_id: org, appointment_id: selected.id }) });
                      if (!r.ok) { alert(await r.text()); return; }
                      setAppts(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'cancelled' } : a));
                      setSelected(null);
                      await load();
                    } catch (e) { alert(String(e||'Failed')); }
                  }}>Cancel Appointment</Button>
                </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}


