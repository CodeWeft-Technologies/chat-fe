"use client";
import Link from "next/link";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { useEffect, useState, useCallback } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function Home() {
  const [org, setOrg] = useState("");
  useEffect(() => {
    const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : "";
    const t = setTimeout(() => { setOrg(d); }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (org) localStorage.setItem("orgId", org); }, [org]);
  const [bots, setBots] = useState<{ bot_id: string; behavior: string; has_key: boolean }[]>([]);
  const loadBots = useCallback(async () => {
    if (!org) return;
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
    try {
      const r = await fetch(`${B()}/api/bots?org_id=${encodeURIComponent(org)}`, { headers });
      const t = await r.text();
      if (!r.ok) { setBots([]); return; }
      const d = JSON.parse(t);
      setBots(d.bots || []);
    } catch {
      setBots([]);
    }
  }, [org]);
  useEffect(() => {
    const t = setTimeout(() => { loadBots(); }, 0);
    return () => clearTimeout(t);
  }, [loadBots]);
  return (
    <div className="space-y-8">
      <div className="card gradient-border p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent)] bg-[linear-gradient(130deg,var(--accent),#6366f1_50%,#8b5cf6)]" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-black/60 dark:text-white/60 max-w-xl leading-relaxed">Create chatbots, ingest helpful knowledge, and embed them anywhere. Everything is designed so non‑technical users can succeed quickly.</p>
          <div className="flex gap-2 mt-2 text-[10px] text-black/50 dark:text-white/40">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />Real‑time</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Secure</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />Accessible</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="md" variant="primary"><Link href="/bots">Create Bot</Link></Button>
          <Button asChild size="md" variant="outline"><Link href="/ingest">Add Knowledge</Link></Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover title="Create a Bot" subtitle="Define behavior, set a name, craft a helpful system prompt.">
          <div className="text-xs text-black/60 dark:text-white/60 leading-relaxed mb-4">Support, sales, booking – tune it with a few guided fields. We handle the complex parts behind the scenes.</div>
          <Button asChild size="sm"><Link href="/bots">Go to Bots</Link></Button>
        </Card>
        <Card hover title="Add Knowledge" subtitle="Upload documents or paste text for retrieval.">
          <div className="text-xs text-black/60 dark:text-white/60 leading-relaxed mb-4">Enrich answers by adding PDFs, website URLs, or internal notes. Content is indexed securely for fast semantic lookup.</div>
          <Button asChild size="sm" variant="outline"><Link href="/ingest">Open Knowledge</Link></Button>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card hover title="Usage" subtitle="Track performance & tune prompts.">
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">Daily chats, fallback rate and similarity stats help refine quality. Open a bot &gt; Usage for charts.</p>
        </Card>
        <Card hover title="Embed & Widget" subtitle="Copy‑paste install snippets.">
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">Bubble, inline, iframe, CDN widget – all unified styling. Open a bot &gt; Embed.</p>
        </Card>
        <Card hover title="Config" subtitle="Adjust core behavior & keys.">
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">Set system prompt, rotate public key, tune persona. Open a bot &gt; Config.</p>
        </Card>
        <Card hover title="Security" subtitle="Public vs authenticated usage.">
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">Dashboard uses bearer token; embeds can use rotating public keys – never hard‑code secrets.</p>
        </Card>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Your Bots</h2>
          <Button asChild size="sm" variant="outline"><Link href="/bots">Manage</Link></Button>
        </div>
        {!bots.length ? (
          <Card className="text-sm" hover title="No bots found" subtitle="Create one to get started.">
            <Button asChild size="sm"><Link href="/bots">Create Bot</Link></Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bots.map(b => (
              <Card key={b.bot_id} hover padding="md" className="relative overflow-hidden" title={b.behavior} subtitle={b.has_key ? 'Key active' : 'No key'}>
                <div className="font-mono text-xs break-all mb-3 opacity-80">{b.bot_id}</div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><Link href={`/usage/${b.bot_id}`}>Usage</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href={`/embed/${b.bot_id}`}>Embed</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href={`/bots/${b.bot_id}/config`}>Config</Link></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {!org && (
        <div className="card p-4 border border-warning/40 bg-warning/10 text-sm flex flex-col gap-2">
          <div className="font-medium">You are not logged in</div>
          <div className="text-black/70 dark:text-white/70">Please <Link href="/login" className="text-accent underline">login</Link> or <Link href="/register" className="text-accent underline">register</Link> to save bots.</div>
        </div>
      )}
    </div>
  );
}
