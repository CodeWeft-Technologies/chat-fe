"use client";
import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!org) return;
    setLoading(true);
    (async () => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
        const s = await fetch(`${B()}/api/usage/summary/${encodeURIComponent(org)}/${encodeURIComponent(botId)}?days=${days}`, { headers });
        const d = await fetch(`${B()}/api/usage/${encodeURIComponent(org)}/${encodeURIComponent(botId)}?days=${days}`, { headers });
        
        if (s.ok) setData(await s.json());
        if (d.ok) {
            const dj = await d.json();
            setDaily(dj.daily || []);
        }
        
        try {
          const k = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key?org_id=${encodeURIComponent(org)}`, { headers });
          if (k.ok) {
              const kj = await k.json();
              setBotKey(kj.public_api_key || null);
          }
        } catch { setBotKey(null); }
      } catch (e) {
        console.error("Failed to load usage data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [org, botId, days]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href={`/bots/${botId}/config`} 
            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-2 transition-colors"
          >
            ← Back to Configuration
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-gray-500">Monitor performance and usage statistics</p>
        </div>
        <div className="flex items-center gap-3">
            <Select
                value={days.toString()}
                onChange={(e) => setDays(Number(e.target.value))}
                options={[
                    { value: "7", label: "Last 7 days" },
                    { value: "30", label: "Last 30 days" },
                    { value: "90", label: "Last 90 days" }
                ]}
                className="w-40"
            />
            <Button 
                variant="destructive"
                onClick={async()=>{
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
                }} 
            >
                Clear Data
            </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading analytics...</p>
        </div>
      ) : !data ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No data available for the selected period</p>
        </div>
      ) : (
        <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Conversations</p>
                        <p className="text-3xl font-bold text-gray-900">{data.chats}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">Helpful Answers</p>
                        <p className="text-3xl font-bold text-green-600">{data.successes}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">No Answer / Fallback</p>
                        <p className="text-3xl font-bold text-amber-600">{data.fallbacks}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">Avg. Confidence</p>
                        <p className="text-3xl font-bold text-blue-600">{Math.round((data.avg_similarity||0)*100)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Conversation Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto pb-2">
                        <Chart daily={daily} />
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Conversations</th>
                                    <th className="px-6 py-3">Helpful</th>
                                    <th className="px-6 py-3">Fallbacks</th>
                                    <th className="px-6 py-3">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {daily.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No activity recorded in this period
                                        </td>
                                    </tr>
                                ) : (
                                    daily.map(d => (
                                        <tr key={d.day} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-900">{d.day}</td>
                                            <td className="px-6 py-3 text-gray-600">{d.chats}</td>
                                            <td className="px-6 py-3 text-green-600">{d.successes}</td>
                                            <td className="px-6 py-3 text-amber-600">{d.fallbacks}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500 rounded-full" 
                                                            style={{ width: `${Math.round((d.avg_similarity||0)*100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500">{Math.round((d.avg_similarity||0)*100)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}

function Chart({ daily }: { daily: DailyEntry[] }) {
  const max = daily.length ? Math.max(...daily.map(d=>d.chats)) : 0;
  
  if (daily.length === 0) return <div className="h-[200px] flex items-center justify-center text-gray-400">No data to display</div>;

  return (
    <div className="w-full h-[200px] flex items-stretch justify-between gap-1 pt-4">
        {daily.map((d) => {
          const barH = max > 0 ? Math.round((d.chats / max) * 100) : 0;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group min-w-[20px]">
                <div className="w-full bg-gray-100 rounded-t-md relative flex-1 flex items-end overflow-hidden group-hover:bg-gray-200 transition-colors">
                    <div 
                        className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t-sm min-h-[1px]"
                        style={{ height: `${barH}%` }}
                        title={`${d.day}: ${d.chats} chats`}
                    />
                </div>
                <span className="text-[10px] text-gray-400 rotate-0 truncate w-full text-center hidden sm:block">
                    {d.day.slice(5)}
                </span>
            </div>
          );
        })}
    </div>
  );
}
