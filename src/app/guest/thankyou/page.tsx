"use client";

import { useEffect, useRef } from "react";

export default function ThankYouPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#C9A84C","#F0D080","#D4AF60","#FFFFFF","#FFE0A0","#E8C870"];
    type C = { x:number; y:number; vx:number; vy:number; r:number; color:string; rot:number; vrot:number; shape:number };

    const confetti: C[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2.5 + 1.5,
      r: Math.random() * 5 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.15,
      shape: Math.floor(Math.random() * 3),
    }));

    const START  = performance.now();
    const DURATION = 3200; // ms — confetti plays for ~3 seconds then fades out
    let animId: number;

    const draw = (now: number) => {
      const elapsed  = now - START;
      const progress = Math.min(elapsed / DURATION, 1);          // 0 → 1
      const fadeOut  = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1; // fade in last 30%

      if (progress >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; // stop drawing entirely
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.rot+= p.vrot;
        p.vy += 0.03;
        // Don't recycle — once off screen, leave it (so pieces don't loop forever)
        if (p.y > canvas.height + 20) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85 * fadeOut;
        if (p.shape === 0) {
          ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.6);
        } else if (p.shape === 1) {
          ctx.beginPath(); ctx.arc(0,0,p.r*0.7,0,Math.PI*2); ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0,-p.r); ctx.lineTo(p.r,p.r); ctx.lineTo(-p.r,p.r);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 60%)," +
          "radial-gradient(ellipse 60% 50% at 50% 80%, rgba(80,0,20,0.15) 0%, transparent 60%)," +
          "#080614",
      }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full text-center">
        {/* Glow ring */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-32 h-32 rounded-full animate-pulse-glow"
            style={{ background:"radial-gradient(circle,rgba(201,168,76,0.18) 0%,transparent 70%)" }} />
          <div className="w-24 h-24 rounded-full flex items-center justify-center relative animate-float"
            style={{
              background:"linear-gradient(135deg,rgba(201,168,76,0.2) 0%,rgba(201,168,76,0.06) 100%)",
              border:"1px solid rgba(201,168,76,0.35)",
              boxShadow:"0 0 40px rgba(201,168,76,0.2)",
            }}>
            <span className="text-5xl select-none">🎉</span>
          </div>
        </div>

        <div className="glass-card-elevated p-8 animate-scale-in">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3"
            style={{ color:"rgba(201,168,76,0.5)" }}>GaminGaza</p>

          <h1 className="font-display text-3xl font-bold mb-3"
            style={{
              background:"linear-gradient(120deg,#D4AF60 0%,#C9A84C 30%,#F0D080 60%,#C9A84C 85%,#D4AF60 100%)",
              backgroundSize:"240% auto",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text",
              animation:"text-shimmer 5s linear infinite",
            }}>
            Thank You!
          </h1>

          <div className="gold-divider my-4" />

          <p className="text-base leading-relaxed mb-2" style={{ color:"var(--text-primary)" }}>
            Your answers have been submitted successfully.
          </p>
          <p className="text-sm leading-relaxed" style={{ color:"var(--text-muted)" }}>
            We will review the results and announce if you&apos;ve made it to the next round. Stay tuned, the game is just beginning! 🎊
          </p>

          <div className="mt-6 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              background:"rgba(201,168,76,0.08)",
              border:"1px solid rgba(201,168,76,0.2)",
              color:"var(--gold)",
            }}>
            Wedding Game Show · GaminGaza
          </div>
        </div>

        <p className="mt-6 text-xs animate-fade-up delay-400" style={{ color:"var(--text-dim)" }}>
          2025 GaminGaza · All rights reserved
        </p>
      </div>
    </div>
  );
}
