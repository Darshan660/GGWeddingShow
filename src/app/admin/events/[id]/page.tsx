"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type GuestResult = {
  id: string; firstName: string; lastName: string;
  roomNumber: string; phoneNumber: string | null;
  correctAnswers: number; totalQuestions: number; createdAt: string;
};

type ResultsData = {
  eventName: string; totalParticipants: number; avgScore: number;
  distribution: Record<number, number>;
  eligibleGuests: GuestResult[]; allGuests: GuestResult[];
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id as string;

  const [qrUrl,      setQrUrl]      = useState("");
  const [qrDataUrl,  setQrDataUrl]  = useState("");
  const [eventName,  setEventName]  = useState("");
  const [qrCopied,   setQrCopied]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [results,    setResults]    = useState<ResultsData | null>(null);
  const [minCorrect, setMinCorrect] = useState(6);
  const [tab,        setTab]        = useState<"eligible"|"all">("eligible");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    fetch(`/api/admin/events/${id}`)
      .then(r => { if (r.status===401){ router.replace("/admin/login"); return null; } if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (!data) return;
        setEventName(data.name); setQrUrl(data.qrUrl);
        import("qrcode").then(QR =>
          QR.toDataURL(data.qrUrl, { width:280, margin:2, color:{ dark:"#0A0614", light:"#FFFFFF" } })
            .then(setQrDataUrl)
        );
      })
      .catch(() => router.replace("/admin/dashboard"));
    loadResults(6);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadResults = (min: number) => {
    setLoading(true);
    fetch(`/api/admin/events/${id}/results?minCorrect=${min}`)
      .then(r => { if (r.status===401){ router.replace("/admin/login"); return null; } return r.json(); })
      .then(d => { if (d) setResults(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const onThreshold = (v: number) => { setMinCorrect(v); loadResults(v); };

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      setQrCopied(true); setTimeout(() => setQrCopied(false), 2000);
    });
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${eventName.replace(/[^a-z0-9]/gi,"_")}_qr.png`;
    a.click();
  };

  const downloadCSV = () => window.location.href = `/api/admin/events/${id}/download?minCorrect=${minCorrect}`;

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    router.replace("/admin/dashboard");
  };

  const maxDistVal = results
    ? Math.max(...Object.values(results.distribution).map(Number), 1)
    : 1;

  return (
    <div className="min-h-screen pb-12" style={{ background:"#06040C" }}>

      {/* Nav */}
      <nav className="admin-nav">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/dashboard")}
            className="text-xs transition-colors"
            style={{ color:"var(--text-dim)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
            ← Back
          </button>
          <div style={{ width:"1px", height:"1rem", background:"rgba(201,168,76,0.2)" }} />
          <span className="font-display font-semibold text-sm truncate max-w-[12rem]"
            style={{ color:"var(--gold)" }}>{eventName || "Event Detail"}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/admin/events/${id}/edit`)}
            className="text-xs px-4 py-2 rounded-xl font-semibold transition-all"
            style={{ background:"rgba(201,168,76,0.12)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.3)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.22)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,168,76,0.12)")}>
            ✏ Edit
          </button>
          <button onClick={downloadCSV} className="btn-gold text-xs px-4 py-2">
            ⬇ CSV
          </button>
          <button onClick={() => setShowDelete(true)}
            className="text-xs px-4 py-2 rounded-xl font-semibold transition-all"
            style={{ background:"rgba(180,30,30,0.15)", color:"#f87171", border:"1px solid rgba(180,30,30,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(180,30,30,0.28)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(180,30,30,0.15)")}>
            🗑 Delete
          </button>
        </div>
      </nav>

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)" }}>
          <div className="glass-card-elevated p-8 max-w-sm w-full animate-scale-in text-center">
            <div className="text-4xl mb-4">🗑</div>
            <h3 className="font-display text-xl font-bold mb-2" style={{ color:"var(--text-primary)" }}>
              Delete Event?
            </h3>
            <p className="text-sm mb-6" style={{ color:"var(--text-muted)" }}>
              This will permanently delete <span style={{ color:"var(--gold)" }}>{eventName}</span> along
              with all registered guests and their answers. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} disabled={deleting}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background:"rgba(255,255,255,0.06)", color:"var(--text-muted)", border:"1px solid rgba(255,255,255,0.1)" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: deleting ? "rgba(180,30,30,0.3)" : "rgba(180,30,30,0.8)", color:"#fff", border:"none" }}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-5">

        {/* QR Card */}
        <div className="glass-card-elevated p-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-base">📲</span>
            <h2 className="font-display text-lg font-semibold" style={{ color:"var(--gold-light)" }}>Guest QR Code</h2>
          </div>
          <div className="gold-divider mb-6" />

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* QR Image */}
            <div className="flex-shrink-0">
              {qrDataUrl ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl animate-pulse-glow"
                    style={{ background:"radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 70%)" }} />
                  <img src={qrDataUrl} alt="QR Code"
                    className="relative w-36 h-36 rounded-2xl"
                    style={{ border:"2px solid rgba(201,168,76,0.35)" }} />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-2xl flex items-center justify-center animate-pulse-glow"
                  style={{ background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.2)" }}>
                  <span style={{ color:"var(--text-dim)" }}>⏳</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm mb-3" style={{ color:"var(--text-muted)" }}>
                Guests scan this QR to register and take the quiz.
              </p>
              <div className="px-3 py-2.5 rounded-xl text-xs font-mono break-all mb-4"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", color:"var(--text-muted)" }}>
                {qrUrl}
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={downloadQR} disabled={!qrDataUrl} className="btn-gold text-xs py-2 px-4">
                  ⬇ Download QR
                </button>
                <button onClick={copyLink} className="btn-ghost text-xs py-2 px-4">
                  {qrCopied ? "✓ Copied!" : "📋 Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {results && (
          <div className="grid grid-cols-3 gap-4 animate-fade-up delay-100">
            {[
              { label:"Participants", value: results.totalParticipants, icon:"👥", gold:false },
              { label:"Average Score", value:`${results.avgScore}/10`,  icon:"📊", gold:true  },
              { label:`Eligible (≥${minCorrect})`, value: results.eligibleGuests.length, icon:"✅", gold:false },
            ].map(s => (
              <div key={s.label} className="stat-chip text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <p className="text-2xl font-bold" style={{ color: s.gold ? "var(--gold)" : "var(--text-primary)" }}>
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color:"var(--text-dim)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Distribution */}
        {results && results.totalParticipants > 0 && (
          <div className="glass-card-elevated p-6 animate-fade-up delay-200">
            <div className="flex items-center gap-2 mb-5">
              <span>📈</span>
              <h2 className="font-display text-base font-semibold" style={{ color:"var(--gold-light)" }}>Score Distribution</h2>
            </div>
            <div className="gold-divider mb-5" />
            <div className="space-y-2.5">
              {Array.from({ length:11 }, (_, i) => {
                const count = results.distribution[i] || 0;
                const pct   = (count / maxDistVal) * 100;
                const eligible = i >= minCorrect;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono text-xs w-4 text-right flex-shrink-0"
                      style={{ color: eligible ? "var(--gold)" : "var(--text-dim)" }}>
                      {i}
                    </span>
                    <div className="flex-1 h-6 rounded" style={{ background:"rgba(255,255,255,0.04)" }}>
                      <div className="h-6 rounded transition-all duration-700"
                        style={{
                          width:`${pct}%`,
                          background: eligible
                            ? "linear-gradient(90deg,rgba(201,168,76,0.4),rgba(201,168,76,0.7))"
                            : "rgba(255,255,255,0.08)",
                          minWidth: count > 0 ? "4px" : "0",
                        }} />
                    </div>
                    <span className="text-xs w-6 text-right flex-shrink-0"
                      style={{ color: count > 0 ? "var(--text-muted)" : "var(--text-dim)" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-5 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background:"rgba(201,168,76,0.6)" }} />
                <span className="text-xs" style={{ color:"var(--text-dim)" }}>Eligible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background:"rgba(255,255,255,0.1)" }} />
                <span className="text-xs" style={{ color:"var(--text-dim)" }}>Not eligible</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Controls */}
        <div className="glass-card-elevated p-6 animate-fade-up delay-300">

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span>🎯</span>
                <h2 className="font-display text-base font-semibold" style={{ color:"var(--gold-light)" }}>Guest Results</h2>
              </div>
              <p className="text-xs" style={{ color:"var(--text-muted)" }}>Filter by minimum correct answers</p>
            </div>
            <button onClick={downloadCSV} className="btn-gold text-xs py-2 px-4 flex-shrink-0">
              ⬇ Download CSV
            </button>
          </div>

          <div className="gold-divider mb-5" />

          {/* Threshold */}
          <div className="p-4 rounded-xl mb-5"
            style={{ background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.12)" }}>
            <div className="flex items-center justify-between mb-3">
              <label className="luxury-label mb-0">Minimum Correct Answers</label>
              <span className="font-bold text-lg" style={{ color:"var(--gold)" }}>{minCorrect}</span>
            </div>
            <input type="range" min={0} max={10} value={minCorrect}
              onChange={e => onThreshold(parseInt(e.target.value))} />
            <div className="flex justify-between text-xs mt-1.5" style={{ color:"var(--text-dim)" }}>
              <span>0: Show all</span><span>5</span><span>10: Perfect score</span>
            </div>
            {results && (
              <p className="text-sm mt-3 font-semibold" style={{ color:"var(--gold)" }}>
                {results.eligibleGuests.length} / {results.totalParticipants} guests qualify
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {(["eligible","all"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: tab===t ? "var(--gold)" : "rgba(255,255,255,0.05)",
                  color:      tab===t ? "#0A0614"     : "var(--text-muted)",
                  border:     tab===t ? "none"         : "1px solid rgba(255,255,255,0.07)",
                  boxShadow:  tab===t ? "0 4px 16px rgba(201,168,76,0.25)" : "none",
                }}>
                {t === "eligible"
                  ? `Eligible (${results?.eligibleGuests.length ?? 0})`
                  : `All Guests (${results?.allGuests.length ?? 0})`}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-10" style={{ color:"var(--text-muted)" }}>Loading results…</div>
          ) : !results || results.allGuests.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-sm" style={{ color:"var(--text-muted)" }}>No submitted responses yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Room</th>
                    <th className="hidden sm:table-cell">Phone</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab==="eligible" ? results.eligibleGuests : results.allGuests).map((g, i) => (
                    <tr key={g.id}>
                      <td style={{ color:"var(--text-dim)" }}>{i+1}</td>
                      <td className="font-medium">{g.firstName} {g.lastName}</td>
                      <td style={{ color:"var(--text-muted)" }}>{g.roomNumber}</td>
                      <td className="hidden sm:table-cell" style={{ color:"var(--text-dim)" }}>
                        {g.phoneNumber || "N/A"}
                      </td>
                      <td>
                        <span className={`score-badge ${g.correctAnswers >= minCorrect ? "eligible" : "ineligible"}`}>
                          {g.correctAnswers}/{g.totalQuestions}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tab==="eligible" && results.eligibleGuests.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color:"var(--text-muted)" }}>
                  No guests meet the minimum of {minCorrect} correct answers.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
