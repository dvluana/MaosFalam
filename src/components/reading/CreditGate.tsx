"use client";

import { motion } from "framer-motion";

import Button from "@/components/ui/Button";

interface CreditGateProps {
  balance: number;
  targetName: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming: boolean;
}

export default function CreditGate({
  balance,
  targetName,
  onConfirm,
  onCancel,
  confirming,
}: CreditGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(8, 5, 14, 0.80)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-sm"
        style={{
          background: "#110C1A",
          borderRadius: "0 6px 0 6px",
        }}
      >
        {/* Gold accent line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55), transparent)",
          }}
        />

        {/* Corner ornament: top-left */}
        <span
          className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
          style={{
            borderTop: "1px solid rgba(201,162,74,0.25)",
            borderLeft: "1px solid rgba(201,162,74,0.25)",
          }}
        />
        {/* Corner ornament: bottom-right */}
        <span
          className="absolute bottom-[-1px] right-[-1px] w-3 h-3 pointer-events-none"
          style={{
            borderBottom: "1px solid rgba(201,162,74,0.25)",
            borderRight: "1px solid rgba(201,162,74,0.25)",
          }}
        />

        {/* Inner border */}
        <div
          className="m-[5px] p-6 flex flex-col gap-6"
          style={{ border: "1px solid rgba(201,162,74,0.04)" }}
        >
          <div className="flex flex-col gap-3 text-center">
            <p
              className="font-cormorant italic text-bone leading-[1.3]"
              style={{ fontSize: "22px" }}
            >
              Usar 1 crédito pra leitura de {targetName}?
            </p>
            <p
              className="font-jetbrains text-violet"
              style={{ fontSize: "11px", letterSpacing: "0.04em" }}
            >
              Saldo:{" "}
              <span className="text-gold">
                {balance} crédito{balance !== 1 ? "s" : ""}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={onConfirm}
              disabled={confirming}
              className="w-full"
            >
              {confirming ? "Aguarde..." : "Continuar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={onCancel}
              disabled={confirming}
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
