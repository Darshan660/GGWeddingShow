"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  firstName:   z.string().min(1,"First name is required").max(30,"Max 30 characters"),
  lastName:    z.string().min(1,"Last name is required").max(40,"Max 40 characters"),
  roomNumber:  z.string().min(1,"Room number is required").regex(/^\d{1,7}$/,"Valid integer, max 7 digits"),
  phoneNumber: z.string().optional().refine((v) => {
    if (!v || !v.trim()) return true;
    return /^\+?[1-9]\d{6,14}$/.test(v.replace(/[\s\-()]/g,""));
  },"Enter a valid phone number (e.g. +91 98765 43210)"),
});
type FormData = z.infer<typeof schema>;

export default function GuestRegisterPage() {
  const params  = useParams();
  const router  = useRouter();
  const eventId = params.eventId as string;

  const [eventName,    setEventName]   = useState("");
  const [eventLoading, setEventLoading]= useState(true);
  const [eventError,   setEventError]  = useState("");
  const [submitting,   setSubmitting]  = useState(false);

  const { register, handleSubmit, formState:{ errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    fetch(`/api/guest/event/${eventId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d  => { setEventName(d.name); setEventLoading(false); })
      .catch(() => { setEventError("This link is invalid or expired."); setEventLoading(false); });
  }, [eventId]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/guest/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId }),
      });
      if (!res.ok) throw new Error();
      const { guestId } = await res.json();
      router.push(`/guest/quiz/${guestId}`);
    } catch {
      setSubmitting(false);
      alert("Registration failed. Please try again.");
    }
  };

  /* ── Loading ───────────────────────────────────────────── */
  if (eventLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"#06040C" }}>
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse-glow"
          style={{ background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.28)" }} />
        <p className="text-sm" style={{ color:"var(--text-muted)" }}>Loading event…</p>
      </div>
    </div>
  );

  /* ── Error ─────────────────────────────────────────────── */
  if (eventError) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:"#06040C" }}>
      <div className="glass-card-elevated p-10 text-center max-w-sm animate-scale-in">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-display text-xl font-semibold mb-2" style={{ color:"var(--gold)" }}>Invalid Link</h2>
        <p className="text-sm" style={{ color:"var(--text-muted)" }}>{eventError}</p>
      </div>
    </div>
  );

  /* ── Main ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 15% 10%, rgba(201,168,76,0.07) 0%, transparent 55%)," +
          "radial-gradient(ellipse 60% 50% at 85% 90%, rgba(90,0,25,0.18) 0%, transparent 60%)," +
          "#080614",
      }}>

      <div className="absolute top-[5%] right-[5%] w-[22rem] h-[22rem] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%)", filter:"blur(70px)" }} />

      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-7 animate-fade-up">
          <img
            src="/logo.png"
            alt="GaminGaza"
            className="mx-auto mb-4 animate-float select-none"
            style={{
              width: "72px",
              height: "72px",
              objectFit: "contain",
              filter: "drop-shadow(0 0 16px rgba(201,168,76,0.2)) drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
            }}
          />
          <p className="text-xs font-semibold tracking-[0.28em] uppercase mb-1.5"
            style={{ color:"rgba(201,168,76,0.5)" }}>GaminGaza</p>
          <h1 className="font-display text-2xl font-bold" style={{ color:"var(--gold-light)" }}>
            {eventName}
          </h1>
          <p className="font-display text-sm italic mt-1" style={{ color:"var(--text-muted)" }}>
            Wedding Game Show
          </p>
        </div>

        {/* Form */}
        <div className="glass-card-elevated p-7 animate-fade-up delay-100">
          <h2 className="font-display text-xl font-semibold mb-1" style={{ color:"var(--text-primary)" }}>
            Guest Registration
          </h2>
          <p className="text-sm mb-5" style={{ color:"var(--text-muted)" }}>
            Fill in your details to begin the quiz
          </p>
          <div className="gold-divider mb-6" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="luxury-label">First Name <span style={{color:"#E07070"}}>*</span></label>
                <input {...register("firstName")}
                  className={`luxury-input ${errors.firstName?"error":""}`}
                  placeholder="Rahul" maxLength={30} />
                {errors.firstName && <p className="error-text">⚠ {errors.firstName.message}</p>}
              </div>
              <div>
                <label className="luxury-label">Last Name <span style={{color:"#E07070"}}>*</span></label>
                <input {...register("lastName")}
                  className={`luxury-input ${errors.lastName?"error":""}`}
                  placeholder="Sharma" maxLength={40} />
                {errors.lastName && <p className="error-text">⚠ {errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="luxury-label">Room Number <span style={{color:"#E07070"}}>*</span></label>
              <input {...register("roomNumber")}
                className={`luxury-input ${errors.roomNumber?"error":""}`}
                placeholder="e.g. 204" inputMode="numeric" maxLength={7} />
              {errors.roomNumber && <p className="error-text">⚠ {errors.roomNumber.message}</p>}
            </div>

            <div>
              <label className="luxury-label">
                Phone Number&nbsp;
                <span className="normal-case font-normal tracking-normal"
                  style={{color:"var(--text-dim)",textTransform:"none",letterSpacing:0}}>
                  (optional)
                </span>
              </label>
              <input {...register("phoneNumber")}
                className={`luxury-input ${errors.phoneNumber?"error":""}`}
                placeholder="+91 98765 43210" inputMode="tel" type="tel" />
              {errors.phoneNumber
                ? <p className="error-text">⚠ {errors.phoneNumber.message}</p>
                : <p className="text-xs mt-1.5" style={{color:"var(--text-dim)"}}>
                    Indian &amp; international formats supported
                  </p>}
            </div>

            <div className="pt-1">
              <button type="submit" disabled={submitting} className="btn-gold w-full text-sm">
                {submitting ? "Registering…" : "Continue to Quiz →"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs mt-5 animate-fade-up delay-200"
          style={{ color:"var(--text-dim)" }}>
          Your data is used only for this event · GaminGaza 2025
        </p>
      </div>
    </div>
  );
}
