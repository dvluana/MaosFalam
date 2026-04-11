"use client";

import { motion } from "framer-motion";

import Button from "@/components/ui/Button";

interface UploadInstructionScreenProps {
  dominantHand: "right" | "left";
  targetName?: string;
  isSelf?: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const TIPS = [
  { icon: "☉", label: "Boa luz" },
  { icon: "◻", label: "Fundo limpo" },
  { icon: "✋", label: "Dedos abertos" },
] as const;

export default function UploadInstructionScreen({
  dominantHand,
  targetName,
  isSelf = true,
  onContinue,
  onBack,
}: UploadInstructionScreenProps) {
  const handSide = dominantHand === "right" ? "direita" : "esquerda";
  const handPhrase =
    !isSelf && targetName
      ? `Fotografe a mão ${handSide} do ${targetName}. Palma aberta, virada pra cima.`
      : `Fotografe sua mão ${handSide}. Palma aberta, virada pra cima.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-10 w-full max-w-sm"
    >
      {/* Cigana phrase */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-cormorant italic text-[22px] sm:text-[24px] text-bone text-center leading-[1.35]"
      >
        {handPhrase}
      </motion.p>

      {/* Quality tips — stacked cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="flex flex-col gap-3 w-full"
      >
        {TIPS.map((tip, i) => (
          <motion.div
            key={tip.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-4 px-4 py-3"
            style={{
              background: "rgba(17,12,26,0.6)",
              border: "1px solid rgba(201,162,74,0.08)",
              borderRadius: "0 6px 0 6px",
            }}
          >
            <span className="text-gold text-[16px] w-6 text-center shrink-0">{tip.icon}</span>
            <span className="font-raleway text-[13px] text-bone tracking-[0.02em]">
              {tip.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Actions — stacked */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col gap-3 w-full"
      >
        <Button variant="primary" size="lg" onClick={onContinue}>
          Selecionar foto
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center font-raleway text-[13px] text-bone-dim hover:text-bone transition-colors py-2"
        >
          Voltar
        </button>
      </motion.div>
    </motion.div>
  );
}
