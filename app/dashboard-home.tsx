'use client';
import Link from "next/link";
import { Button } from "./components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { apiCall } from "./lib/api";

export default function DashboardHome() {
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
    try {
      const d = await apiCall<{ bots: { bot_id: string; behavior: string; has_key: boolean }[] }>(`/api/bots?org_id=${encodeURIComponent(org)}`);
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
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-3xl" />
        
        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 sm:space-y-4 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">CodeWeft</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Build, train, and deploy intelligent chatbots in minutes. 
                Connect your knowledge base and let AI handle the rest.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-2">
                <Button asChild size="lg" className="shadow-lg shadow-blue-500/20 w-full sm:w-auto">
                  <Link href="/bots" className="flex items-center justify-center gap-2">
                    <span>Create New Bot</span>
                    <span className="opacity-70">→</span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/50 backdrop-blur-sm w-full sm:w-auto">
                  <Link href="/ingest">Manage Knowledge</Link>
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4 sm:gap-6 md:border-l md:border-gray-100 md:pl-8 dark:border-white/5">
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Active Bots</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{bots.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Platform</div>
                <div className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  <span>v1.2</span>
                  <span className="flex h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 mt-1" title="Online" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/bots" className="group block">
          <div className="h-full p-6 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group-hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">My Bots</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your AI assistants, configure behaviors, and monitor performance.
            </p>
          </div>
        </Link>
        
        <Link href="/ingest" className="group block">
          <div className="h-full p-6 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group-hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Knowledge Base</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload documents and teach your bots about your business.
            </p>
          </div>
        </Link>

        <Link href="https://docs.codeweft.com" target="_blank" className="group block">
          <div className="h-full p-6 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group-hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Learn how to integrate widgets, use the API, and advanced configuration.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Bots Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Recent Bots</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">{bots.length}</span>
          </h2>
          <Link href="/bots" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
            View All
          </Link>
        </div>

        {!bots.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center bg-gray-50/50">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              <span className="text-xl">?</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No bots created yet</h3>
            <p className="text-gray-500 mb-6">Create your first AI assistant to get started.</p>
            <Button asChild><Link href="/bots">Create Bot</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {bots.map(b => (
              <div key={b.bot_id} className="group relative bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/bots/${b.bot_id}/config`} className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-gray-50 text-gray-500 hover:text-gray-900">
                    ⚙️
                  </Link>
                </div>
                
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {b.behavior.charAt(0).toUpperCase()}
                    </div>
                    {b.has_key && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-[10px] font-medium text-green-700 border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 truncate pr-8">{b.behavior}</h3>
                  <div className="text-xs font-mono text-gray-400 mt-1 truncate">{b.bot_id}</div>
                </div>

                <div className="bg-gray-50/50 border-t border-gray-100 p-3 grid grid-cols-2 gap-2">
                  <Link 
                    href={`/usage/${b.bot_id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                  >
                    <span>📊</span> Usage
                  </Link>
                  <Link 
                    href={`/embed/${b.bot_id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                  >
                    <span>🔌</span> Embed
                  </Link>
                </div>
              </div>
            ))}
            
            {/* Add New Card */}
            <Link href="/bots" className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                <span className="text-xl">+</span>
              </div>
              <div className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Create New Bot</div>
            </Link>
          </div>
        )}
      </div>

      {!org && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <div className="text-xl">⚠️</div>
          <div>
            <h4 className="text-sm font-semibold text-amber-800">Authentication Required</h4>
            <p className="text-sm text-amber-700 mt-1">
              You are currently viewing a demo state. <Link href="/login" className="underline font-medium hover:text-amber-900">Log in</Link> or <Link href="/register" className="underline font-medium hover:text-amber-900">Register</Link> to save your bots permanently.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
