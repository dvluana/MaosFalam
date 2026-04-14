"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import Button from "@/components/ui/Button";
import { StatusIcon, checkLabelClass } from "@/components/ui/StatusIcon";
import type { ValidationCheck, ValidationResult } from "@/hooks/useUploadValidation";

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
      className="flex flex-col items-center gap-5 w-full max-w-md"
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
