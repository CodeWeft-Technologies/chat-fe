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
    <div className="max-w-md mx-auto space-y-4">
      <div className="rounded-xl border border-black/10 bg-white p-5">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-black/60">Start by entering your details and org information.</p>
        </div>
        {error && <div className="mb-3 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
        <form onSubmit={register} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Org Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 w-full" />
          </div>
          <button type="submit" className="w-full px-3 py-2 rounded-md bg-blue-600 text-white" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
        </form>
      </div>
      <p className="text-sm text-center">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></p>
    </div>
  );
}
