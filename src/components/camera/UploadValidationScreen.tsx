"use client";

import { motion } from "framer-motion";

import type { ValidationCheck, CheckStatus } from "@/hooks/useUploadValidation";

// ============================================================
// Status icon helpers
// ============================================================

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pending") {
    return <span className="inline-block w-1.5 h-1.5 rounded-full bg-bone/20" aria-hidden />;
  }

  if (status === "running") {
    return (
      <span
        className="inline-block w-3 h-3 rounded-full border border-violet/40 border-t-violet animate-spin"
        aria-hidden
      />
    );
  }

  if (status === "pass") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 6l3 3 5-5" stroke="#c9a24a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === "fail") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 2l8 8M10 2l-8 8" stroke="#c4647a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // skip
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 6h8" stroke="rgba(232,223,208,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function checkLabelClass(status: CheckStatus): string {
  if (status === "pass") return "text-gold";
  if (status === "fail") return "text-rose";
  if (status === "skip") return "text-bone-dim opacity-40";
  return "text-bone-dim";
}

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
      className="flex flex-col items-center justify-center min-h-dvh px-6 bg-black gap-8"
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
