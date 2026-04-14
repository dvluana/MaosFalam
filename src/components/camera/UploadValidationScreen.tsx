"use client";

import { motion } from "framer-motion";

import { StatusIcon, checkLabelClass } from "@/components/ui/StatusIcon";
import type { ValidationCheck } from "@/hooks/useUploadValidation";

// ============================================================
// Props
// ============================================================

interface UploadValidationScreenProps {
  checks: ValidationCheck[];
}

// ============================================================
// Component
// ============================================================

export default function UploadValidationScreen({ checks }: UploadValidationScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-8 w-full max-w-md"
    >
      {/* Eyebrow */}
      <p
        className="font-jetbrains text-[9px] tracking-[2px] uppercase text-violet"
        aria-label="Analisando foto"
      >
        ANALISANDO
      </p>

      {/* Large spinner */}
      <span
        className="block w-8 h-8 rounded-full border-2 border-violet/20 border-t-violet animate-spin"
        aria-hidden
      />

      {/* Cigana voice */}
      <p
        className="font-cormorant italic text-[18px] text-bone-dim text-center"
        style={{ letterSpacing: "0.02em" }}
      >
        Deixa eu olhar melhor.
      </p>

      {/* Checks list */}
      <ul className="flex flex-col gap-3" aria-live="polite" aria-label="Progresso da validacao">
        {checks.map((check) => (
          <li key={check.id} className="flex items-center gap-3">
            <StatusIcon status={check.status} />
            <span
              className={`font-jetbrains text-[10px] tracking-[1px] uppercase ${checkLabelClass(check.status)}`}
            >
              {check.label}
            </span>
            {check.detail && (
              <span className="font-jetbrains text-[9px] text-bone-dim opacity-60">
                {check.detail}
              </span>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
