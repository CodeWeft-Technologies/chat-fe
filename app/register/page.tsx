"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    const body = { email: email.trim(), password, org_name: name.trim() || null };
    try {
      setLoading(true);
      setError(null);
      const r = await fetch(`${B()}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Registration failed");
      if (typeof window !== "undefined") {
        localStorage.setItem("token", d.token);
        localStorage.setItem("orgId", d.org_id);
      }
      router.push("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Registration failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-black/5 bg-[radial-gradient(circle_at_20%_20%,#e0f2fe,transparent_35%),radial-gradient(circle_at_80%_0%,#c7f0ff,transparent_25%),radial-gradient(circle_at_50%_100%,#d9f8ff,transparent_35%)] shadow-xl animate-fade-in">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -left-12 -top-8 h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-blue-500/12 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-0 relative">
          <aside className="hidden lg:flex flex-col justify-between p-10 text-slate-900 bg-white/55 backdrop-blur">
            <div>
              <p className="text-sm font-semibold text-emerald-700 mb-2">Create workspace</p>
              <h1 className="text-3xl font-semibold leading-tight">Set up your chatbot org</h1>
              <p className="mt-3 text-sm text-slate-700 max-w-md">
                Provision an organization with API keys, roles, and dashboards configured from the start.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-8">
              <div className="card card-hover p-4">
                <p className="font-semibold text-sm mb-1">Guided setup</p>
                <p className="text-slate-600">Launch in minutes with presets.</p>
              </div>
              <div className="card card-hover p-4">
                <p className="font-semibold text-sm mb-1">Org controls</p>
                <p className="text-slate-600">Org IDs, roles, and audit trails.</p>
              </div>
              <div className="card card-hover p-4">
                <p className="font-semibold text-sm mb-1">Channels</p>
                <p className="text-slate-600">Embed on web, docs, or support.</p>
              </div>
              <div className="card card-hover p-4">
                <p className="font-semibold text-sm mb-1">Secure by default</p>
                <p className="text-slate-600">Key rotation and least privilege.</p>
              </div>
            </div>
          </aside>

          <section className="relative bg-white/92 backdrop-blur p-6 sm:p-8 lg:p-10 border-black/5 lg:border-l">
            <div className="lg:hidden mb-6 space-y-2">
              <p className="text-sm font-semibold text-emerald-700">Create workspace</p>
              <h1 className="text-2xl font-semibold leading-tight text-slate-900">Set up your chatbot org</h1>
              <p className="text-sm text-slate-700">
                Provision org controls, channels, branding, and security in a single flow.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm pt-2">
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Guided setup</p>
                  <p className="text-slate-600">Launch faster with presets.</p>
                </div>
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Brand fit</p>
                  <p className="text-slate-600">Align to your site design.</p>
                </div>
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Channels</p>
                  <p className="text-slate-600">Embed on web, docs, or support.</p>
                </div>
                <div className="card card-hover p-3 w-full">
                  <p className="font-semibold text-sm mb-1">Security</p>
                  <p className="text-slate-600">Least privilege with audit trails.</p>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Start fresh</p>
                <h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="mb-1">Already a member?</p>
                <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Log in</a>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={register} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="name">Org name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-base focus-ring"
                  placeholder="Acme Support"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="email">Work email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base focus-ring"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="password">Password</label>
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
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>

            <p className="text-xs text-center text-slate-600 mt-6" />
          </section>
        </div>
      </div>
    </div>
  );
}
