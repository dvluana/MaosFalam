"use client";

import type { ReportVenus } from "@/types/report";

interface Props {
  venus: ReportVenus;
}

/**
 * Seção de intimidade (Vênus + Cinturão). Rose glow, corner ornaments,
 * mesma linguagem visual da versão inline anterior.
 */
export default function VenusSection({ venus }: Props) {
  // Quebra o body em parágrafos agrupando ~3 sentenças por grupo
  const bodyParagraphs = venus.body
    .split(/(?<=\.)\s+/)
    .filter((s) => s.trim().length > 0)
    .reduce<string[]>((acc, sentence) => {
      const last = acc[acc.length - 1];
      if (!last || last.split(".").length > 3) {
        acc.push(sentence);
      } else {
        acc[acc.length - 1] = last + " " + sentence;
      }
      return acc;
    }, []);

  return (
    <article
      className="card-noise relative overflow-hidden px-7 py-10 sm:px-9 sm:py-12"
      style={{
        background: "#0e0a18",
        border: "1px solid rgba(196,100,122,0.14)",
        boxShadow:
          "0 28px 56px -16px rgba(0,0,0,0.9), 0 0 40px -8px rgba(196,100,122,0.12)",
      }}
    >
      {/* Glow rose */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(196,100,122,0.09) 0%, transparent 70%)",
        }}
      />
      {/* Corner ornaments */}
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
        style={{ borderColor: "rgba(196,100,122,0.3)" }}
      />
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
        style={{ borderColor: "rgba(196,100,122,0.3)" }}
      />

      <div className="relative flex flex-col">
        {/* Eyebrow + title */}
        <span className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-rose/80">
          ♀ {venus.label}
        </span>
        <h3 className="font-cinzel text-[18px] sm:text-[20px] font-medium tracking-[0.05em] text-rose mt-2">
          {venus.title}
        </h3>

        {/* Opening quote */}
        <p
          className="font-cormorant italic text-[20px] sm:text-[23px] text-bone leading-[1.4] mt-4 mb-6"
          style={{
            textShadow:
              "0 0 20px rgba(196,100,122,0.35), 0 0 40px rgba(196,100,122,0.15)",
          }}
        >
          {venus.opening}
        </p>

        {/* Body paragraphs */}
        <div className="flex flex-col gap-5 mb-7">
          {bodyParagraphs.map((p, i) => (
            <p
              key={i}
              className="font-raleway text-[13.5px] sm:text-[14px] font-light leading-[1.88] text-bone-dim"
            >
              {p}
            </p>
          ))}
        </div>

        {/* Cinturão (blockquote-style optional paragraph) */}
        {venus.cinturao && (
          <div
            className="relative mt-1 mb-7 py-5 px-5 sm:px-7"
            style={{
              borderLeft: "2px solid rgba(196,100,122,0.55)",
              background:
                "linear-gradient(90deg, rgba(196,100,122,0.08), transparent 80%)",
            }}
          >
            <p
              className="font-cormorant italic text-[18px] sm:text-[21px] leading-[1.45] text-bone"
              style={{
                textShadow:
                  "0 0 20px rgba(196,100,122,0.35), 0 0 40px rgba(196,100,122,0.15)",
              }}
            >
              {venus.cinturao}
            </p>
          </div>
        )}

        {/* Closing quote */}
        <p
          className="font-cormorant italic text-[18px] sm:text-[21px] leading-[1.45] text-bone mb-6"
          style={{
            textShadow:
              "0 0 20px rgba(196,100,122,0.35), 0 0 40px rgba(196,100,122,0.15)",
          }}
        >
          {venus.closing}
        </p>

        {/* Measurement strip (rose variant) */}
        {Object.keys(venus.measurement).length > 0 && (
          <div
            className="relative mt-2"
            style={{
              background:
                "linear-gradient(180deg, rgba(196,100,122,0.035), rgba(196,100,122,0.015))",
              border: "1px solid rgba(196,100,122,0.16)",
              padding: "22px 20px 20px",
            }}
          >
            {/* Ornamental corners */}
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] top-[3px] left-[3px] border-t border-l"
              style={{ borderColor: "rgba(196,100,122,0.45)" }}
            />
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] top-[3px] right-[3px] border-t border-r"
              style={{ borderColor: "rgba(196,100,122,0.45)" }}
            />
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] bottom-[3px] left-[3px] border-b border-l"
              style={{ borderColor: "rgba(196,100,122,0.45)" }}
            />
            <span
              aria-hidden
              className="absolute w-[6px] h-[6px] bottom-[3px] right-[3px] border-b border-r"
              style={{ borderColor: "rgba(196,100,122,0.45)" }}
            />

            <div className="flex items-center gap-3 mb-6">
              <span
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(196,100,122,0.5))",
                }}
              />
              <span
                className="font-jetbrains text-[10px] tracking-[2px] uppercase text-rose whitespace-nowrap"
                style={{ fontWeight: 500 }}
              >
                Medição da palma
              </span>
              <span
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(270deg, transparent, rgba(196,100,122,0.5))",
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {Object.entries(venus.measurement).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span
                    className="font-jetbrains text-[9.5px] tracking-[1.5px] uppercase text-rose"
                    style={{ fontWeight: 500 }}
                  >
                    {key}
                  </span>
                  <p className="font-raleway text-[13.5px] text-bone leading-[1.5]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
