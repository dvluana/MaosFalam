"use client";

import { motion } from "framer-motion";
import type { CompatibilityEntry, HandElement } from "@/types/reading";
import CompatibilityGlyph from "./CompatibilityGlyph";

interface Props {
  entries: CompatibilityEntry[];
  element: HandElement;
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
 * Grid de compatibilidade entre elementos da mão.
 * Ex: Fogo + Ar = Faísca. Conversa que vira desejo.
 */
export default function CompatibilityGrid({ entries, element: _element }: Props) {
  void _element;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map((entry, i) => {
          const color = wordColor(entry.pair);
          return (
            <motion.div
              key={`${entry.pair}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ scale: 1.01 }}
              className="card-noise relative px-6 py-8 transition-colors duration-300 flex flex-col items-center text-center"
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

              {/* Glyph da reação */}
              <div className="mb-4">
                <CompatibilityGlyph pair={entry.pair} size={80} />
              </div>

              {/* Pair label */}
              <div
                className="font-jetbrains text-[10px] tracking-[1.5px] uppercase text-gold-dim mb-2"
              >
                {entry.pair}
              </div>

              {/* Word grande */}
              <div
                className="italic mb-3"
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
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-gold-dim/40" />
                <span
                  className="w-1 h-1 rotate-45 bg-gold"
                  style={{ boxShadow: `0 0 6px ${color}` }}
                />
                <span className="h-px w-6 bg-gold-dim/40" />
              </div>

              <p
                className="font-cormorant italic text-[15px] sm:text-[16px] text-bone-dim leading-[1.5]"
              >
                {entry.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
