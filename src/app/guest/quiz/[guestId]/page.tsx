"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Question = {
  id: string; text: string;
  optionA: string; optionB: string; optionC: string; optionD: string;
  order: number;
};
type Answers = Record<string, "A" | "B" | "C" | "D">;
const OPTIONS = ["A","B","C","D"] as const;
const KEY: Record<string,string> = { A:"optionA", B:"optionB", C:"optionC", D:"optionD" };

export default function QuizPage() {
  const params  = useParams();
  const router  = useRouter();
  const guestId = params.guestId as string;

  const [questions,  setQuestions]  = useState<Question[]>([]);
  const [eventName,  setEventName]  = useState("");
  const [answers,    setAnswers]    = useState<Answers>({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [active,     setActive]     = useState(0);

  useEffect(() => {
    fetch(`/api/guest/quiz-data/${guestId}`)
      .then(r => {
        if (r.status === 409) { router.replace("/guest/thankyou"); return null; }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setQuestions(d.questions);
        setEventName(d.eventName);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load quiz. Please refresh."); setLoading(false); });
  }, [guestId, router]);

  const select = (qid: string, opt: typeof OPTIONS[number]) => {
    setAnswers(prev => ({ ...prev, [qid]: opt }));
    // Auto-advance after short delay
    setTimeout(() => setActive(i => Math.min(questions.length - 1, i + 1)), 350);
  };

  const answered = Object.keys(answers).length;
  const total    = questions.length;
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;
  const allDone  = total > 0 && answered === total;

  const handleSubmit = async () => {
    if (!allDone) return;
    setSubmitting(true);
    const payload = questions.map(q => ({ questionId: q.id, selectedOption: answers[q.id] }));
    try {
      const res = await fetch("/api/guest/submit", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ guestId, answers: payload }),
      });
      if (!res.ok) throw new Error();
      router.push("/guest/thankyou");
    } catch {
      setSubmitting(false);
      alert("Submission failed. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"#06040C" }}>
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse-glow"
          style={{ background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.28)" }} />
        <p className="text-sm" style={{ color:"var(--text-muted)" }}>Loading your quiz…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:"#06040C" }}>
      <div className="glass-card-elevated p-10 text-center max-w-sm animate-scale-in">
        <p className="font-semibold" style={{ color:"#E07070" }}>{error}</p>
      </div>
    </div>
  );

  const q = questions[active];

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 10% 5%, rgba(201,168,76,0.06) 0%, transparent 55%)," +
          "radial-gradient(ellipse 60% 40% at 90% 95%, rgba(80,0,20,0.15) 0%, transparent 60%)," +
          "#080614",
      }}>

      {/* Sticky header */}
      <header className="admin-nav">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GaminGaza" style={{ width:"28px", height:"28px", objectFit:"contain" }} />
          <div>
            <p className="font-display text-sm font-semibold" style={{ color:"var(--gold)" }}>{eventName}</p>
            <p className="text-xs" style={{ color:"var(--text-dim)" }}>Wedding Game Show</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color:"var(--gold)" }}>{answered}</span>
          <span className="text-xs" style={{ color:"var(--text-dim)" }}>/ {total} answered</span>
        </div>
      </header>

      {/* Full-width progress bar */}
      <div className="progress-track" style={{ borderRadius:0 }}>
        <div className="progress-fill" style={{ width:`${pct}%` }} />
      </div>

      <div className="max-w-xl mx-auto px-4 pt-7">

        {/* Question nav */}
        <div className="flex flex-wrap gap-1.5 mb-6 animate-fade-up">
          {questions.map((_, i) => {
            const cls = active === i ? "active" : answers[questions[i].id] ? "filled" : "empty";
            return (
              <button key={i} type="button" className={`q-nav-btn ${cls}`} onClick={() => setActive(i)}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Question card */}
        {q && (
          <div key={`q-${active}`} className="glass-card-elevated p-6 mb-4 animate-scale-in">
            <div className="flex items-start justify-between mb-1">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase"
                style={{ color:"rgba(201,168,76,0.65)" }}>
                Question {active + 1} / {total}
              </span>
              {answers[q.id] && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background:"rgba(201,168,76,0.12)", color:"var(--gold-light)", border:"1px solid rgba(201,168,76,0.25)" }}>
                  ✓ Answered
                </span>
              )}
            </div>

            <div className="gold-divider my-4" />

            <p className="font-display text-lg font-semibold leading-relaxed mb-6"
              style={{ color:"var(--text-primary)" }}>
              {q.text}
            </p>

            <div className="space-y-2.5">
              {OPTIONS.map(opt => {
                const label = (q as unknown as Record<string,string>)[KEY[opt]];
                const sel   = answers[q.id] === opt;
                return (
                  <button key={opt} onClick={() => select(q.id, opt)}
                    className={`option-btn ${sel ? "selected" : ""}`}>
                    <span className="option-badge">{opt}</span>
                    <span className="flex-1 text-left">{label}</span>
                    {sel && <span style={{ color:"var(--gold)", fontSize:"0.85rem" }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Prev / Next */}
        <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-up delay-100">
          <button type="button" onClick={() => setActive(i => Math.max(0, i-1))}
            disabled={active === 0} className="btn-ghost text-sm py-2.5 disabled:opacity-25">
            ← Previous
          </button>
          <button type="button" onClick={() => setActive(i => Math.min(total-1, i+1))}
            disabled={active === total-1} className="btn-ghost text-sm py-2.5 disabled:opacity-25">
            Next →
          </button>
        </div>

        {/* Submit */}
        <div className="animate-fade-up delay-200">
          {!allDone && (
            <p className="text-center text-xs mb-3" style={{ color:"var(--text-muted)" }}>
              {total - answered} question{total-answered !== 1 ? "s" : ""} remaining
            </p>
          )}
          <button onClick={handleSubmit} disabled={!allDone || submitting}
            className="btn-gold w-full" style={{ fontSize:"0.95rem", padding:"1rem" }}>
            {submitting ? "Submitting…" : allDone ? "Submit All Answers 🎯" : `Answer all ${total} to submit`}
          </button>
        </div>

        {/* Mini progress grid */}
        <div className="mt-5 glass-card p-4 animate-fade-up delay-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs" style={{ color:"var(--text-muted)" }}>Answer overview</span>
            <span className="text-xs font-bold" style={{ color:"var(--gold)" }}>{pct}% complete</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {questions.map((qq, i) => (
              <button key={qq.id} onClick={() => setActive(i)}
                title={`Q${i+1}`}
                className="w-6 h-6 rounded-sm text-xs transition-all hover:opacity-80"
                style={{
                  background: answers[qq.id]
                    ? "rgba(201,168,76,0.55)"
                    : active === i
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.06)",
                  border: active === i ? "1px solid rgba(201,168,76,0.4)" : "1px solid transparent",
                  fontSize: "0.6rem",
                  color: answers[qq.id] ? "#0A0614" : "var(--text-dim)",
                  fontWeight: 700,
                }}>
                {i+1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
