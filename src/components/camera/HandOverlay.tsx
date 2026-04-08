"use client";

import { motion } from "framer-motion";

interface HandOverlayProps {
  state: "dim" | "bright" | "stable" | "capturing";
}

export default function HandOverlay({ state }: HandOverlayProps) {
  const stroke =
    state === "dim"
      ? "rgba(201,162,74,0.25)"
      : state === "bright"
        ? "rgba(201,162,74,0.7)"
        : state === "stable"
          ? "#C9A24A"
          : "#d9b86a";

  return (
    <motion.svg
      viewBox="0 0 200 260"
      className="w-[75%] max-w-sm h-auto"
      animate={{
        opacity: state === "capturing" ? [1, 0.3, 1] : 1,
        scale: state === "stable" ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: state === "stable" ? 1.2 : 0.4,
        repeat: state === "stable" ? Infinity : 0,
      }}
    >
      <path
        d="M60 210 Q50 160 55 120 Q45 110 50 90 Q55 80 65 85 Q70 60 78 62 Q85 64 84 95 Q92 40 102 42 Q112 44 108 100 Q118 50 128 54 Q138 58 130 110 Q142 90 150 98 Q158 108 148 140 Q150 180 140 210 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeDasharray="4 3"
      />
    </motion.svg>
  );
}
