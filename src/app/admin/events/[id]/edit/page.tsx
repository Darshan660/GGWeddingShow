"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, CreateEventInput } from "@/lib/validations";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [active,      setActive]      = useState(0);
  const [questionIds, setQuestionIds] = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<CreateEventInput>({
      resolver: zodResolver(createEventSchema),
      defaultValues: { name: "", questions: [] },
    });

  const questions = watch("questions");

  useEffect(() => {
    fetch(`/api/admin/events/${id}`)
      .then(r => { if (r.status === 401) { router.replace("/admin/login"); return null; } return r.json(); })
      .then(data => {
        if (!data) return;
        setQuestionIds(data.questions.map((q: { id: string }) => q.id));
        reset({
          name: data.name,
          questions: data.questions.map((q: {
            text: string; optionA: string; optionB: string;
            optionC: string; optionD: string; correctOption: string;
          }) => ({
            text: q.text, optionA: q.optionA, optionB: q.optionB,
            optionC: q.optionC, optionD: q.optionD,
            correctOption: q.correctOption as "A"|"B"|"C"|"D",
          })),
        });
        setLoading(false);
      })
      .catch(() => router.replace("/admin/dashboard"));
  }, [id, reset, router]);

  const filled = (i: number) => {
    const q = questions?.[i];
    return !!(q?.text && q?.optionA && q?.optionB && q?.optionC && q?.optionD);
  };
  const completedCount = questions?.filter((_, i) => filled(i)).length ?? 0;

  const onSubmit = async (data: CreateEventInput) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        questions: data.questions.map((q, i) => ({ ...q, id: questionIds[i] })),
      };
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { router.replace("/admin/login"); return; }
      if (!res.ok) { alert("Save failed. Check all fields."); setSubmitting(false); return; }
      router.push(`/admin/events/${id}`);
    } catch {
      alert("Something went wrong."); setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#06040C" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading event…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#06040C" }}>

      <nav className="admin-nav">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/admin/events/${id}`)}
            className="text-xs transition-colors"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
            ← Back
          </button>
          <div style={{ width: "1px", height: "1rem", background: "rgba(201,168,76,0.25)" }} />
          <span className="font-display font-semibold text-sm" style={{ color: "var(--gold)" }}>Edit Event</span>
        </div>
        <span className="text-xs" style={{ color: completedCount === 10 ? "var(--gold)" : "var(--text-muted)" }}>
          {completedCount}/10 questions filled
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-12">
        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="glass-card-elevated p-6 mb-6 animate-fade-up">
            <h2 className="font-display text-xl font-semibold mb-4" style={{ color: "var(--gold-light)" }}>
              Event Details
            </h2>
            <label className="luxury-label">Event Name <span style={{ color: "#E07070" }}>*</span></label>
            <input {...register("name")}
              className={`luxury-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. Sharma Wedding, Table Quiz 2025"
              maxLength={100} />
            {errors.name && <p className="error-text">⚠ {errors.name.message}</p>}
          </div>

          <div className="glass-card p-5 mb-5 animate-fade-up delay-100">
            <p className="luxury-label mb-3">Jump to Question</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i} type="button"
                  className={`q-nav-btn ${active === i ? "active" : filled(i) ? "filled" : "empty"}`}
                  onClick={() => setActive(i)}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {Array.from({ length: 10 }, (_, index) => (
            <div key={index}
              className={`glass-card-elevated p-6 mb-4 animate-scale-in ${active !== index ? "hidden" : ""}`}>

              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-0.5"
                    style={{ color: "rgba(201,168,76,0.55)" }}>
                    Question {index + 1} of 10
                  </p>
                  {filled(index) && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.22)" }}>
                      ✓ Complete
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {index > 0 && (
                    <button type="button" onClick={() => setActive(index - 1)}
                      className="btn-ghost text-xs py-1.5 px-3">← Prev</button>
                  )}
                  {index < 9 && (
                    <button type="button" onClick={() => setActive(index + 1)}
                      className="btn-gold text-xs py-1.5 px-3">Next →</button>
                  )}
                </div>
              </div>

              <div className="gold-divider mb-5" />

              <div className="mb-5">
                <label className="luxury-label">Question Text <span style={{ color: "#E07070" }}>*</span></label>
                <textarea {...register(`questions.${index}.text`)}
                  className="luxury-input"
                  placeholder="Type your question here…" rows={3} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {(["A", "B", "C", "D"] as const).map(opt => (
                  <div key={opt}>
                    <label className="luxury-label">Option {opt} <span style={{ color: "#E07070" }}>*</span></label>
                    <input
                      {...register(`questions.${index}.${`option${opt}` as "optionA"|"optionB"|"optionC"|"optionD"}`)}
                      className="luxury-input text-sm"
                      placeholder={`Option ${opt}`} />
                  </div>
                ))}
              </div>

              <div>
                <label className="luxury-label">Correct Answer <span style={{ color: "#E07070" }}>*</span></label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {(["A", "B", "C", "D"] as const).map(opt => {
                    const current = watch(`questions.${index}.correctOption`);
                    const isSelected = current === opt;
                    return (
                      <button key={opt} type="button"
                        onClick={() => setValue(`questions.${index}.correctOption`, opt)}
                        className="py-2.5 rounded-xl font-bold text-sm transition-all"
                        style={{
                          background: isSelected ? "linear-gradient(135deg,#D4AF5A 0%,#C9A84C 100%)" : "rgba(255,255,255,0.05)",
                          color: isSelected ? "#0A0614" : "var(--text-muted)",
                          border: isSelected ? "none" : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: isSelected ? "0 4px 16px rgba(201,168,76,0.3)" : "none",
                          transform: isSelected ? "scale(1.04)" : "scale(1)",
                        }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 animate-fade-up delay-200">
            <button type="submit" disabled={submitting} className="btn-gold w-full"
              style={{ fontSize: "0.95rem", padding: "1rem" }}>
              {submitting ? "Saving…" : "Save Changes →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
