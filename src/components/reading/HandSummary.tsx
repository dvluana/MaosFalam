"use client";

import { motion } from "framer-motion";
import ElementGlyph from "./ElementGlyph";
import MeasurementBar from "./MeasurementBar";
import type { HandElement, ReadingStats } from "@/types/reading";

interface Props {
  element: HandElement;
  elementName: string;
  stats: ReadingStats;
}

const MAX = {
  lines: 4, // 4 linhas principais
  mounts: 8, // 8 montes clássicos (Júpiter, Saturno, Apolo, Mercúrio, Vênus, Lua, Marte+, Marte-)
  rare_signs: 9, // ~9 sinais raros catalogados
};

export default function HandSummary({ element, elementName, stats }: Props) {
  const metrics: Array<{
    label: string;
    value: number;
    max: number;
    display: string;
  }> = [
    {
      label: "Linhas",
      value: stats.lines,
      max: MAX.lines,
      display: `${stats.lines}/${MAX.lines}`,
    },
    {
      label: "Montes",
      value: stats.mounts,
      max: MAX.mounts,
      display: `${stats.mounts}/${MAX.mounts}`,
    },
    {
      label: "Sinais Raros",
      value: stats.rare_signs,
      max: MAX.rare_signs,
      display: `${stats.rare_signs}/${MAX.rare_signs}`,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative card-noise overflow-hidden"
      style={{
        background: "#0e0a18",
        border: "1px solid rgba(201,162,74,0.14)",
        padding: "26px 24px 24px",
        boxShadow:
          "0 28px 56px -16px rgba(0,0,0,0.9), 0 10px 22px -8px rgba(0,0,0,0.6)",
      }}
    >
      {/* Corner accents */}
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
        style={{ borderColor: "rgba(201,162,74,0.35)" }}
      />
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] top-2 right-2 border-t border-r"
        style={{ borderColor: "rgba(201,162,74,0.35)" }}
      />
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] bottom-2 left-2 border-b border-l"
        style={{ borderColor: "rgba(201,162,74,0.35)" }}
      />
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
        style={{ borderColor: "rgba(201,162,74,0.35)" }}
      />

      {/* Header com linhas laterais */}
      <div className="relative flex items-center gap-3 mb-6">
        <span
          aria-hidden
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,162,74,0.5))",
          }}
        />
        <span
          className="font-jetbrains text-[10px] tracking-[2px] uppercase text-gold whitespace-nowrap"
          style={{ fontWeight: 500 }}
        >
          Retrato da mão
        </span>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(270deg, transparent, rgba(201,162,74,0.5))",
          }}
        />
      </div>

      {/* Planeta dominante com glyph */}
      <div className="relative flex items-center gap-4 mb-7">
        <div className="shrink-0">
          <ElementGlyph type={element} size={58} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold mb-2"
            style={{ fontWeight: 500 }}
          >
            Planeta dominante
          </span>
          <span className="font-cinzel text-[22px] sm:text-[26px] font-medium text-gold leading-none tracking-[0.04em]">
            {stats.dominant_planet}
          </span>
        </div>
      </div>

      {/* Grid de métricas com barras de medição */}
      <div className="relative flex flex-col gap-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-baseline justify-between">
              <span
                className="font-jetbrains text-[9.5px] tracking-[1.5px] uppercase text-gold"
                style={{ fontWeight: 500 }}
              >
                {m.label}
              </span>
              <span className="font-cinzel text-[15px] text-gold tracking-[0.06em]">
                {m.display}
              </span>
            </div>
            <MeasurementBar
              value={m.value / m.max}
              delay={0.4 + i * 0.1}
              accent="gold"
            />
          </motion.div>
        ))}
      </div>

      {/* Rarity footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="relative mt-7 pt-5 flex items-center gap-3"
        style={{ borderTop: "1px solid rgba(201,162,74,0.12)" }}
      >
        <div className="flex items-baseline gap-2">
          <span
            className="font-cinzel text-[28px] sm:text-[32px] text-gold leading-none"
            style={{
              textShadow: "0 0 20px rgba(201,162,74,0.35)",
            }}
          >
            {stats.rarity_percent}%
          </span>
        </div>
        <p className="font-cormorant italic text-[15px] sm:text-[17px] text-bone leading-[1.3] flex-1">
          das mãos que eu já li são{" "}
          <span className="text-gold">{elementName}</span>
        </p>
      </motion.div>
    </motion.section>
  );
}
