"use client";

import type { ReadingSection as Section, LineName } from "@/types/reading";

import LineGlyph from "./LineGlyph";
import TechnicalStrip from "./TechnicalStrip";

interface Props {
  section: Section;
}

const lineMeta: Record<
  LineName,
  {
    num: string;
    name: string;
    accentGlow: string;
    quoteShadow: string;
    borderColor: string;
    gradientBg: string;
  }
> = {
  heart: {
    num: "Linha 01",
    name: "Do Coração",
    accentGlow: "rgba(196,100,122,0.09)",
    quoteShadow: "0 0 20px rgba(196,100,122,0.35), 0 0 40px rgba(196,100,122,0.15)",
    borderColor: "rgba(196,100,122,0.5)",
    gradientBg: "linear-gradient(90deg, rgba(196,100,122,0.08), transparent 80%)",
  },
  head: {
    num: "Linha 02",
    name: "Da Cabeça",
    accentGlow: "rgba(139,123,191,0.09)",
    quoteShadow: "0 0 20px rgba(139,123,191,0.4), 0 0 40px rgba(139,123,191,0.18)",
    borderColor: "rgba(139,123,191,0.55)",
    gradientBg: "linear-gradient(90deg, rgba(139,123,191,0.08), transparent 80%)",
  },
  life: {
    num: "Linha 03",
    name: "Da Vida",
    accentGlow: "rgba(201,162,74,0.08)",
    quoteShadow: "0 0 20px rgba(201,162,74,0.35), 0 0 40px rgba(201,162,74,0.15)",
    borderColor: "rgba(201,162,74,0.5)",
    gradientBg: "linear-gradient(90deg, rgba(201,162,74,0.08), transparent 80%)",
  },
  fate: {
    num: "Linha 04",
    name: "Do Destino",
    accentGlow: "rgba(232,223,208,0.06)",
    quoteShadow: "0 0 20px rgba(232,223,208,0.3), 0 0 40px rgba(232,223,208,0.12)",
    borderColor: "rgba(232,223,208,0.45)",
    gradientBg: "linear-gradient(90deg, rgba(232,223,208,0.07), transparent 80%)",
  },
};

/**
 * Intercala os cigana_quotes no meio dos parágrafos.
 * Regra: quote i aparece após parágrafo `i+1` (começa a pontuar depois
 * do body principal).
 */
function buildFlow(body: string, extras: string[], quotes: string[]) {
  const blocks: Array<{ kind: "p"; text: string } | { kind: "q"; text: string }> = [];
  blocks.push({ kind: "p", text: body });
  const merged = [...extras];
  for (let i = 0; i < merged.length; i += 1) {
    blocks.push({ kind: "p", text: merged[i]! });
    if (quotes[i]) {
      blocks.push({ kind: "q", text: quotes[i]! });
    }
  }
  // quotes sobrando (mais quotes que extras) vão pro fim
  for (let i = merged.length; i < quotes.length; i += 1) {
    blocks.push({ kind: "q", text: quotes[i]! });
  }
  return blocks;
}

export default function ReadingSection({ section }: Props) {
  const meta = lineMeta[section.line];
  const extras = section.body_extras ?? [];
  const quotes = section.cigana_quotes ?? [];
  const technical = section.technical ?? [];
  const tagline = section.tagline;
  const flow = buildFlow(section.body, extras, quotes);

  return (
    <article
      className="card-noise relative overflow-hidden px-7 py-10 sm:px-9 sm:py-12 transition-colors duration-300 group bg-deep border border-gold/8"
      style={{
        boxShadow: "0 24px 48px -16px rgba(0,0,0,0.85), 0 8px 20px -8px rgba(0,0,0,0.6)",
      }}
    >
      {/* Radial glow accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 70% 20%, ${meta.accentGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Corner accents */}
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l border-gold/20"
      />
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r border-gold/20"
      />

      {/* Hover border lift */}
      <span
        aria-hidden
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(201,162,74,0.15)" }}
      />

      <div className="relative flex flex-col">
        {/* Header: glyph + labels */}
        <div className="flex items-start gap-5 mb-6">
          <div className="shrink-0 -mt-1">
            <LineGlyph line={section.line} size={64} />
          </div>
          <div className="flex flex-col min-w-0 pt-1">
            <span className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold-dim">
              {meta.num} <span className="opacity-40 mx-1">·</span> {section.symbol}{" "}
              {section.planet}
            </span>
            <h3 className="font-cinzel text-[18px] sm:text-[19px] font-medium tracking-[0.05em] text-gold mt-2">
              {meta.name}
            </h3>
            {tagline && (
              <span className="font-cormorant italic text-sm text-bone-dim mt-1">{tagline}</span>
            )}
          </div>
        </div>

        {/* Intro */}
        <p className="font-cormorant italic text-[19px] sm:text-[21px] text-bone leading-[1.4] mb-6">
          {section.intro}
        </p>

        {/* Fluxo: body + extras + cigana quotes intercaladas */}
        <div className="flex flex-col gap-5 mb-7">
          {flow.map((block, i) =>
            block.kind === "p" ? (
              <p
                key={`p-${i}`}
                className="font-raleway text-[13px] sm:text-[14px] font-light leading-[1.88] text-bone-dim"
              >
                {block.text}
              </p>
            ) : (
              <div
                key={`q-${i}`}
                className="relative my-1 py-5 px-5 sm:px-7"
                style={{
                  borderLeft: `2px solid ${meta.borderColor}`,
                  background: meta.gradientBg,
                }}
              >
                <p
                  className="font-cormorant italic text-[18px] sm:text-[21px] leading-[1.45] text-bone"
                  style={{ textShadow: meta.quoteShadow }}
                >
                  {block.text}
                </p>
              </div>
            ),
          )}
        </div>

        {/* Impact final */}
        <div className="pt-6 mb-4 border-t border-gold/12">
          <p
            className="font-cormorant italic text-[21px] sm:text-[24px] leading-[1.35] text-bone"
            style={{ textShadow: meta.quoteShadow }}
          >
            {section.impact_phrase}
          </p>
        </div>

        {/* Strip técnica */}
        {technical.length > 0 && <TechnicalStrip items={technical} />}
      </div>
    </article>
  );
}
