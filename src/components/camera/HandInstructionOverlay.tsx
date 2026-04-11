"use client";

import { motion } from "framer-motion";

import Button from "@/components/ui/Button";

import HandOutlineSVG from "./HandOutlineSVG";

interface HandInstructionOverlayProps {
  dominantHand: "right" | "left";
  onReady: () => void;
}

export default function HandInstructionOverlay({
  dominantHand,
  onReady,
}: HandInstructionOverlayProps) {
  const phrase =
    dominantHand === "right"
      ? "Me mostra a mao direita. Palma aberta, virada pra mim."
      : "Me mostra a mao esquerda. Palma aberta, virada pra mim.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-dvh px-6 bg-black"
    >
      <div className="flex flex-col items-center gap-8">
        <HandOutlineSVG dominantHand={dominantHand} size={200} />

        <p
          className="font-cormorant italic text-center text-bone max-w-sm"
          style={{ letterSpacing: "0.02em", fontSize: "18px", lineHeight: "1.5" }}
        >
          {phrase}
        </p>

        <Button variant="primary" onClick={onReady}>
          Abrir camera
        </Button>
      </div>
    </motion.div>
  );
}
