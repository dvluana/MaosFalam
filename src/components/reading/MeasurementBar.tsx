"use client";

import { motion } from "framer-motion";

interface Props {
  /** Valor de 0 a 1 que preenche a barra. */
  value: number;
  /** Delay da animação (pra stagger em listas). */
  delay?: number;
  /** Altura da barra em px. */
  height?: number;
  /** Acento da cor do fill e da agulha. */
  accent?: "gold" | "rose" | "violet" | "bone";
}

const ACCENT: Record<
  NonNullable<Props["accent"]>,
  { fill: string; glow: string; needle: string; needleGlow: string }
> = {
  gold: {
    fill: "linear-gradient(90deg, rgba(201,162,74,0.15), rgba(201,162,74,0.55))",
    glow: "0 0 8px rgba(201,162,74,0.4), 0 0 2px rgba(201,162,74,0.8)",
    needle: "#e3c77a",
    needleGlow: "0 0 6px rgba(201,162,74,0.7)",
  },
  rose: {
    fill: "linear-gradient(90deg, rgba(196,100,122,0.15), rgba(196,100,122,0.6))",
    glow: "0 0 8px rgba(196,100,122,0.45), 0 0 2px rgba(196,100,122,0.8)",
    needle: "#e3a5b0",
    needleGlow: "0 0 6px rgba(196,100,122,0.7)",
  },
  violet: {
    fill: "linear-gradient(90deg, rgba(139,123,191,0.15), rgba(139,123,191,0.6))",
    glow: "0 0 8px rgba(139,123,191,0.45), 0 0 2px rgba(139,123,191,0.8)",
    needle: "#b5a7d6",
    needleGlow: "0 0 6px rgba(139,123,191,0.7)",
  },
  bone: {
    fill: "linear-gradient(90deg, rgba(232,223,208,0.15), rgba(232,223,208,0.55))",
    glow: "0 0 8px rgba(232,223,208,0.35), 0 0 2px rgba(232,223,208,0.7)",
    needle: "#f4ecd8",
    needleGlow: "0 0 6px rgba(232,223,208,0.6)",
  },
};

export default function MeasurementBar({ value, delay = 0, height = 5, accent = "gold" }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const a = ACCENT[accent];

  return (
    <div
      className="relative w-full overflow-visible"
      style={{
        height,
        background: "linear-gradient(90deg, rgba(201,162,74,0.06), rgba(201,162,74,0.02))",
        borderLeft: "1px solid rgba(201,162,74,0.25)",
        borderRight: "1px solid rgba(201,162,74,0.08)",
      }}
    >
      {/* Ticks laterais e centro */}
      <span
        aria-hidden
        className="absolute left-0 -top-[2px] w-px h-[9px]"
        style={{ background: "rgba(201,162,74,0.4)" }}
      />
      <span
        aria-hidden
        className="absolute right-0 -top-[2px] w-px h-[9px]"
        style={{ background: "rgba(201,162,74,0.15)" }}
      />
      <span
        aria-hidden
        className="absolute left-1/4 -top-[1px] w-px h-[7px]"
        style={{ background: "rgba(201,162,74,0.18)" }}
      />
      <span
        aria-hidden
        className="absolute left-1/2 -top-[1px] w-px h-[7px] -translate-x-1/2"
        style={{ background: "rgba(201,162,74,0.22)" }}
      />
      <span
        aria-hidden
        className="absolute left-3/4 -top-[1px] w-px h-[7px]"
        style={{ background: "rgba(201,162,74,0.18)" }}
      />

      {/* Preenchimento animado */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{
          delay: delay + 0.2,
          duration: 1.1,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="absolute left-0 top-0 h-full"
        style={{
          background: a.fill,
          boxShadow: a.glow,
        }}
      />

      {/* Agulha indicadora (ponto rotado) */}
      <motion.span
        aria-hidden
        className="absolute -top-[1.5px] w-[4px] rotate-12"
        style={{
          height: height + 3,
          background: a.needle,
          boxShadow: a.needleGlow,
        }}
        initial={{ left: "0%" }}
        whileInView={{ left: `${pct}%` }}
        viewport={{ once: true }}
        transition={{
          delay: delay + 0.2,
          duration: 1.1,
          ease: [0.23, 1, 0.32, 1],
        }}
      />
    </div>
  );
}
