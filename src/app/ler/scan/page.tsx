"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import ProgressBar from "@/components/ui/ProgressBar";
import StateSwitcher from "@/components/ui/StateSwitcher";

type ScanState = "scanning" | "scan_slow" | "scan_failed_low_confidence" | "scan_failed_api_error";

const STATES: readonly ScanState[] = [
  "scanning",
  "scan_slow",
  "scan_failed_low_confidence",
  "scan_failed_api_error",
];

const PHRASES = [
  "Vejo uma linha forte aqui...",
  "Seu coração fala mais alto que você...",
  "Tem algo que você esconde...",
  "Suas mãos lembram mais que sua cabeça...",
  "Eu vi isso antes.",
  "Suas linhas são complexas. Preciso de mais tempo.",
];

function ScanInner() {
  const router = useRouter();
  const search = useSearchParams();
  const forced = search?.get("state") as ScanState | null;
  const [state, setState] = useState<ScanState>(forced ?? "scanning");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  if (forced && forced !== state) {
    setState(forced);
  }

  useEffect(() => {
    const total = state === "scan_slow" ? 6 : 5;
    const phraseTimer = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % total);
    }, 2000);
    return () => clearInterval(phraseTimer);
  }, [state]);

  useEffect(() => {
    if (state === "scan_failed_low_confidence") {
      router.replace("/ler/erro?type=low_confidence");
      return;
    }
    if (state === "scan_failed_api_error") {
      router.replace("/ler/erro?type=api_error");
      return;
    }
    if (state !== "scanning" && state !== "scan_slow") return;

    const start = Date.now();
    const duration = 8000;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        router.push("/ler/revelacao");
      }
    }, 80);
    return () => clearInterval(tick);
  }, [state, router]);

  if (state === "scan_failed_low_confidence" || state === "scan_failed_api_error") {
    return <main className="min-h-dvh bg-black" />;
  }

  return (
    <main className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-16 gap-12 overflow-hidden">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(201,162,74,0.06), transparent 75%)",
        }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
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
          Eu tô lendo
        </span>
        <span
          className="h-px w-10"
          style={{
            background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
      </motion.div>

      <div className="relative h-24 flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8 }}
            className="font-cormorant italic text-[26px] sm:text-[30px] text-bone text-center max-w-sm leading-[1.3]"
          >
            {PHRASES[phraseIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar com ticks */}
      <div className="relative w-full max-w-xs flex flex-col gap-3">
        <ProgressBar value={progress} color="gold" />
        <div className="flex items-baseline justify-between">
          <span
            className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold-dim"
            style={{ fontWeight: 500 }}
          >
            Lendo suas linhas
          </span>
          <span
            className="font-jetbrains text-[9.5px] tracking-[1.5px] text-gold"
            style={{ fontWeight: 500 }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <StateSwitcher states={STATES} current={state} />
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-black" />}>
      <ScanInner />
    </Suspense>
  );
}
