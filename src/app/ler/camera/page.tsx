"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CameraFeedback from "@/components/camera/CameraFeedback";
import StateSwitcher from "@/components/ui/StateSwitcher";
import Button from "@/components/ui/Button";

type CamState =
  | "method_choice"
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
  "method_choice",
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
  method_choice: "",
  loading_mediapipe: "Preciso ver melhor.",
  camera_active_no_hand: "Posicione sua mão na moldura.",
  camera_hand_detected: "Abra mais os dedos.",
  camera_stable: "Segure.",
  camera_capturing: "",
  camera_permission_denied:
    "Preciso dos seus olhos emprestados. Libera a câmera.",
  camera_permission_denied_permanent:
    "Abra nas configurações do celular pra me deixar ver.",
  camera_fallback_upload: "Me manda um retrato da sua mão então.",
  camera_error_generic: "Algo saiu errado. Tente de novo.",
};

const eyebrowLabel: Record<CamState, string> = {
  method_choice: "Como você me mostra",
  loading_mediapipe: "Preparando",
  camera_active_no_hand: "Aguardando",
  camera_hand_detected: "Ajustando",
  camera_stable: "Capturando",
  camera_capturing: "Capturado",
  camera_permission_denied: "Sem acesso",
  camera_permission_denied_permanent: "Sem acesso",
  camera_fallback_upload: "Retrato",
  camera_error_generic: "Erro",
};

function CameraPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const forced = search?.get("state") as CamState | null;
  const [state, setState] = useState<CamState>(forced ?? "method_choice");

  if (forced && forced !== state) {
    setState(forced);
  }

  useEffect(() => {
    if (forced) return;
    // A simulação do pipeline da câmera só começa quando a usuária escolher
    // "Mostrar a mão agora". Enquanto state === "method_choice" a tela fica
    // travada esperando a escolha.
    if (state !== "loading_mediapipe") return;
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
  }, [forced, router, state]);

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

      {/* Título principal — só fora de method_choice */}
      <AnimatePresence mode="wait">
        {!isError && state !== "method_choice" && (
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
        {state === "method_choice" && (
          <motion.div
            key="method_choice_title"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative text-center max-w-md"
          >
            <h1 className="font-cinzel text-[24px] sm:text-[28px] text-bone leading-tight mb-2">
              Me mostra sua mão.
            </h1>
            <p className="font-cormorant italic text-[17px] sm:text-[19px] text-bone-dim leading-[1.35]">
              Tem dois jeitos. Você escolhe.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ESCOLHA DO MÉTODO ═══
          Primeira tela do fluxo de foto. Duas cartas místicas: "Mostrar
          a mão agora" (câmera ao vivo) ou "Te entregar um retrato"
          (upload de foto existente). Aparece tanto no fluxo logado
          quanto no anônimo. */}
      {state === "method_choice" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl"
        >
          {/* Carta 1: Câmera ao vivo */}
          <button
            type="button"
            onClick={() => setState("loading_mediapipe")}
            className="group relative overflow-hidden card-noise text-left transition-all focus:outline-none"
            style={{
              aspectRatio: "5 / 7",
              background:
                "linear-gradient(165deg, #0e0a18 0%, #110c1a 50%, #08050e 100%)",
              border: "1px solid rgba(201,162,74,0.35)",
              boxShadow:
                "0 28px 56px -16px rgba(0,0,0,0.9), 0 0 40px -12px rgba(201,162,74,0.22)",
            }}
          >
            {/* Radial glow */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(201,162,74,0.16), transparent 75%)",
              }}
            />

            {/* Moldura interna */}
            <div
              aria-hidden
              className="absolute inset-2 pointer-events-none"
              style={{ border: "1px solid rgba(201,162,74,0.18)" }}
            />

            {/* 4 corner accents */}
            {(
              [
                ["top", "left"],
                ["top", "right"],
                ["bottom", "left"],
                ["bottom", "right"],
              ] as const
            ).map(([v, h]) => (
              <span
                key={`${v}-${h}`}
                aria-hidden
                className="absolute"
                style={{
                  [v]: 3,
                  [h]: 3,
                  width: 14,
                  height: 14,
                  borderStyle: "solid",
                  borderColor: "rgba(201,162,74,0.65)",
                  borderWidth: `${v === "top" ? "1.5px" : "0"} ${h === "right" ? "1.5px" : "0"} ${v === "bottom" ? "1.5px" : "0"} ${h === "left" ? "1.5px" : "0"}`,
                }}
              />
            ))}

            {/* Ilustração: olho/visor místico */}
            <div className="relative h-full flex flex-col items-center justify-between px-5 py-8 text-center">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-gold-dim/50" />
                <span
                  className="w-1.5 h-1.5 rotate-45 bg-gold"
                  style={{ boxShadow: "0 0 6px rgba(201,162,74,0.7)" }}
                />
                <span className="h-px w-6 bg-gold-dim/50" />
              </div>

              <svg
                width="110"
                height="110"
                viewBox="0 0 120 120"
                fill="none"
                aria-hidden
                className="transition-transform duration-500 group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 0 14px rgba(201,162,74,0.35)) drop-shadow(0 0 32px rgba(201,162,74,0.12))",
                }}
              >
                <defs>
                  <linearGradient id="eye-grad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#e3c77a" />
                    <stop offset="50%" stopColor="#c9a24a" />
                    <stop offset="100%" stopColor="#6e5a28" />
                  </linearGradient>
                  <radialGradient id="eye-iris" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,220,140,0.5)" />
                    <stop offset="100%" stopColor="rgba(201,162,74,0)" />
                  </radialGradient>
                </defs>

                {/* Anéis externos */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="rgba(201,162,74,0.15)"
                  strokeWidth="0.5"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  stroke="rgba(201,162,74,0.28)"
                  strokeWidth="0.5"
                  strokeDasharray="2 3"
                  fill="none"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 60 60"
                    to="360 60 60"
                    dur="40s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Olho místico */}
                <path
                  d="M 16 60 Q 60 24 104 60 Q 60 96 16 60 Z"
                  stroke="url(#eye-grad)"
                  strokeWidth="1.5"
                  fill="rgba(201,162,74,0.06)"
                />
                {/* Íris */}
                <circle cx="60" cy="60" r="18" fill="url(#eye-iris)">
                  <animate
                    attributeName="r"
                    values="16;20;16"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx="60"
                  cy="60"
                  r="14"
                  stroke="url(#eye-grad)"
                  strokeWidth="1.2"
                  fill="none"
                />
                {/* Pupila */}
                <circle cx="60" cy="60" r="5" fill="#08050e" />
                <circle cx="60" cy="60" r="3" fill="url(#eye-grad)">
                  <animate
                    attributeName="r"
                    values="2.5;4;2.5"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Brilho na pupila */}
                <circle cx="57" cy="57" r="1.2" fill="#ffe79a" />
                {/* Raios saindo do olho */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <line
                    key={deg}
                    x1="60"
                    y1="28"
                    x2="60"
                    y2="22"
                    stroke="url(#eye-grad)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    transform={`rotate(${deg} 60 60)`}
                    opacity="0.6"
                  />
                ))}
              </svg>

              <div className="flex flex-col items-center gap-2">
                <span
                  className="font-jetbrains text-[8.5px] tracking-[1.8px] uppercase text-gold-dim"
                  style={{ fontWeight: 500 }}
                >
                  ao vivo
                </span>
                <h3 className="font-cinzel text-[18px] sm:text-[20px] font-medium tracking-[0.04em] text-gold leading-tight">
                  Abrir a mão agora
                </h3>
                <p className="font-cormorant italic text-[14px] text-bone-dim leading-[1.4] max-w-[180px]">
                  Deixa eu ver na sua frente. Abro a câmera, você estende
                  a palma.
                </p>
              </div>
            </div>
          </button>

          {/* Carta 2: Upload de foto */}
          <button
            type="button"
            onClick={() => setState("camera_fallback_upload")}
            className="group relative overflow-hidden card-noise text-left transition-all focus:outline-none"
            style={{
              aspectRatio: "5 / 7",
              background:
                "linear-gradient(165deg, #0e0a18 0%, #110c1a 50%, #08050e 100%)",
              border: "1px solid rgba(201,162,74,0.35)",
              boxShadow:
                "0 28px 56px -16px rgba(0,0,0,0.9), 0 0 40px -12px rgba(139,123,191,0.22)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(139,123,191,0.16), transparent 75%)",
              }}
            />

            <div
              aria-hidden
              className="absolute inset-2 pointer-events-none"
              style={{ border: "1px solid rgba(201,162,74,0.18)" }}
            />

            {(
              [
                ["top", "left"],
                ["top", "right"],
                ["bottom", "left"],
                ["bottom", "right"],
              ] as const
            ).map(([v, h]) => (
              <span
                key={`${v}-${h}`}
                aria-hidden
                className="absolute"
                style={{
                  [v]: 3,
                  [h]: 3,
                  width: 14,
                  height: 14,
                  borderStyle: "solid",
                  borderColor: "rgba(201,162,74,0.65)",
                  borderWidth: `${v === "top" ? "1.5px" : "0"} ${h === "right" ? "1.5px" : "0"} ${v === "bottom" ? "1.5px" : "0"} ${h === "left" ? "1.5px" : "0"}`,
                }}
              />
            ))}

            {/* Ilustração: pergaminho/carta sendo entregue */}
            <div className="relative h-full flex flex-col items-center justify-between px-5 py-8 text-center">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-gold-dim/50" />
                <span
                  className="w-1.5 h-1.5 rotate-45 bg-gold"
                  style={{ boxShadow: "0 0 6px rgba(201,162,74,0.7)" }}
                />
                <span className="h-px w-6 bg-gold-dim/50" />
              </div>

              <svg
                width="110"
                height="110"
                viewBox="0 0 120 120"
                fill="none"
                aria-hidden
                className="transition-transform duration-500 group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 0 14px rgba(139,123,191,0.35)) drop-shadow(0 0 32px rgba(201,162,74,0.12))",
                }}
              >
                <defs>
                  <linearGradient
                    id="scroll-grad"
                    x1="50%"
                    y1="0%"
                    x2="50%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#e3c77a" />
                    <stop offset="50%" stopColor="#c9a24a" />
                    <stop offset="100%" stopColor="#6e5a28" />
                  </linearGradient>
                </defs>

                {/* Anéis externos */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="rgba(201,162,74,0.15)"
                  strokeWidth="0.5"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  stroke="rgba(139,123,191,0.28)"
                  strokeWidth="0.5"
                  strokeDasharray="2 3"
                  fill="none"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="360 60 60"
                    to="0 60 60"
                    dur="50s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Retrato/moldura antiga levitando */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0 0; 0 -3; 0 0; 0 2; 0 0"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                  {/* Moldura externa */}
                  <rect
                    x="35"
                    y="32"
                    width="50"
                    height="56"
                    stroke="url(#scroll-grad)"
                    strokeWidth="1.5"
                    fill="rgba(14,10,24,0.7)"
                  />
                  {/* Moldura interna */}
                  <rect
                    x="39"
                    y="36"
                    width="42"
                    height="48"
                    stroke="rgba(201,162,74,0.4)"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  {/* Linhas do retrato (sugerem uma mão) */}
                  <path
                    d="M 48 52 Q 56 46 64 52 Q 72 58 72 68"
                    stroke="rgba(201,162,74,0.5)"
                    strokeWidth="0.7"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 48 62 Q 60 58 72 62"
                    stroke="rgba(201,162,74,0.5)"
                    strokeWidth="0.7"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50 72 Q 60 70 70 75"
                    stroke="rgba(196,100,122,0.5)"
                    strokeWidth="0.7"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Corner accents no retrato */}
                  <path
                    d="M 38 35 L 42 35 M 38 35 L 38 39"
                    stroke="url(#scroll-grad)"
                    strokeWidth="1"
                  />
                  <path
                    d="M 82 35 L 78 35 M 82 35 L 82 39"
                    stroke="url(#scroll-grad)"
                    strokeWidth="1"
                  />
                  <path
                    d="M 38 85 L 42 85 M 38 85 L 38 81"
                    stroke="url(#scroll-grad)"
                    strokeWidth="1"
                  />
                  <path
                    d="M 82 85 L 78 85 M 82 85 L 82 81"
                    stroke="url(#scroll-grad)"
                    strokeWidth="1"
                  />
                </g>

                {/* Partículas de luz ao redor */}
                <circle cx="30" cy="50" r="1" fill="#ffe79a">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="90" cy="58" r="0.8" fill="#ffe79a">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="3.2s"
                    begin="0.7s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="28" cy="70" r="0.9" fill="#ffe79a">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="3s"
                    begin="1.3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="92" cy="78" r="0.7" fill="#ffe79a">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="3.4s"
                    begin="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              <div className="flex flex-col items-center gap-2">
                <span
                  className="font-jetbrains text-[8.5px] tracking-[1.8px] uppercase text-gold-dim"
                  style={{ fontWeight: 500 }}
                >
                  retrato
                </span>
                <h3 className="font-cinzel text-[18px] sm:text-[20px] font-medium tracking-[0.04em] text-gold leading-tight">
                  Te entregar a foto
                </h3>
                <p className="font-cormorant italic text-[14px] text-bone-dim leading-[1.4] max-w-[180px]">
                  Já tem um retrato da sua palma. Me manda ele que eu leio
                  do mesmo jeito.
                </p>
              </div>
            </div>
          </button>
        </motion.div>
      )}

      {/* Moldura vazia (sem ilustração da mão) */}
      {!isError && state !== "method_choice" && (
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
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  // Mock: ao selecionar um arquivo, flasha capturing e pusha
                  // pro scan. TODO (backend): upload real pra storage,
                  // depois envio pra API de visão com o URL do arquivo.
                  if (!e.target.files?.length) return;
                  setState("camera_capturing");
                  if (
                    typeof navigator !== "undefined" &&
                    "vibrate" in navigator
                  ) {
                    navigator.vibrate?.(120);
                  }
                  window.setTimeout(() => router.push("/ler/scan"), 600);
                }}
              />
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
