"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EventSummary = {
  id: string; name: string; createdAt: string;
  totalGuests: number; submittedGuests: number; avgScore: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [events,  setEvents]  = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/events")
      .then(r => { if (r.status===401){ router.replace("/admin/login"); return null; } return r.json(); })
      .then(d => { if (d) setEvents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method:"POST" });
    router.replace("/admin/login");
  };

  const totalGuests    = events.reduce((s,e) => s + e.totalGuests, 0);
  const totalSubmitted = events.reduce((s,e) => s + e.submittedGuests, 0);

  return (
    <div className="min-h-screen" style={{ background:"#06040C" }}>

      {/* Nav */}
      <nav className="admin-nav">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GaminGaza" style={{ width:"28px", height:"28px", objectFit:"contain" }} />
          <div>
            <span className="font-display font-semibold text-sm" style={{ color:"var(--gold)" }}>GaminGaza</span>
            <span className="text-xs ml-2" style={{ color:"var(--text-dim)" }}>Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/events/create")}
            className="btn-gold text-xs px-4 py-2">
            + New Event
          </button>
          <button onClick={handleLogout}
            className="text-xs transition-colors"
            style={{ color:"var(--text-dim)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-8 pb-12">

        {/* Page title */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl font-bold" style={{ color:"var(--gold-light)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color:"var(--text-muted)" }}>
            Manage your carnival events and view guest analytics
          </p>
        </div>

        {/* Summary chips */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up delay-100">
            {[
              { label:"Total Events",    value: events.length,  icon:"🎪" },
              { label:"Total Guests",    value: totalGuests,    icon:"👥" },
              { label:"Total Submitted", value: totalSubmitted, icon:"✅" },
            ].map(s => (
              <div key={s.label} className="stat-chip text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-2xl font-bold" style={{ color:"var(--gold)" }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="gold-divider mb-8" />

        {/* Events */}
        <div className="flex items-center justify-between mb-5 animate-fade-up delay-100">
          <h2 className="font-display text-xl font-semibold" style={{ color:"var(--text-primary)" }}>
            Events
          </h2>
          <span className="text-xs" style={{ color:"var(--text-muted)" }}>
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-pulse-glow"
              style={{ background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.25)" }} />
            <p className="text-sm" style={{ color:"var(--text-muted)" }}>Loading events…</p>
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card-elevated p-12 text-center animate-scale-in">
            <div className="text-5xl mb-4 animate-float">🎪</div>
            <h2 className="font-display text-xl font-semibold mb-2" style={{ color:"var(--gold)" }}>No Events Yet</h2>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color:"var(--text-muted)" }}>
              Create your first event to generate a QR code and start onboarding guests.
            </p>
            <button onClick={() => router.push("/admin/events/create")} className="btn-gold">
              Create First Event
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev, i) => (
              <div key={ev.id}
                className="event-card animate-fade-up"
                style={{ animationDelay:`${i * 0.07}s` }}
                onClick={() => router.push(`/admin/events/${ev.id}`)}>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-base truncate"
                      style={{ color:"var(--text-primary)" }}>
                      {ev.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color:"var(--text-dim)" }}>
                      {new Date(ev.createdAt).toLocaleDateString("en-IN",{ day:"numeric", month:"long", year:"numeric" })}
                    </p>
                  </div>
                  <span className="text-xs ml-3 flex-shrink-0 mt-1" style={{ color:"var(--gold)", opacity:0.5 }}>→</span>
                </div>

                <div className="gold-divider mb-4" />

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:"Registered",  value: ev.totalGuests,     suffix:"" },
                    { label:"Submitted",   value: ev.submittedGuests, suffix:"" },
                    { label:"Avg Score",   value: ev.avgScore,        suffix:"/10" },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-xl font-bold" style={{ color: s.label==="Avg Score" ? "var(--gold)" : "var(--text-primary)" }}>
                        {s.value}{s.suffix}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color:"var(--text-dim)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
