"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const HOLD_DURATION = 2400; // ms até completar o carregamento

export default function TouchPage() {
  const router = useRouter();
  const checkedRef = useRef(false);
  const [phase, setPhase] = useState<"idle" | "charging" | "ready" | "gone">("idle");
  const [progress, setProgress] = useState(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  // Guard pro name_fresh (com ref pra evitar StrictMode double-run)
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    if (typeof window === "undefined") return;
    const fresh = sessionStorage.getItem("maosfalam_name_fresh");
    if (fresh !== "1") {
      router.replace("/ler/nome");
    }
  }, [router]);

  const startCharge = () => {
    if (phase !== "idle") return;
    setPhase("charging");
    startRef.current = performance.now();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(30);
    }

    const tick = (t: number) => {
      if (!startRef.current) return;
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / HOLD_DURATION);
      setProgress(p);
      if (p >= 1) {
        setPhase("ready");
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([40, 60, 200]);
        }
        setTimeout(() => {
          setPhase("gone");
          setTimeout(() => router.push("/ler/camera"), 700);
        }, 500);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const cancelCharge = () => {
    if (phase !== "charging") return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    setPhase("idle");
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Dimensões da esfera e do anel
  const SIZE = 180;
  const RADIUS = 78;
  const CIRC = 2 * Math.PI * RADIUS;
  const dash = CIRC * (1 - progress);

  // Escala da esfera durante o charge (cresce discretamente)
  const orbScale =
    phase === "idle"
      ? 1
      : phase === "charging"
        ? 1 + progress * 0.35
        : phase === "ready"
          ? 1.6
          : 0.3;
  const orbOpacity = phase === "gone" ? 0 : 1;

  return (
    <main className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 py-16 gap-14 overflow-hidden">
      {/* Atmosphere radial */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(232,223,208,0.05), transparent 70%)",
        }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: phase === "gone" ? 0 : 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex items-center gap-3"
      >
        <span
          className="h-px w-10"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
        <span
          className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
          style={{ fontWeight: 500 }}
        >
          O ritual
        </span>
        <span
          className="h-px w-10"
          style={{
            background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
      </motion.div>

      {/* Instrução principal */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.8 }}
          className="relative font-cormorant italic text-[26px] sm:text-[30px] text-bone text-center max-w-sm leading-[1.3]"
        >
          {phase === "idle" && "Pressione e segure."}
          {phase === "charging" && "Segure. Eu preciso sentir."}
          {phase === "ready" && "Já sei o que vou ver."}
          {phase === "gone" && " "}
        </motion.p>
      </AnimatePresence>

      {/* Esfera + anel */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: SIZE + 60, height: SIZE + 60 }}
      >
        {/* Anel de progresso */}
        <svg
          width={SIZE + 60}
          height={SIZE + 60}
          viewBox={`0 0 ${SIZE + 60} ${SIZE + 60}`}
          className="absolute inset-0 pointer-events-none"
          style={{ transform: "rotate(-90deg)" }}
        >
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8dfd0" />
              <stop offset="50%" stopColor="#c9a24a" />
              <stop offset="100%" stopColor="#e8dfd0" />
            </linearGradient>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Anel base sutil */}
          <circle
            cx={(SIZE + 60) / 2}
            cy={(SIZE + 60) / 2}
            r={RADIUS}
            stroke="rgba(232,223,208,0.08)"
            strokeWidth="1"
            fill="none"
          />
          {/* Anel de progresso */}
          <circle
            cx={(SIZE + 60) / 2}
            cy={(SIZE + 60) / 2}
            r={RADIUS}
            stroke="url(#ring-grad)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dash}
            style={{
              transition: phase === "idle" ? "stroke-dashoffset 0.4s" : "none",
              filter: "url(#ring-glow)",
            }}
          />
        </svg>

        {/* Esfera branca brilhante */}
        <button
          type="button"
          onPointerDown={startCharge}
          onPointerUp={cancelCharge}
          onPointerLeave={cancelCharge}
          onPointerCancel={cancelCharge}
          aria-label="Pressione e segure"
          className="relative focus:outline-none cursor-pointer select-none"
          style={{ width: SIZE, height: SIZE }}
        >
          {/* Halo externo */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              scale: orbScale * 1.15,
              opacity: phase === "gone" ? 0 : 0.4 + progress * 0.3,
            }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            style={{
              background:
                "radial-gradient(circle, rgba(232,223,208,0.4) 0%, rgba(232,223,208,0.15) 30%, transparent 65%)",
              filter: "blur(18px)",
            }}
          />

          {/* Esfera principal */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: orbScale,
              opacity: orbOpacity,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 16 }}
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #ffffff 0%, #f4ecd8 22%, #e8dfd0 48%, #c9b88a 75%, #7a6832 100%)",
              boxShadow: [
                "0 0 40px rgba(232,223,208,0.6)",
                "0 0 80px rgba(232,223,208,0.35)",
                "0 0 140px rgba(201,162,74,0.25)",
                "inset 0 0 30px rgba(255,255,255,0.6)",
                "inset 0 -20px 40px rgba(122,104,50,0.3)",
              ].join(", "),
            }}
          />

          {/* Brilho interno pulsante idle */}
          {phase === "idle" && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 25%, transparent 55%)",
              }}
            />
          )}
        </button>
      </div>

      {/* Hint bottom */}
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative font-jetbrains text-[10px] tracking-[1.8px] uppercase text-bone-dim"
          >
            Toque e não solte
          </motion.p>
        )}
        {phase === "charging" && (
          <motion.p
            key="charging"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold"
            style={{ fontWeight: 500 }}
          >
            {Math.round(progress * 100)}%
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
