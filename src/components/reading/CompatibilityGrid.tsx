"use client";

import { motion } from "framer-motion";

import type { ReportCompat } from "@/types/report";

interface Props {
  items: ReportCompat[];
}

function wordColor(pair: string): string {
  const first = pair.split("+")[0]?.trim().toLowerCase() ?? "";
  if (first.includes("fogo")) return "#d9b86a";
  if (first.includes("água") || first.includes("agua")) return "#7b6ba5";
  if (first.includes("terra")) return "#8b5a38";
  if (first.includes("ar")) return "#e8dfd0";
  return "#e8dfd0";
}

/**
 * Compatibilidade entre elementos, formato narrativo (full-width cards).
 * Cada par é uma mini-história com pair label, word, e body.
 */
export default function CompatibilityGrid({ items }: Props) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div
          className="text-[8px] uppercase tracking-[2px] text-[rgba(122,104,50,0.9)] mb-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Compatibilidade por elemento
        </div>
        <div
          className="italic text-[rgba(155,146,132,0.9)] text-[15px]"
          style={{ fontFamily: "var(--font-voice)", letterSpacing: "0.02em" }}
        >
          Com quem suas mãos conversam melhor
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {items.map((entry, i) => {
          const color = wordColor(entry.pair);
          return (
            <motion.article
              key={`${entry.pair}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              className="card-noise relative px-7 py-8 sm:px-9 sm:py-10"
              style={{
                background: "#0e0a18",
                border: "1px solid rgba(201,162,74,0.1)",
                borderRadius: "0 6px 0 6px",
                boxShadow:
                  "0 20px 40px -16px rgba(0,0,0,0.85), 0 6px 16px -6px rgba(0,0,0,0.5)",
              }}
            >
              {/* Corner accents TL + BR */}
              <span
                aria-hidden
                className="absolute top-0 left-0 w-[10px] h-[10px] border-t border-l border-[rgba(201,162,74,0.35)]"
              />
              <span
                aria-hidden
                className="absolute bottom-0 right-0 w-[10px] h-[10px] border-b border-r border-[rgba(201,162,74,0.35)]"
              />

              {/* Pair label (JetBrains eyebrow) */}
              <div className="font-jetbrains text-[10px] tracking-[1.5px] uppercase text-gold-dim mb-3">
                {entry.pair}
              </div>

              {/* Word grande */}
              <div
                className="italic mb-4"
                style={{
                  fontFamily: "var(--font-voice)",
                  fontSize: "32px",
                  lineHeight: 1,
                  color: "#e8dfd0",
                  textShadow: `0 0 20px ${color}55, 0 0 40px ${color}22`,
                  letterSpacing: "0.01em",
                }}
              >
                {entry.word}
              </div>

              {/* Ornamental divider */}
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold-dim/40" />
                <span
                  className="w-1 h-1 rotate-45 bg-gold"
                  style={{ boxShadow: `0 0 6px ${color}` }}
                />
                <span className="h-px flex-1 bg-gold-dim/20" />
              </div>

              {/* Body (Raleway narrative) */}
              <p className="font-raleway text-[14px] sm:text-[15px] font-light leading-[1.88] text-bone-dim">
                {entry.body}
              </p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
