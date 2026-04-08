"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CameraFeedback from "@/components/camera/CameraFeedback";
import StateSwitcher from "@/components/ui/StateSwitcher";
import Button from "@/components/ui/Button";

type CamState =
  | "loading_mediapipe"
  | "camera_active_no_hand"
  | "camera_hand_detected"
  | "camera_stable"
  | "camera_capturing"
  | "camera_permission_denied"
  | "camera_permission_denied_permanent"
  | "camera_fallback_upload"
  | "camera_error_generic";

const STATES: readonly CamState[] = [
  "loading_mediapipe",
  "camera_active_no_hand",
  "camera_hand_detected",
  "camera_stable",
  "camera_capturing",
  "camera_permission_denied",
  "camera_permission_denied_permanent",
  "camera_fallback_upload",
  "camera_error_generic",
];

const feedback: Record<CamState, string> = {
  loading_mediapipe: "Preciso ver melhor.",
  camera_active_no_hand: "Posicione sua mão na moldura.",
  camera_hand_detected: "Abra mais os dedos.",
  camera_stable: "Segure.",
  camera_capturing: "",
  camera_permission_denied:
    "Preciso dos seus olhos emprestados. Libera a câmera.",
  camera_permission_denied_permanent:
    "Abra nas configurações do celular pra me deixar ver.",
  camera_fallback_upload: "Sua câmera tá tímida. Me manda a foto então.",
  camera_error_generic: "Algo saiu errado. Tente de novo.",
};

const eyebrowLabel: Record<CamState, string> = {
  loading_mediapipe: "Preparando",
  camera_active_no_hand: "Aguardando",
  camera_hand_detected: "Ajustando",
  camera_stable: "Capturando",
  camera_capturing: "Capturado",
  camera_permission_denied: "Sem acesso",
  camera_permission_denied_permanent: "Sem acesso",
  camera_fallback_upload: "Alternativa",
  camera_error_generic: "Erro",
};

function CameraPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const forced = search?.get("state") as CamState | null;
  const [state, setState] = useState<CamState>(forced ?? "loading_mediapipe");

  if (forced && forced !== state) {
    setState(forced);
  }

  useEffect(() => {
    if (forced) {
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setState("camera_active_no_hand"), 1500));
    timers.push(setTimeout(() => setState("camera_hand_detected"), 3500));
    timers.push(setTimeout(() => setState("camera_stable"), 5500));
    timers.push(
      setTimeout(() => {
        setState("camera_capturing");
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(120);
        }
      }, 7000),
    );
    timers.push(setTimeout(() => router.push("/ler/scan"), 7500));
    return () => timers.forEach(clearTimeout);
  }, [forced, router]);

  const isError =
    state === "camera_permission_denied" ||
    state === "camera_permission_denied_permanent" ||
    state === "camera_fallback_upload" ||
    state === "camera_error_generic";

  const frameActive =
    state === "camera_hand_detected" ||
    state === "camera_stable" ||
    state === "camera_capturing";

  return (
    <main className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-16 gap-10 overflow-hidden">
      {/* Flash de captura */}
      <AnimatePresence>
        {state === "camera_capturing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(232,223,208,0.9), transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

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
        transition={{ duration: 1 }}
        className="relative flex items-center gap-3"
      >
        <span
          className="h-px w-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
        <span
          className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
          style={{ fontWeight: 500 }}
        >
          {eyebrowLabel[state]}
        </span>
        <span
          className="h-px w-10"
          style={{
            background:
              "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
      </motion.div>

      {/* Título principal */}
      <AnimatePresence mode="wait">
        {!isError && (
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.6 }}
            className="relative font-cormorant italic text-[24px] sm:text-[28px] text-bone text-center max-w-sm leading-[1.3]"
          >
            {feedback[state]}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Moldura vazia (sem ilustração da mão) */}
      {!isError && (
        <div className="relative flex items-center justify-center">
          <motion.div
            className="relative"
            animate={{
              scale: state === "camera_capturing" ? 0.98 : 1,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{
              width: "min(280px, 75vw)",
              aspectRatio: "3 / 4",
              background:
                "linear-gradient(180deg, rgba(14,10,24,0.3), rgba(14,10,24,0.55))",
              border: frameActive
                ? "1px solid rgba(201,162,74,0.55)"
                : "1px solid rgba(201,162,74,0.18)",
              transition: "border-color 0.5s",
              boxShadow: frameActive
                ? "0 0 60px rgba(201,162,74,0.22), 0 28px 56px -16px rgba(0,0,0,0.9)"
                : "0 28px 56px -16px rgba(0,0,0,0.85)",
            }}
          >
            {/* Corner accents animados */}
            {(
              [
                ["top", "left"],
                ["top", "right"],
                ["bottom", "left"],
                ["bottom", "right"],
              ] as const
            ).map(([v, h]) => (
              <motion.span
                key={`${v}-${h}`}
                aria-hidden
                className="absolute"
                animate={{
                  width: frameActive ? 22 : 16,
                  height: frameActive ? 22 : 16,
                  opacity: frameActive ? 1 : 0.6,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  [v]: -1,
                  [h]: -1,
                  borderColor: frameActive
                    ? "rgba(201,162,74,0.85)"
                    : "rgba(201,162,74,0.4)",
                  borderStyle: "solid",
                  borderWidth: `${v === "top" ? "2px" : "0"} ${h === "right" ? "2px" : "0"} ${v === "bottom" ? "2px" : "0"} ${h === "left" ? "2px" : "0"}`,
                  transition: "border-color 0.5s",
                }}
              />
            ))}

            {/* Crosshair center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="relative"
                animate={{
                  opacity: state === "loading_mediapipe" ? 0.3 : 0.6,
                }}
                transition={{ duration: 0.8 }}
              >
                {/* Vertical line */}
                <span
                  className="absolute left-1/2 top-0 w-px h-16 -translate-x-1/2 -translate-y-full"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(201,162,74,0.45))",
                  }}
                />
                <span
                  className="absolute left-1/2 bottom-0 w-px h-16 -translate-x-1/2 translate-y-full"
                  style={{
                    background:
                      "linear-gradient(0deg, transparent, rgba(201,162,74,0.45))",
                  }}
                />
                <span
                  className="absolute top-1/2 left-0 h-px w-16 -translate-y-1/2 -translate-x-full"
                  style={{
                    background:
                      "linear-gradient(270deg, transparent, rgba(201,162,74,0.45))",
                  }}
                />
                <span
                  className="absolute top-1/2 right-0 h-px w-16 -translate-y-1/2 translate-x-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(201,162,74,0.45))",
                  }}
                />
                {/* Ponto central pulsante */}
                <motion.span
                  className="block w-2 h-2 rotate-45 bg-gold"
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    scale: frameActive ? [1, 1.3, 1] : [1, 1.1, 1],
                  }}
                  transition={{
                    duration: frameActive ? 1.2 : 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ boxShadow: "0 0 10px rgba(201,162,74,0.6)" }}
                />
              </motion.div>
            </div>

            {/* Scan line em camera_stable */}
            {state === "camera_stable" && (
              <motion.div
                className="absolute inset-x-0 h-px pointer-events-none"
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(201,162,74,0.8), transparent)",
                  boxShadow: "0 0 12px rgba(201,162,74,0.7)",
                }}
              />
            )}
          </motion.div>
        </div>
      )}

      {/* Feedback secundário */}
      {!isError && state !== "camera_capturing" && (
        <div className="relative">
          <CameraFeedback text="" />
        </div>
      )}

      {/* Error states */}
      {isError && (
        <div className="relative flex flex-col items-center gap-6 max-w-sm text-center mt-4">
          <p className="font-cormorant italic text-[22px] sm:text-[26px] text-bone leading-[1.35]">
            {feedback[state]}
          </p>
          {state === "camera_fallback_upload" && (
            <label
              className="font-jetbrains text-[10px] text-gold uppercase tracking-[1.8px] branded-radius px-6 py-4 cursor-pointer"
              style={{
                fontWeight: 500,
                border: "1px solid rgba(201,162,74,0.45)",
                background: "rgba(14,10,24,0.6)",
              }}
            >
              Enviar foto da palma
              <input type="file" accept="image/*" className="hidden" />
            </label>
          )}
          {state !== "camera_fallback_upload" && (
            <Button
              variant="secondary"
              onClick={() => router.replace("/ler/camera")}
            >
              Tentar de novo
            </Button>
          )}
        </div>
      )}

      <StateSwitcher states={STATES} current={state} />
    </main>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-black" />}>
      <CameraPageInner />
    </Suspense>
  );
}
