"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError((await res.json()).error || "Invalid credentials"); setLoading(false); return; }
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(201,168,76,0.07) 0%, transparent 55%)," +
          "radial-gradient(ellipse 60% 50% at 80% 90%, rgba(80,0,20,0.18) 0%, transparent 60%)," +
          "#080614",
      }}>

      {/* Orbs */}
      <div className="absolute top-[5%] left-[10%] w-[24rem] h-[24rem] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)", filter:"blur(80px)" }} />
      <div className="absolute bottom-[5%] right-[10%] w-[20rem] h-[20rem] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,rgba(90,0,20,0.14) 0%,transparent 70%)", filter:"blur(80px)" }} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <img
            src="/logo.png"
            alt="GaminGaza"
            className="mx-auto mb-4 select-none"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px rgba(201,168,76,0.22)) drop-shadow(0 6px 20px rgba(0,0,0,0.5))",
            }}
          />
          <p className="text-xs font-semibold tracking-[0.28em] uppercase mb-1"
            style={{ color:"rgba(201,168,76,0.5)" }}>GaminGaza</p>
          <h1 className="font-display text-2xl font-bold" style={{ color:"var(--gold-light)" }}>Admin Portal</h1>
          <p className="text-sm mt-1" style={{ color:"var(--text-muted)" }}>Wedding Game Show</p>
        </div>

        {/* Form */}
        <div className="glass-card-elevated p-7 animate-fade-up delay-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="luxury-label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="luxury-input" placeholder="admin@gaminggaza.com" required />
            </div>
            <div>
              <label className="luxury-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="luxury-input" placeholder="••••••••" required />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-medium animate-fade-in"
                style={{ background:"rgba(220,60,60,0.08)", border:"1px solid rgba(220,60,60,0.25)", color:"#E07070" }}>
                ⚠ {error}
              </div>
            )}

            <div className="pt-1">
              <button type="submit" disabled={loading} className="btn-gold w-full">
                {loading ? "Signing in…" : "Sign In to Dashboard"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-5 animate-fade-up delay-200">
          <button onClick={() => router.push("/")}
            className="text-xs transition-colors"
            style={{ color:"var(--text-dim)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
