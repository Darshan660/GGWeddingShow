"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x:number; y:number; vx:number; vy:number; size:number; opacity:number; fd:number };
    const pts: P[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.08,
      size: Math.random() * 1.4 + 0.3,
      opacity: Math.random() * 0.45 + 0.08,
      fd: Math.random() > 0.5 ? 1 : -1,
    }));

    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.opacity += p.fd * 0.003;
        if (p.opacity > 0.55 || p.opacity < 0.05) p.fd *= -1;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.opacity})`;
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(id); };
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(201,168,76,0.09) 0%, transparent 55%)," +
          "radial-gradient(ellipse 60% 50% at 80% 90%, rgba(90,0,25,0.2) 0%, transparent 60%)," +
          "#080614",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.75 }} />

      {/* Ambient glow orbs */}
      <div className="absolute top-[8%] left-[12%] w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)", filter: "blur(70px)" }} />
      <div className="absolute bottom-[8%] right-[8%] w-[22rem] h-[22rem] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(100,0,30,0.16) 0%, transparent 70%)", filter: "blur(70px)" }} />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">

        {/* Logo */}
        <div className="animate-fade-up mb-4">
          <img
            src="/logo.png"
            alt="GaminGaza"
            className="animate-float select-none"
            style={{
              width: "96px",
              height: "96px",
              objectFit: "contain",
              filter: "drop-shadow(0 0 24px rgba(201,168,76,0.25)) drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        {/* Title */}
        <div className="animate-fade-up delay-100 text-center mb-1">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: "rgba(201,168,76,0.55)" }}>
            Welcome to
          </p>
          <h1
            className="font-display text-5xl sm:text-6xl font-bold leading-none mb-3"
            style={{
              background: "linear-gradient(120deg,#D4AF60 0%,#C9A84C 25%,#F0D080 50%,#C9A84C 75%,#D4AF60 100%)",
              backgroundSize: "240% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "text-shimmer 5s linear infinite",
            }}
          >
            GaminGaza
          </h1>
          <p className="font-display text-xl italic" style={{ color: "rgba(245,240,232,0.65)" }}>
            Wedding Game Show
          </p>
        </div>

        <div className="animate-fade-up delay-200 w-24 my-6">
          <div className="gold-divider" />
        </div>

        <p className="animate-fade-up delay-200 text-center text-sm mb-8 leading-relaxed"
          style={{ color: "rgba(245,240,232,0.38)", maxWidth: "20rem" }}>
          An exclusive carnival experience. Showcase your knowledge and secure your place in the next round.
        </p>

        {/* Role Cards */}
        <div className="animate-fade-up delay-300 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Guest */}
          <div className="rounded-2xl p-6 flex flex-col items-center text-center"
            style={{
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
            }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="text-xl">🎮</span>
            </div>
            <h2 className="font-display text-lg font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
              I&apos;m a Guest
            </h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              Scan the QR code at your game station to join the quiz.
            </p>
            <div className="w-full py-2.5 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
              Scan QR at venue
            </div>
          </div>

          {/* Admin */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300"
            style={{
              background: "linear-gradient(145deg,rgba(201,168,76,0.1) 0%,rgba(201,168,76,0.03) 100%)",
              border: "1px solid rgba(201,168,76,0.28)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
            onClick={() => router.push("/admin/login")}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(-3px)";
              el.style.boxShadow = "0 18px 50px rgba(0,0,0,0.45), 0 0 30px rgba(201,168,76,0.1)";
              el.style.borderColor = "rgba(201,168,76,0.5)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "";
              el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.35)";
              el.style.borderColor = "rgba(201,168,76,0.28)";
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: "linear-gradient(135deg,rgba(201,168,76,0.2) 0%,rgba(201,168,76,0.07) 100%)",
                border: "1px solid rgba(201,168,76,0.3)",
              }}>
              <span className="text-xl">🛡️</span>
            </div>
            <h2 className="font-display text-lg font-semibold mb-1.5" style={{ color: "var(--gold-light)" }}>
              Admin Login
            </h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
              GaminGaza staff: manage events, view results, download data.
            </p>
            <button className="btn-gold w-full text-sm py-2.5">
              Enter Dashboard
            </button>
          </div>
        </div>

        <p className="animate-fade-up delay-500 mt-8 text-xs" style={{ color: "var(--text-dim)" }}>
          2025 GaminGaza · All rights reserved
        </p>
      </div>
    </main>
  );
}
