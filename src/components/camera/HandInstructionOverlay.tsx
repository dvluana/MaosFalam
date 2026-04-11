"use client";

import { motion } from "framer-motion";

import Button from "@/components/ui/Button";

interface HandInstructionOverlayProps {
  dominantHand: "right" | "left";
  onReady: () => void;
  targetName?: string;
  isSelf?: boolean;
}

export default function HandInstructionOverlay({
  dominantHand,
  onReady,
  targetName,
  isSelf = true,
}: HandInstructionOverlayProps) {
  const handSide = dominantHand === "right" ? "direita" : "esquerda";
  const phrase =
    isSelf || !targetName
      ? `Me mostra a mão ${handSide}. Palma aberta, virada pra mim.`
      : `Me mostra a mão ${handSide} do ${targetName}. Palma aberta, virada pra mim.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-dvh px-6 bg-black"
    >
      <div className="flex flex-col items-center gap-10 max-w-sm">
        {/* Hand side badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-jetbrains text-[9px] tracking-[2px] uppercase px-4 py-2"
          style={{
            color: "#C9A24A",
            border: "1px solid rgba(201,162,74,0.2)",
            borderRadius: "0 4px 0 4px",
            background: "rgba(201,162,74,0.06)",
          }}
        >
          mão {handSide}
        </motion.span>

        {/* Cigana phrase */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-cormorant italic text-center text-bone text-[22px] sm:text-[24px] leading-[1.4]"
          style={{ letterSpacing: "0.02em" }}
        >
          {phrase}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button variant="primary" size="lg" onClick={onReady}>
            Abrir câmera
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
