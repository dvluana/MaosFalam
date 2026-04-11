"use client";

import { motion } from "framer-motion";

import type { HandElement, ReportJSON } from "@/types/report";

import ElementGlyph from "./ElementGlyph";

interface Props {
  element: HandElement;
  elementName: string;
  portrait: ReportJSON["portrait"];
}

export default function HandSummary({ element, elementName, portrait }: Props) {
  const stats: Array<{ label: string; value: string }> = [
    { label: "Linhas", value: portrait.lines_detected },
    { label: "Montes", value: portrait.mounts_mapped },
    { label: "Sinais Raros", value: portrait.rare_signs_found },
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
        boxShadow: "0 28px 56px -16px rgba(0,0,0,0.9), 0 10px 22px -8px rgba(0,0,0,0.6)",
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
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.5))",
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
            background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.5))",
          }}
        />
      </div>

      {/* Monte dominante com glyph */}
      <div className="relative flex items-center gap-4 mb-7">
        <div className="shrink-0">
          <ElementGlyph type={element} size={58} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold mb-2"
            style={{ fontWeight: 500 }}
          >
            Monte dominante
          </span>
          <span className="font-cinzel text-[22px] sm:text-[26px] font-medium text-gold leading-none tracking-[0.04em]">
            {portrait.dominant_mount}
          </span>
        </div>
      </div>

      {/* Grid de métricas (humanized strings) */}
      <div className="relative flex flex-col gap-5">
        {stats.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
            className="flex items-baseline justify-between"
          >
            <span
              className="font-jetbrains text-[9.5px] tracking-[1.5px] uppercase text-gold"
              style={{ fontWeight: 500 }}
            >
              {m.label}
            </span>
            <span className="font-cinzel text-[15px] text-gold tracking-[0.06em]">{m.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Exclusivity footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="relative mt-7 pt-5"
        style={{ borderTop: "1px solid rgba(201,162,74,0.12)" }}
      >
        <p className="font-cormorant italic text-[15px] sm:text-[17px] text-bone leading-[1.3]">
          {portrait.exclusivity}{" "}
          <span className="text-gold">{elementName}</span>
        </p>
      </motion.div>
    </motion.section>
  );
}
