"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HandExpectedBadgeProps {
  dominantHand: "right" | "left";
}

export default function HandExpectedBadge({ dominantHand }: HandExpectedBadgeProps) {
  const [dismissed, setDismissed] = useState(false);

  const label = dominantHand === "right" ? "MAO DIREITA" : "MAO ESQUERDA";

  return (
    <div aria-live="polite">
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 left-3 flex items-center gap-2"
            style={{
              background: "rgba(17,12,26,0.8)",
              border: "1px solid rgba(201,162,74,0.1)",
              borderRadius: "0 4px 0 4px",
              padding: "4px 10px",
            }}
          >
            <span
              className="font-jetbrains uppercase"
              style={{
                fontSize: "7px",
                letterSpacing: "2px",
                color: "#7a6832",
              }}
            >
              {label}
            </span>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Fechar aviso de mao esperada"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#7a6832",
                fontSize: "8px",
                lineHeight: 1,
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
