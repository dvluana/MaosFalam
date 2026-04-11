"use client";

import { motion } from "framer-motion";

import HandOutlineSVG from "@/components/camera/HandOutlineSVG";
import Button from "@/components/ui/Button";

interface UploadInstructionScreenProps {
  dominantHand: "right" | "left";
  onContinue: () => void;
  onBack: () => void;
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="3.5" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" />
      {/* 6 rays */}
      <line x1="9" y1="1.5" x2="9" y2="3.5" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="14.5" x2="9" y2="16.5" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="1.5" y1="9" x2="3.5" y2="9" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14.5" y1="9" x2="16.5" y2="9" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.55" y1="3.55" x2="4.97" y2="4.97" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13.03" y1="13.03" x2="14.45" y2="14.45" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14.45" y1="3.55" x2="13.03" y2="4.97" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="4.97" y1="13.03" x2="3.55" y2="14.45" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CleanBackgroundIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="12" height="12" rx="1" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" />
    </svg>
  );
}

function OpenHandIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      {/* 4 fingers (vertical lines) */}
      <line x1="5" y1="10" x2="5" y2="4" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="10" x2="8" y2="3" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="10" x2="11" y2="3" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="5" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Palm base (horizontal) */}
      <path d="M 4 10 Q 9 12 15 10" stroke="rgba(201,162,74,0.6)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const TIPS = [
  { icon: <SunIcon />, label: "BOA LUZ" },
  { icon: <CleanBackgroundIcon />, label: "FUNDO LIMPO" },
  { icon: <OpenHandIcon />, label: "DEDOS ABERTOS" },
] as const;

export default function UploadInstructionScreen({
  dominantHand,
  onContinue,
  onBack,
}: UploadInstructionScreenProps) {
  const handPhrase =
    dominantHand === "right"
      ? "Fotografe sua mao direita. Palma aberta, virada pra cima."
      : "Fotografe sua mao esquerda. Palma aberta, virada pra cima.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 gap-8"
    >
      {/* Eyebrow */}
      <p className="font-jetbrains text-[9px] tracking-[2px] uppercase text-violet opacity-60">
        RETRATO DA PALMA
      </p>

      {/* Hand outline — dimmed to signal instruction, not capture */}
      <HandOutlineSVG dominantHand={dominantHand} size={180} className="opacity-70" />

      {/* Cigana phrase */}
      <p className="font-cormorant italic text-[20px] text-bone text-center max-w-xs leading-[1.35]">
        {handPhrase}
      </p>

      {/* Quality tips */}
      <div className="flex gap-6 justify-center">
        {TIPS.map((tip) => (
          <div key={tip.label} className="flex flex-col items-center gap-2">
            {tip.icon}
            <span className="font-jetbrains text-[9px] tracking-[1.2px] uppercase text-bone-dim">
              {tip.label}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-xs">
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Escolher foto
        </Button>
      </div>
    </motion.div>
  );
}
