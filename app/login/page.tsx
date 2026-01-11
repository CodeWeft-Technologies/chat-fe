"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${B()}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Login failed");
      if (typeof window !== "undefined") {
        localStorage.setItem("token", d.token);
        localStorage.setItem("orgId", d.org_id);
      }
      router.push("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-black/5 bg-[radial-gradient(circle_at_20%_20%,#e0e7ff,transparent_35%),radial-gradient(circle_at_80%_0%,#c7d2fe,transparent_25%),radial-gradient(circle_at_50%_100%,#dbeafe,transparent_35%)] shadow-xl animate-fade-in">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-0 relative">
          <aside className="hidden lg:flex flex-col justify-between p-10 text-slate-900 bg-white/50 backdrop-blur">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-2">Login</p>
              <h1 className="text-3xl font-semibold leading-tight">Sign in to your chatbot workspace</h1>
              <p className="mt-3 text-sm text-slate-700 max-w-md">
                Access dashboards, tune responses, and track live conversations with a clean, focused workspace.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-6">
              <div className="card card-hover p-4 w-full">
                <p className="font-semibold text-sm mb-1">Live tracking</p>
                <p className="text-slate-600">See leads and appointments update in real time.</p>
              </div>
              <div className="card card-hover p-4 w-full">
                <p className="font-semibold text-sm mb-1">Analytics</p>
                <p className="text-slate-600">Usage insights to spot demand, drop-offs, and intent.</p>
              </div>
              <div className="card card-hover p-4 w-full">
                <p className="font-semibold text-sm mb-1">Customization</p>
                <p className="text-slate-600">Match the chatbot to your site’s brand, colors, and tone.</p>
              </div>
              <div className="card card-hover p-4 w-full">
                <p className="font-semibold text-sm mb-1">Security</p>
                <p className="text-slate-600">Org-scoped tokens and audit-ready access logs.</p>
              </div>
            </div>
          </aside>

          <section className="relative bg-white/90 backdrop-blur p-6 sm:p-8 lg:p-10 border-black/5 lg:border-l">
            <div className="mb-4">
              <a 
                href="https://www.codeweft.in/" 
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </a>
            </div>

            <div className="lg:hidden mb-6 space-y-2">
              <p className="text-sm font-semibold text-blue-700">Login</p>
              <h1 className="text-2xl font-semibold leading-tight text-slate-900">Sign in to your chatbot workspace</h1>
              <p className="text-sm text-slate-700">
                Access dashboards, live tracking, analytics, customization, and security controls.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm pt-2">
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Live tracking</p>
                  <p className="text-slate-600">Leads and appointments in real time.</p>
                </div>
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Analytics</p>
                  <p className="text-slate-600">Usage insights and drop-off trends.</p>
                </div>
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Customization</p>
                  <p className="text-slate-600">Match the bot to your site brand.</p>
                </div>
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Security</p>
                  <p className="text-slate-600">Org-scoped tokens and audit logs.</p>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Welcome back</p>
                <h2 className="text-2xl font-semibold text-slate-900">Enter your credentials</h2>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="mb-1">Need an account?</p>
                <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700">Create one</a>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={login} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="email">Work email</label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base focus-ring"
                  type="email"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                  <label htmlFor="password">Password</label>
                  <span className="text-xs text-blue-700">Secure vault</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base focus-ring pr-24"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-1 right-1 px-3 text-xs font-semibold text-blue-700 rounded-md hover:bg-blue-50 focus-ring"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-base btn-primary w-full focus-ring"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Sign in"}
              </button>
            </form>

            <p className="text-xs text-center text-slate-600 mt-6" />
          </section>
        </div>
      </div>
    </div>
  );
}
