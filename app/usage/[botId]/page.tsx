"use client";
import { useEffect, useState, use as usePromise } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

type UsageSummary = { chats: number; successes: number; fallbacks: number; avg_similarity: number };
type DailyEntry = { day: string; chats: number; successes: number; fallbacks: number; avg_similarity: number };

export default function UsagePage({ params }: { params: Promise<{ botId: string }> }) {
  const [org, setOrg] = useState("");
  useEffect(() => { const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : ""; setOrg(d); }, []);
  const { botId } = usePromise(params as Promise<{ botId: string }>);
  const [data, setData] = useState<UsageSummary | null>(null);
  const [daily, setDaily] = useState<DailyEntry[]>([]);
  const [days, setDays] = useState<number>(30);
  const [botKey, setBotKey] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!org) return;
    (async () => {
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
      const s = await fetch(`${B()}/api/usage/summary/${encodeURIComponent(org)}/${encodeURIComponent(botId)}?days=${days}`, { headers });
      const d = await fetch(`${B()}/api/usage/${encodeURIComponent(org)}/${encodeURIComponent(botId)}?days=${days}`, { headers });
      setData(await s.json());
      const dj = await d.json();
      setDaily(dj.daily || []);
      try {
        const k = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key?org_id=${encodeURIComponent(org)}`, { headers });
        const kj = await k.json();
        setBotKey(kj.public_api_key || null);
      } catch { setBotKey(null); }
    })();
  }, [org, botId, days]);
  async function ask() {
    if (!org) { alert("Missing org"); return; }
    const q = question.trim();
    if (!q) return;
    setAsking(true); setAnswer(""); setSimilarity(null);
    try {
      const headers: Record<string,string> = { 'Content-Type':'application/json' };
      if (typeof window !== 'undefined') { const t = localStorage.getItem('token'); if (t) headers['Authorization'] = `Bearer ${t}`; }
      if (botKey) headers['X-Bot-Key'] = botKey;
      const r = await fetch(`${B()}/api/chat/${encodeURIComponent(botId)}`, { method:'POST', headers, body: JSON.stringify({ message: q, org_id: org }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
      const j = JSON.parse(t);
      setAnswer(j.answer || "");
      setSimilarity(typeof j.similarity === 'number' ? j.similarity : null);
    } catch(e) {
      const msg = e instanceof Error ? e.message : String(e);
      setAnswer(`Error: ${msg}`);
    } finally { setAsking(false); }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Activity</h1>
        <button onClick={async()=>{
          if(!org){ alert('Missing org'); return; }
          if(!confirm('Remove all saved content for this bot? This cannot be undone.')) return;
          try {
            const headers: Record<string,string> = { 'Content-Type':'application/json' };
            if (typeof window !== 'undefined') { const t = localStorage.getItem('token'); if (t) headers['Authorization'] = `Bearer ${t}`; }
            if (botKey) headers['X-Bot-Key'] = botKey;
            const r = await fetch(`${B()}/api/ingest/clear/${encodeURIComponent(botId)}`, { method:'POST', headers, body: JSON.stringify({ org_id: org, confirm: true }) });
            const t = await r.text();
            if(!r.ok){ try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
            const j = JSON.parse(t);
            alert(`Removed ${j.deleted} items`);
            setData({ chats: 0, successes: 0, fallbacks: 0, avg_similarity: 0 });
            setDaily([]);
          } catch(e) {
            const msg = e instanceof Error ? e.message : String(e);
            alert(msg || 'Failed to clear data');
          }
        }} className="px-3 py-2 rounded-md bg-red-600 text-white text-sm shadow hover:bg-red-700 transition">Clear Data</button>
      </div>
      <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Type a test question" className="px-3 py-2 rounded-md border border-black/10 w-full sm:w-96" />
          <button onClick={ask} disabled={asking} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700 transition">{asking? 'Asking...' : 'Ask'}</button>
        </div>
        {!!answer && (
          <div className="mt-3 text-sm">
            <div className="font-semibold mb-1">Answer</div>
            <div className="rounded-md border border-black/10 bg-black/5 p-3 whitespace-pre-wrap">{answer}</div>
            {similarity!=null && <div className="text-xs text-black/60 mt-1">Similarity: {Math.round((similarity||0)*100)/100}</div>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm">Range</label>
        <select value={days} onChange={e=>setDays(Number(e.target.value))} className="px-3 py-2 rounded-md border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>
      {!data ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">
            Conversations: {data.chats} • Helpful Answers: {data.successes} • No‑Answer: {data.fallbacks} • Answer Confidence: {Math.round((data.avg_similarity||0)*100)/100}
          </p>
          <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <Chart daily={daily} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-black/5 text-black/80">
                  <th className="p-2 text-left font-medium">Day</th>
                  <th className="p-2 text-left font-medium">Conversations</th>
                  <th className="p-2 text-left font-medium">Helpful Answers</th>
                  <th className="p-2 text-left font-medium">No‑Answer</th>
                  <th className="p-2 text-left font-medium">Answer Confidence</th>
                </tr>
              </thead>
              <tbody>
                {daily.map(d=> (
                  <tr key={d.day} className="border-t border-black/10 odd:bg-black/5 hover:bg-black/10">
                    <td className="p-2">{d.day}</td>
                    <td className="p-2">{d.chats}</td>
                    <td className="p-2">{d.successes}</td>
                    <td className="p-2">{d.fallbacks}</td>
                    <td className="p-2">{Math.round((d.avg_similarity||0)*100)/100}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Chart({ daily }: { daily: DailyEntry[] }) {
  const max = daily.length ? Math.max(...daily.map(d=>d.chats)) : 0;
  const w = Math.max(320, daily.length * 24);
  const h = 160;
  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h} role="img" aria-label="Daily conversations chart">
        <defs>
          <linearGradient id="barBlue" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
          </linearGradient>
        </defs>
        {daily.map((d, i) => {
          const barH = max > 0 ? Math.round((d.chats / max) * (h - 30)) : 0;
          const x = 20 + i * 24;
          const y = h - 20 - barH;
          return (
            <g key={d.day}>
              <rect x={x} y={y} width={16} height={barH} fill="url(#barBlue)" rx={3} />
              <text x={x+8} y={h-6} textAnchor="middle" fontSize="10" fill="#6b7280">{d.day.slice(5)}</text>
            </g>
          );
        })}
        <line x1={12} y1={h-20} x2={w-8} y2={h-20} stroke="#e5e7eb" />
      </svg>
    </div>
  );
}
