"use client";

import { motion } from "framer-motion";

interface HandTouchProps {
  touched: boolean;
}

export default function HandTouch({ touched }: HandTouchProps) {
  const lineColor = touched ? "#C4647A" : "#7B6BA5";
  const outline = touched ? "#C9A24A" : "#7a6832";

  return (
    <motion.svg
      viewBox="0 0 200 260"
      className="w-56 h-auto"
      animate={{ scale: touched ? 1.04 : [1, 1.02, 1] }}
      transition={{
        duration: touched ? 0.6 : 4,
        repeat: touched ? 0 : Infinity,
        ease: "easeInOut",
      }}
    >
      <defs>
        <radialGradient id="palmGlow" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="rgba(201,162,74,0.18)" />
          <stop offset="100%" stopColor="rgba(201,162,74,0)" />
        </radialGradient>
      </defs>
      {/* palm + fingers outline */}
      <path
        d="M60 210 Q50 160 55 120 Q45 110 50 90 Q55 80 65 85 Q70 60 78 62 Q85 64 84 95 Q92 40 102 42 Q112 44 108 100 Q118 50 128 54 Q138 58 130 110 Q142 90 150 98 Q158 108 148 140 Q150 180 140 210 Z"
        fill="url(#palmGlow)"
        stroke={outline}
        strokeWidth="1.2"
      />
      {/* heart line */}
      <motion.path
        d="M70 130 Q100 120 135 125"
        stroke={lineColor}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: touched ? 1 : 0.5 }}
        transition={{ duration: 1.2 }}
      />
      {/* head line */}
      <motion.path
        d="M68 150 Q100 148 130 152"
        stroke={touched ? "#C9A24A" : "#4a3d6e"}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: touched ? 0.9 : 0.4 }}
        transition={{ duration: 1.4, delay: 0.2 }}
      />
      {/* life line */}
      <motion.path
        d="M75 135 Q65 170 80 200"
        stroke={touched ? "#C9A24A" : "#7a6832"}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: touched ? 0.9 : 0.4 }}
        transition={{ duration: 1.6, delay: 0.4 }}
      />
    </motion.svg>
  );
}
