"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import PageLoading from "@/components/ui/PageLoading";
import ProgressBar from "@/components/ui/ProgressBar";
import { clearPhotoStore, getElementHint, getPhoto } from "@/lib/photo-store";
import { captureReading } from "@/lib/reading-client";
import { loadReadingContext } from "@/lib/reading-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { generateUUID } from "@/lib/uuid";
import type { ReportJSON } from "@/types/report";

type ScanState = "scanning" | "scan_slow" | "scan_failed_low_confidence" | "scan_failed_api_error";

const PHRASES = [
  "Vejo uma linha forte aqui...",
  "Seu coração fala mais alto que você...",
  "Tem algo que você esconde...",
  "Suas mãos lembram mais que sua cabeça...",
  "Eu vi isso antes.",
  "Suas linhas são complexas. Preciso de mais tempo.",
];

function extractImpactPhrase(report: ReportJSON): string {
  return report.impact_phrase || "Suas linhas dizem mais do que você imagina.";
}

function ScanInner() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>("scanning");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [apiResult, setApiResult] = useState<
    | { ok: true; reading_id: string; impact_phrase: string }
    | { ok: false; errorType: "low_confidence" | "api_error" }
    | null
  >(null);
  const didCapture = useRef(false);
  const didNavigate = useRef(false);

  // Effect 1 — API call
  useEffect(() => {
    if (state === "scan_failed_low_confidence" || state === "scan_failed_api_error") return;
    if (didCapture.current) return;
    didCapture.current = true;

    const photo = getPhoto();
    const elementHint = getElementHint();
    clearPhotoStore(); // free memory immediately

    const leadId = sessionStorage.getItem(STORAGE_KEYS.lead_id) ?? undefined;
    const ctx = loadReadingContext();
    const sessionId =
      ctx?.session_id ?? sessionStorage.getItem(STORAGE_KEYS.session_id) ?? generateUUID();
    const targetName = ctx?.target_name ?? sessionStorage.getItem(STORAGE_KEYS.name) ?? "você";
    const targetGender =
      ctx?.target_gender ??
      (sessionStorage.getItem(STORAGE_KEYS.target_gender) as "female" | "male") ??
      "female";
    const isSelf = ctx?.is_self ?? true;
    const dominantHand = ctx?.dominant_hand ?? "right";

    captureReading({
      photo_base64: photo,
      session_id: sessionId,
      lead_id: leadId,
      target_name: targetName,
      target_gender: targetGender,
      is_self: isSelf,
      dominant_hand: dominantHand,
      element_hint: elementHint,
    })
      .then(({ reading_id, report, tier }) => {
        sessionStorage.setItem(STORAGE_KEYS.reading_tier, tier ?? "free");
        setApiResult({ ok: true, reading_id, impact_phrase: extractImpactPhrase(report) });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "";
        setApiResult({
          ok: false,
          errorType: msg.includes("LOW_CONFIDENCE") ? "low_confidence" : "api_error",
        });
      });
  }, [state]);

  // Effect: phrase rotation
  useEffect(() => {
    const total = state === "scan_slow" ? 6 : 5;
    const phraseTimer = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % total);
    }, 2000);
    return () => clearInterval(phraseTimer);
  }, [state]);

  // Effect 2 — Progress animation (caps at 99 until apiResult is ready)
  useEffect(() => {
    if (state === "scan_failed_low_confidence" || state === "scan_failed_api_error") return;

    const start = Date.now();
    const duration = 8000;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(99, (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(tick);
        setAnimDone(true);
      }
    }, 80);
    return () => clearInterval(tick);
  }, [state]);

  // scan_slow: animation done but API still pending — rising-edge at render time
  if (animDone && !apiResult && state === "scanning") {
    setState("scan_slow");
  }

  // Effect 3 — Gate: navigate only when both animDone AND apiResult are set
  useEffect(() => {
    if (!animDone || !apiResult) return;
    if (didNavigate.current) return;
    didNavigate.current = true;

    if (!apiResult.ok) {
      const path =
        apiResult.errorType === "low_confidence"
          ? "/ler/erro?type=low_confidence"
          : "/ler/erro?type=api_error";
      router.replace(path);
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.reading_id, apiResult.reading_id);
    sessionStorage.setItem(STORAGE_KEYS.impact_phrase, apiResult.impact_phrase);
    setTimeout(() => {
      setProgress(100);
      router.push("/ler/revelacao");
    }, 200);
  }, [animDone, apiResult, router]);

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
        className="relative"
      >
        <Eyebrow label="Eu tô lendo" />
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
        <ProgressBar value={progress} color="gold" label="Progresso da leitura" />
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
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ScanInner />
    </Suspense>
  );
}
