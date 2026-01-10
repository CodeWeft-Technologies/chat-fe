"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

// Loading Modal Component
function IngestLoadingModal({ isOpen, message }: { isOpen: boolean; message: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-50 duration-200">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
          </div>
          
          {/* Text */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Training Model</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          {/* Pulsing Dots */}
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function IngestPage() {
  const [mounted, setMounted] = useState(false);
  const [org, setOrg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing your data...");
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
    setIsLoading(true);
    setLoadingMessage("Processing your text content...");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
      if (botKey) headers["X-Bot-Key"] = botKey;
      const r = await fetch(`${B()}/api/ingest/${encodeURIComponent(bot)}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, content: text }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
      const d = JSON.parse(t);
      setIsLoading(false);
      alert(`✓ Successfully inserted ${d.inserted} chunks`);
      setText("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIsLoading(false);
      alert("✗ " + (msg || "Failed to ingest text"));
    }
  }
  async function ingestQna() {
    if (!org || !bot) { alert("Select org and bot"); return; }
    if (!qna.length) { alert("Add at least one QnA row or upload a CSV"); return; }
    const parts = qna.filter(p=>p.q.trim()&&p.a.trim()).map(p=>`Q: ${p.q.trim()}\nA: ${p.a.trim()}`);
    if (!parts.length) { alert("No valid QnA rows. Please fill both Question and Answer."); return; }
    const content = parts.join("\n\n");
    setIsLoading(true);
    setLoadingMessage("Training model with Q&A pairs...");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    if (botKey) headers["X-Bot-Key"] = botKey;
    try {
      const r = await fetch(`${B()}/api/ingest/${encodeURIComponent(bot)}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, content }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
      const d = JSON.parse(t);
      setIsLoading(false);
      alert(`✓ Successfully inserted ${d.inserted} chunks`);
      setQna([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIsLoading(false);
      alert("✗ " + (msg || "Failed to ingest Q&A"));
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
  function downloadTemplate() {
    const csvContent = "What is your return policy?,You can return items within 30 days.\nHow do I reset my password?,Go to settings and click reset.";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "qna_template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const out: { q: string; a: string }[] = [];

    for (const line of lines) {
      const parts: string[] = [];
      let current = '';
      let inQuote = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuote && line[i + 1] === '"') {
            current += '"';
            i++; 
          } else {
            inQuote = !inQuote;
          }
        } else if (char === ',' && !inQuote) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim());
      
      const q = (parts[0] || "").trim();
      const a = (parts[1] || "").trim();
      
      if (q && a) out.push({ q, a });
    }
    
    if (out.length) setQna(prev => [...prev, ...out]);
  }
  async function ingestUrl() {
    if (!org || !bot || !url) return;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    setIsLoading(true);
    setLoadingMessage("Fetching and processing website content...");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
      if (botKey) headers["X-Bot-Key"] = botKey;
      const r = await fetch(`${B()}/api/ingest/url/${encodeURIComponent(bot)}`, { method: "POST", headers, body: JSON.stringify({ org_id: org, url: u }) });
      const t = await r.text();
      if (!r.ok) { try { const j = JSON.parse(t); throw new Error(j.detail || t); } catch { throw new Error(t); } }
      const d = JSON.parse(t);
      setIsLoading(false);
      alert(`✓ Successfully inserted ${d.inserted} chunks`);
      setUrl("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIsLoading(false);
      alert("✗ " + (msg || "Failed to ingest URL"));
    }
  }
  async function ingestPdf() {
    if (!org || !bot || !pdf) return;
    setIsLoading(true);
    setLoadingMessage("Extracting and processing PDF content...");
    try {
      const fd = new FormData();
      fd.append("org_id", org);
      fd.append("file", pdf);
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
      if (botKey) headers["X-Bot-Key"] = botKey;
      const r = await fetch(`${B()}/api/ingest/pdf/${encodeURIComponent(bot)}`, { method: "POST", headers, body: fd });
      const d = await r.json();
      setIsLoading(false);
      alert(`✓ Successfully inserted ${d.inserted} chunks`);
      setPdf(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIsLoading(false);
      alert("✗ " + (msg || "Failed to ingest PDF"));
    }
  }

  return (
    <>
      <IngestLoadingModal isOpen={isLoading} message={loadingMessage} />
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">Add content sources for your chatbot to learn from</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Target Bot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mounted && (
                        <Input
                            label="Organization ID"
                            value={org}
                            readOnly
                            className="bg-gray-50 text-gray-500"
                        />
                    )}
                    <Select
                        label="Select Bot"
                        value={bot}
                        onChange={(e) => setBot(e.target.value)}
                        options={[
                            { value: "", label: "Select a bot..." },
                            ...bots.map(b => ({ value: b.bot_id, label: b.name || b.bot_id }))
                        ]}
                        description={botKey ? 'Active API Key found' : 'Using Bearer Token'}
                    />
                </CardContent>
            </Card>

            <Card className="bg-blue-50/50 border-blue-100">
                <CardContent className="p-4 text-sm text-blue-800 space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                        <span>ℹ️</span> About Ingestion
                    </div>
                    <p className="leading-relaxed opacity-90">
                        Content added here is processed, chunked, and stored in the vector database.
                        Your bot uses this knowledge to answer user queries accurately.
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Ingestion Tools */}
        <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/80 rounded-xl gap-1 overflow-x-auto">
                {(['pdf', 'text', 'qna', 'website'] as const).map(k => (
                    <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === k
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                        }`}
                    >
                        {k === 'pdf' && '📄 PDF'}
                        {k === 'text' && '📝 Text'}
                        {k === 'qna' && '💬 Q&A'}
                        {k === 'website' && '🌐 Website'}
                    </button>
                ))}
            </div>

            <Card className="min-h-[400px]">
                <CardContent className="p-6">
                    {tab === 'text' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-gray-900">Paste Text Content</h2>
                                <p className="text-sm text-gray-500">
                                    Directly paste articles, notes, or documentation.
                                </p>
                            </div>
                            <Textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Paste your content here..."
                                className="min-h-[200px] font-mono text-sm"
                            />
                            <div className="flex justify-end">
                                <Button onClick={ingestText} disabled={!text || !bot}>
                                    Process & Save
                                </Button>
                            </div>
                        </div>
                    )}

                    {tab === 'qna' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold text-gray-900">Q&A Pairs</h2>
                                    <p className="text-sm text-gray-500">
                                        Train your bot with specific question-answer examples.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <label className="cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept=".csv" 
                                            className="hidden" 
                                            onChange={e => {
                                                const f = e.target.files?.[0] || null;
                                                // setQnaCsv(f);
                                                if (f) importCsv(f);
                                            }} 
                                        />
                                        <Button variant="outline" asChild>
                                            <span>📂 Import CSV</span>
                                        </Button>
                                    </label>
                                    <Button onClick={addPair} variant="secondary">
                                        + Add Row
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold flex items-center gap-2">
                                        <span>📊</span> CSV Format Guide
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={downloadTemplate} 
                                        className="h-8 text-blue-700 hover:text-blue-900 hover:bg-blue-100 -mr-2"
                                    >
                                        ⬇️ Download Template
                                    </Button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4 text-xs opacity-90">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>Structure:</strong> 2 columns (Question, Answer)</li>
                                        <li><strong>Headers:</strong> Optional (auto-detected as data)</li>
                                    </ul>
                                    <div className="bg-white/50 p-2 rounded border border-blue-100 font-mono">
                                        &quot;What is X?&quot;,&quot;It is Y&quot;<br/>
                                        &quot;How to Z?&quot;,&quot;Step 1...&quot;
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {qna.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                                        <p className="text-gray-400">No pairs added yet. Click &quot;Add Row&quot; or import a CSV.</p>
                                    </div>
                                )}
                                {qna.map((p, i) => (
                                    <div key={i} className="flex gap-3 items-start group">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={p.q}
                                                onChange={e => updatePair(i, 'q', e.target.value)}
                                                placeholder="User asks..."
                                                className="bg-gray-50/50"
                                            />
                                            <Textarea
                                                value={p.a}
                                                onChange={e => updatePair(i, 'a', e.target.value)}
                                                placeholder="Bot answers..."
                                                className="min-h-[60px]"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePair(i)}
                                            className="text-gray-400 hover:text-red-600 mt-1"
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <Button 
                                    onClick={ingestQna} 
                                    disabled={isLoading || qna.length === 0 || !bot}
                                    className="min-w-[120px]"
                                >
                                    {isLoading ? 'Processing...' : 'Save Q&A Pairs'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {tab === 'website' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-gray-900">Crawl Website</h2>
                                <p className="text-sm text-gray-500">
                                    Enter a URL to fetch, clean, and ingest content.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Input
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder="https://example.com/page"
                                        type="url"
                                    />
                                </div>
                                <Button onClick={ingestUrl} disabled={!url || !bot}>
                                    Fetch & Process
                                </Button>
                            </div>
                            <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-100">
                                Note: This will attempt to extract the main content from the page, ignoring navigation and footers where possible.
                            </div>
                        </div>
                    )}

                    {tab === 'pdf' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-gray-900">Upload PDF Document</h2>
                                <p className="text-sm text-gray-500">
                                    Extract text from PDF files for your knowledge base.
                                </p>
                            </div>
                            
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={e => setPdf(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="pdf-upload"
                                />
                                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <span className="text-4xl">📄</span>
                                    <span className="font-medium text-gray-700">
                                        {pdf ? pdf.name : "Click to select a PDF file"}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {pdf ? `${(pdf.size / 1024 / 1024).toFixed(2)} MB` : "Supports standard PDF documents"}
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={ingestPdf} disabled={!pdf || !bot}>
                                    Upload & Process
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      </div>
    </>
  );
}
