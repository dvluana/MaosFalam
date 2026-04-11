"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import Button from "@/components/ui/Button";
import type { ValidationCheck, ValidationResult, CheckStatus } from "@/hooks/useUploadValidation";

// ============================================================
// Status icon (compact, reused from UploadValidationScreen)
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
        <path
          d="M2 6l3 3 5-5"
          stroke="#c9a24a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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

// Abbreviated labels for the compact checklist
const ABBREVIATED_LABELS: Record<ValidationCheck["id"], string> = {
  format: "Formato",
  size: "Tamanho",
  hand_detected: "Mão detectada",
  handedness: "Mão correta",
  palm_open: "Palma aberta",
};

// ============================================================
// Props
// ============================================================

interface UploadConfirmScreenProps {
  result: ValidationResult;
  targetName?: string;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
}

// ============================================================
// Component
// ============================================================

export default function UploadConfirmScreen({
  result,
  targetName,
  onConfirm,
  onRetry,
  onBack,
}: UploadConfirmScreenProps) {
  const { previewUrl, checks, canProceed, qualityOk, error } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-5 w-full max-w-sm px-6"
    >
      {/* Photo preview */}
      {previewUrl && (
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "3 / 4",
            borderRadius: "0 6px 0 6px",
            border: "1px solid rgba(201,162,74,0.2)",
          }}
        >
          <Image src={previewUrl} alt="Foto da palma" fill className="object-cover" unoptimized />
        </div>
      )}

      {/* Checklist — 2 columns */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full" aria-label="Resultado da validacao">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2">
            <StatusIcon status={check.status} />
            <span
              className={`font-jetbrains text-[10px] tracking-[1px] uppercase ${checkLabelClass(check.status)}`}
            >
              {ABBREVIATED_LABELS[check.id]}
            </span>
          </div>
        ))}
      </div>

      {/* Action block — 3 cases */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* CASE A: hand ok + quality ok */}
        {canProceed && qualityOk && (
          <>
            <p
              className="font-cormorant italic text-[16px] text-gold text-center"
              style={{ letterSpacing: "0.02em" }}
            >
              {targetName
                ? `Tudo certo. A mão do ${targetName} fala.`
                : "Tudo certo. Essa mão fala."}
            </p>
            <Button variant="primary" onClick={onConfirm} className="w-full">
              Enviar pra leitura
            </Button>
            <Button variant="ghost" onClick={onRetry}>
              Trocar foto
            </Button>
          </>
        )}

        {/* CASE B: hand ok but quality not ok */}
        {canProceed && !qualityOk && (
          <>
            <p
              className="font-cormorant italic text-[16px] text-bone text-center"
              style={{ letterSpacing: "0.02em" }}
            >
              {targetName
                ? `A mão do ${targetName} está aqui. A foto podia ser melhor.`
                : "A mão está aqui. A foto podia ser melhor."}
            </p>
            <p className="font-jetbrains text-[9px] text-bone-dim tracking-[1px] uppercase">
              PODE AFETAR A LEITURA
            </p>
            <Button variant="primary" onClick={onConfirm} className="w-full">
              Usar mesmo assim
            </Button>
            <Button variant="secondary" onClick={onRetry} className="w-full">
              Tirar outra
            </Button>
          </>
        )}

        {/* CASE C: fatal error */}
        {!canProceed && error && (
          <>
            <p
              className="font-cormorant italic text-[16px] text-rose text-center"
              style={{ letterSpacing: "0.02em" }}
            >
              {error}
            </p>
            <Button variant="primary" onClick={onRetry} className="w-full">
              Tentar de novo
            </Button>
            <Button variant="ghost" onClick={onBack}>
              Voltar
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
