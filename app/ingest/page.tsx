"use client";
import { useState, useEffect, useCallback } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function IngestPage() {
  const [mounted, setMounted] = useState(false);
  const [org, setOrg] = useState("");
  useEffect(() => { setMounted(true); const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : ""; setOrg(d); }, []);
  useEffect(() => { if (org) localStorage.setItem("orgId", org); }, [org]);
  const [bot, setBot] = useState("");
  const [bots, setBots] = useState<{ bot_id: string; name?: string | null }[]>([]);
  const [botKey, setBotKey] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [tab, setTab] = useState<'text'|'qna'|'website'|'pdf'>('pdf');
  const [qna, setQna] = useState<{ q: string; a: string }[]>([]);
  const [qnaCsv, setQnaCsv] = useState<File | null>(null);
  const [addingQna, setAddingQna] = useState(false);

  const loadBots = useCallback(async () => {
    if (!org) return;
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    const r = await fetch(`${B()}/api/bots?org_id=${encodeURIComponent(org)}`, { headers });
    const d = await r.json();
    const arr: { bot_id: string; name?: string | null }[] = (d.bots || []).map((b: { bot_id: string; name?: string | null }) => ({ bot_id: b.bot_id, name: b.name }));
    setBots(arr);
  }, [org]);
  useEffect(() => {
    loadBots();
  }, [loadBots]);

  useEffect(() => {
    (async () => {
      if (!org || !bot) { setBotKey(null); return; }
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
      try {
        const r = await fetch(`${B()}/api/bots/${encodeURIComponent(bot)}/key?org_id=${encodeURIComponent(org)}`, { headers });
        const t = await r.text();
        if (r.ok) { try { const j = JSON.parse(t); setBotKey(j.public_api_key || null); } catch { setBotKey(null); } } else { setBotKey(null); }
      } catch { setBotKey(null); }
    })();
  }, [org, bot]);

  async function ingestText() {
    if (!org || !bot || !text) return;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    if (botKey) headers["X-Bot-Key"] = botKey;
    const r = await fetch(`${B()}/api/ingest/${encodeURIComponent(bot)}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, content: text }) });
    const t = await r.text();
    if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
    const d = JSON.parse(t);
    alert(`Inserted ${d.inserted} chunks`);
  }
  async function ingestQna() {
    if (!org || !bot) { alert("Select org and bot"); return; }
    if (!qna.length) { alert("Add at least one QnA row or upload a CSV"); return; }
    const parts = qna.filter(p=>p.q.trim()&&p.a.trim()).map(p=>`Q: ${p.q.trim()}\nA: ${p.a.trim()}`);
    if (!parts.length) { alert("No valid QnA rows. Please fill both Question and Answer."); return; }
    const content = parts.join("\n\n");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    if (botKey) headers["X-Bot-Key"] = botKey;
    setAddingQna(true);
    try {
      const r = await fetch(`${B()}/api/ingest/${encodeURIComponent(bot)}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, content }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
      const d = JSON.parse(t);
      alert(`Inserted ${d.inserted} chunks`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to ingest QnA");
    } finally {
      setAddingQna(false);
    }
  }
  function addPair() {
    setQna(v=>[...v, { q: "", a: "" }]);
  }
  function removePair(i: number) {
    setQna(v=>v.filter((_,idx)=>idx!==i));
  }
  function updatePair(i: number, field: "q"|"a", val: string) {
    setQna(v=>v.map((p,idx)=>idx===i?{...p,[field]:val}:p));
  }
  async function importCsv(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
    const out: { q: string; a: string }[] = [];
    for (const line of lines) {
      const m = line.split(",");
      const q = (m[0]||"").trim();
      const a = (m[1]||"").trim();
      if (q && a) out.push({ q, a });
    }
    if (out.length) setQna(out);
  }
  async function ingestUrl() {
    if (!org || !bot || !url) return;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    if (botKey) headers["X-Bot-Key"] = botKey;
    const r = await fetch(`${B()}/api/ingest/url/${encodeURIComponent(bot)}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, url: u }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
      const d = JSON.parse(t);
      alert(`Inserted ${d.inserted} chunks`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Failed to ingest URL");
    }
  }
  async function ingestPdf() {
    if (!org || !bot || !pdf) return;
    const fd = new FormData();
    fd.append("org_id", org);
    fd.append("file", pdf);
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    if (botKey) headers["X-Bot-Key"] = botKey;
    const r = await fetch(`${B()}/api/ingest/pdf/${encodeURIComponent(bot)}`, { method: "POST", headers, body: fd });
    const d = await r.json();
    alert(`Inserted ${d.inserted} chunks`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Knowledge</h1>
      </div>
      <div className="rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {mounted && (
            <div className="space-y-2">
              <label className="text-sm">Org</label>
              <input value={org} readOnly className="px-3 py-2 rounded-md border border-black/10 w-full" />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm">Bot</label>
            <select value={bot} onChange={e=>setBot(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a bot</option>
              {bots.map(b => (
                <option key={b.bot_id} value={b.bot_id}>{b.name || b.bot_id}</option>
              ))}
            </select>
            <div className="text-xs text-black/60">{botKey ? 'Bot key active: requests include X-Bot-Key' : 'No bot key: using bearer token'}</div>
          </div>

        </div>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="space-y-2 text-sm text-black/70">
          <div className="font-semibold text-black/80">About Ingestion</div>
          <p>Add knowledge sources that your bot can reference during chat. Paste text, ingest URLs, or upload PDFs. Your organization is fixed to protect access; content is scoped per org and bot.</p>
        </div>
      </div>

      <div className="rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2">
            {(['pdf','text','qna','website'] as const).map(k=> (
              <button key={k} onClick={()=>setTab(k)} className={`px-3 py-2 rounded-md text-sm ${tab===k? 'bg-black/90 text-white' : 'bg-black/5 text-black hover:bg-black/10'}`}>{k.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {tab==='text' && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Add Text</h2>
              <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 text-blue-900 p-3 text-xs">
                Paste plain text. It will be chunked and embedded for retrieval.
              </div>
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste text" className="w-full min-h-32 px-3 py-2 rounded-md border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="mt-3">
                <button onClick={ingestText} className="px-3 py-2 rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 transition">Add Text</button>
              </div>
            </div>
          )}
          {tab==='qna' && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Add QnA</h2>
              <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-900 p-3 text-xs">
                Upload a CSV with two columns: <span className="font-medium">question,answer</span> (header optional) or add rows below. Each row becomes a Q&A pair in your knowledge.
              </div>
              <div className="space-y-3">
                {qna.map((p,i)=> (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input value={p.q} onChange={e=>updatePair(i,'q',e.target.value)} placeholder="Question" className="px-3 py-2 rounded-md border border-black/10 w-full" />
                    <input value={p.a} onChange={e=>updatePair(i,'a',e.target.value)} placeholder="Answer" className="px-3 py-2 rounded-md border border-black/10 w-full" />
                    <div className="md:col-span-2 flex gap-2">
                      <button onClick={()=>removePair(i)} className="px-2 py-1 rounded-md bg-red-600 text-white text-xs">Remove</button>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={addPair} className="px-3 py-2 rounded-md bg-black/80 text-white text-sm">Add Row</button>
                  <input type="file" accept=".csv" onChange={e=>{const f=e.target.files?.[0]||null; setQnaCsv(f); if(f) importCsv(f);}} />
                </div>
                <div>
                  <button onClick={ingestQna} className="px-3 py-2 rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 transition" disabled={addingQna}>{addingQna? 'Adding…' : 'Add QnA'}</button>
                </div>
              </div>
            </div>
          )}
          {tab==='website' && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Add Website</h2>
              <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 text-blue-900 p-3 text-xs">
                Enter a full URL. The page content is fetched and cleaned (AMP and canonical pages considered), then chunked and embedded.
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." className="px-3 py-2 rounded-md border border-black/10 w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={ingestUrl} className="px-3 py-2 rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 transition">Add Website</button>
              </div>
            </div>
          )}
          {tab==='pdf' && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Add PDF</h2>
              <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 text-blue-900 p-3 text-xs">
                Upload a single <span className="font-medium">.pdf</span> file. Text is extracted from all pages and embedded for retrieval.
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input type="file" accept="application/pdf" onChange={e=>setPdf(e.target.files?.[0]||null)} />
                <button onClick={ingestPdf} className="px-3 py-2 rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 transition">Add PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
}
