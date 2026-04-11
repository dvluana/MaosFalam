"use client";

import type { Accent, ReportSection } from "@/types/report";

import LineGlyph from "./LineGlyph";

interface Props {
  section: ReportSection;
}

const accentStyles: Record<
  Accent,
  {
    accentGlow: string;
    quoteShadow: string;
    borderColor: string;
    gradientBg: string;
    measureBg: string;
    measureBorder: string;
    measureText: string;
  }
> = {
  rose: {
    accentGlow: "rgba(196,100,122,0.09)",
    quoteShadow: "0 0 20px rgba(196,100,122,0.35), 0 0 40px rgba(196,100,122,0.15)",
    borderColor: "rgba(196,100,122,0.5)",
    gradientBg: "linear-gradient(90deg, rgba(196,100,122,0.08), transparent 80%)",
    measureBg: "linear-gradient(180deg, rgba(196,100,122,0.035), rgba(196,100,122,0.015))",
    measureBorder: "rgba(196,100,122,0.16)",
    measureText: "text-rose",
  },
  violet: {
    accentGlow: "rgba(139,123,191,0.09)",
    quoteShadow: "0 0 20px rgba(139,123,191,0.4), 0 0 40px rgba(139,123,191,0.18)",
    borderColor: "rgba(139,123,191,0.55)",
    gradientBg: "linear-gradient(90deg, rgba(139,123,191,0.08), transparent 80%)",
    measureBg: "linear-gradient(180deg, rgba(139,123,191,0.035), rgba(139,123,191,0.015))",
    measureBorder: "rgba(139,123,191,0.16)",
    measureText: "text-violet",
  },
  gold: {
    accentGlow: "rgba(201,162,74,0.08)",
    quoteShadow: "0 0 20px rgba(201,162,74,0.35), 0 0 40px rgba(201,162,74,0.15)",
    borderColor: "rgba(201,162,74,0.5)",
    gradientBg: "linear-gradient(90deg, rgba(201,162,74,0.08), transparent 80%)",
    measureBg: "linear-gradient(180deg, rgba(201,162,74,0.035), rgba(201,162,74,0.015))",
    measureBorder: "rgba(201,162,74,0.16)",
    measureText: "text-gold",
  },
  bone: {
    accentGlow: "rgba(232,223,208,0.06)",
    quoteShadow: "0 0 20px rgba(232,223,208,0.3), 0 0 40px rgba(232,223,208,0.12)",
    borderColor: "rgba(232,223,208,0.45)",
    gradientBg: "linear-gradient(90deg, rgba(232,223,208,0.07), transparent 80%)",
    measureBg: "linear-gradient(180deg, rgba(232,223,208,0.035), rgba(232,223,208,0.015))",
    measureBorder: "rgba(232,223,208,0.16)",
    measureText: "text-bone-dim",
  },
};

// Map section keys to LineGlyph line names. Sections whose key is not one of the
// 4 main lines simply won't render a glyph.
type LineName = "heart" | "head" | "life" | "fate";
const LINE_KEYS = new Set<string>(["heart", "head", "life", "fate"]);
function isLineName(key: string): key is LineName {
  return LINE_KEYS.has(key);
}

export default function ReadingSection({ section }: Props) {
  const style = accentStyles[section.accent];
  const hasMeasurement = Object.keys(section.measurement).length > 0;

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
          background: `radial-gradient(ellipse 80% 60% at 70% 20%, ${style.accentGlow} 0%, transparent 70%)`,
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
          {isLineName(section.key) && (
            <div className="shrink-0 -mt-1">
              <LineGlyph line={section.key} size={64} />
            </div>
          )}
          <div className="flex flex-col min-w-0 pt-1">
            <span className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold-dim">
              Cap. {String(section.chapter).padStart(2, "0")}{" "}
              <span className="opacity-40 mx-1">·</span> {section.label}
            </span>
            <h3 className="font-cinzel text-[18px] sm:text-[19px] font-medium tracking-[0.05em] text-gold mt-2">
              {section.title}
            </h3>
            {section.icon && (
              <span className="font-cormorant italic text-sm text-bone-dim mt-1">
                {section.icon}
              </span>
            )}
          </div>
        </div>

        {/* Opening (Cormorant italic) */}
        <p className="font-cormorant italic text-[19px] sm:text-[21px] text-bone leading-[1.4] mb-6">
          {section.opening}
        </p>

        {/* Body: past + present */}
        <div className="flex flex-col gap-5 mb-7">
          <p className="font-raleway text-[13px] sm:text-[14px] font-light leading-[1.88] text-bone-dim">
            {section.body_past}
          </p>
          <p className="font-raleway text-[13px] sm:text-[14px] font-light leading-[1.88] text-bone-dim">
            {section.body_present}
          </p>

          {/* Modifiers as blockquote-style items */}
          {section.modifiers.map((mod, i) => (
            <div
              key={i}
              className="relative my-1 py-5 px-5 sm:px-7"
              style={{
                borderLeft: `2px solid ${style.borderColor}`,
                background: style.gradientBg,
              }}
            >
              <p
                className="font-cormorant italic text-[18px] sm:text-[21px] leading-[1.45] text-bone"
                style={{ textShadow: style.quoteShadow }}
              >
                {mod}
              </p>
            </div>
          ))}
        </div>

        {/* Measurement strip */}
        {hasMeasurement && (
          <div
            className="relative mt-2"
            style={{
              background: style.measureBg,
              border: `1px solid ${style.measureBorder}`,
              padding: "22px 20px 20px",
            }}
          >
            {/* Ornamental corners */}
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] top-[3px] left-[3px] border-t border-l"
              style={{ borderColor: style.measureBorder }}
            />
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] top-[3px] right-[3px] border-t border-r"
              style={{ borderColor: style.measureBorder }}
            />
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] bottom-[3px] left-[3px] border-b border-l"
              style={{ borderColor: style.measureBorder }}
            />
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] bottom-[3px] right-[3px] border-b border-r"
              style={{ borderColor: style.measureBorder }}
            />

            <div className="flex items-center gap-3 mb-6">
              <span
                aria-hidden
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${style.borderColor})`,
                }}
              />
              <span
                className={`font-jetbrains text-[10px] tracking-[2px] uppercase ${style.measureText} whitespace-nowrap`}
                style={{ fontWeight: 500 }}
              >
                Medição da palma
              </span>
              <span
                aria-hidden
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(270deg, transparent, ${style.borderColor})`,
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {Object.entries(section.measurement).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span
                    className={`font-jetbrains text-[9.5px] tracking-[1.5px] uppercase ${style.measureText}`}
                    style={{ fontWeight: 500 }}
                  >
                    {key}
                  </span>
                  <p className="font-raleway text-[13.5px] text-bone leading-[1.5]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
