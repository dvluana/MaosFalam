"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useMock } from "@/hooks/useMock";
import type { Reading, HandElement, LineName } from "@/types/reading";
import ElementHero from "@/components/reading/ElementHero";
import ReadingOverview from "@/components/reading/ReadingOverview";
import ReadingSection from "@/components/reading/ReadingSection";
import SectionDivider from "@/components/reading/SectionDivider";
import CompatibilityGrid from "@/components/reading/CompatibilityGrid";
import TechnicalStrip from "@/components/reading/TechnicalStrip";
import MountGlyph from "@/components/reading/MountGlyph";
import MeasurementBar from "@/components/reading/MeasurementBar";
import HandSummary from "@/components/reading/HandSummary";
import RareSignGlyph from "@/components/reading/RareSignGlyph";
import CrossingGlyph from "@/components/reading/CrossingGlyph";
import ShareButton from "@/components/reading/ShareButton";
import Separator from "@/components/ui/Separator";
import ResultStateSwitcher from "@/components/reading/ResultStateSwitcher";

interface PageProps {
  params: Promise<{ id: string }>;
}

const VALID_ELEMENTS: HandElement[] = ["fire", "water", "earth", "air"];

function isElement(v: string | null): v is HandElement {
  return v !== null && (VALID_ELEMENTS as string[]).includes(v);
}

const LINE_ACCENT: Record<LineName, "rose" | "violet" | "gold" | "bone"> = {
  heart: "rose",
  head: "violet",
  life: "gold",
  fate: "bone",
};

const LINE_NUMBER: Record<LineName, string> = {
  heart: "01",
  head: "02",
  life: "03",
  fate: "04",
};

const LINE_DEFAULT_TAGLINE: Record<LineName, string> = {
  heart: "Como você ama",
  head: "Como você pensa",
  life: "O que você já viveu",
  fate: "Pra onde você vai",
};

function CompletoInner({ id }: { id: string }) {
  const search = useSearchParams();
  const elementParam = search?.get("element") ?? null;
  const element: HandElement = isElement(elementParam) ? elementParam : "fire";
  const [mockPath, setMockPath] = useState(`reading-${element}`);

  useEffect(() => {
    setMockPath(`reading-${element}`);
  }, [element]);

  const { data, loading } = useMock<Reading>(mockPath);

  if (loading || !data) {
    return (
      <main className="min-h-dvh bg-black flex items-center justify-center">
        <p className="font-cormorant italic text-bone-dim">Um momento...</p>
      </main>
    );
  }

  const report = data.report;
  const stats = report.stats;
  const compatibility = report.compatibility ?? [];
  const intimacy = report.intimacy;

  return (
    <main className="min-h-dvh bg-black pb-24">
      <ElementHero element={report.element} fallbackName={report.user_name} />

      {/* Retrato da mão */}
      {stats && (
        <div className="px-4 max-w-xl mx-auto -mt-4 mb-2">
          <HandSummary
            element={element}
            elementName={report.element.title}
            stats={stats}
          />
        </div>
      )}

      <div className="px-4 max-w-xl mx-auto flex flex-col gap-6">
        {/* Visão geral */}
        <ReadingOverview
          element={report.element}
          fallbackName={report.user_name}
        />

        {/* 4 linhas, cada uma com SectionDivider */}
        <div className="flex flex-col gap-10">
          {report.sections.map((s) => (
            <div key={s.line} className="flex flex-col">
              <SectionDivider
                number={LINE_NUMBER[s.line]}
                label={s.tagline ?? LINE_DEFAULT_TAGLINE[s.line]}
                accent={LINE_ACCENT[s.line]}
              />
              <ReadingSection section={s} />
            </div>
          ))}
        </div>

        {/* Seção Intimidade */}
        {intimacy && (
          <>
            <SectionDivider number="05" label="Na cama" accent="rose" />
            <article
              className="card-noise relative overflow-hidden px-7 py-10 sm:px-9 sm:py-12"
              style={{
                background: "#0e0a18",
                border: "1px solid rgba(196,100,122,0.14)",
                boxShadow:
                  "0 28px 56px -16px rgba(0,0,0,0.9), 0 0 40px -8px rgba(196,100,122,0.12)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(196,100,122,0.09) 0%, transparent 70%)",
                }}
              />
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
                <span className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-rose/80">
                  ♀ Intimidade
                </span>
                <h3 className="font-cinzel text-[18px] sm:text-[20px] font-medium tracking-[0.05em] text-rose mt-2">
                  {intimacy.title}
                </h3>
                <span className="font-cormorant italic text-sm text-bone-dim mt-1 mb-6">
                  {intimacy.subtitle}
                </span>

                <p
                  className="font-cormorant italic text-[20px] sm:text-[23px] text-bone leading-[1.4] mb-6"
                  style={{
                    textShadow:
                      "0 0 20px rgba(196,100,122,0.35), 0 0 40px rgba(196,100,122,0.15)",
                  }}
                >
                  {intimacy.quote}
                </p>

                <div className="flex flex-col gap-5 mb-7">
                  {intimacy.body.map((p, i) => (
                    <div key={i}>
                      <p className="font-raleway text-[13.5px] sm:text-[14px] font-light leading-[1.88] text-bone-dim">
                        {p}
                      </p>
                      {intimacy.cigana_quotes[i] && (
                        <div
                          className="relative mt-5 py-5 px-5 sm:px-7"
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
                            {intimacy.cigana_quotes[i]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <TechnicalStrip items={intimacy.technical} />
              </div>
            </article>
          </>
        )}

        {/* Compatibilidade */}
        {compatibility.length > 0 && (
          <div className="mt-6">
            <SectionDivider
              number="06"
              label="Com quem você casa"
              accent="gold"
            />
            <CompatibilityGrid entries={compatibility} element={element} />
          </div>
        )}

        {/* Montes */}
        {report.mounts.length > 0 && (
          <>
            <SectionDivider number="07" label="Seus montes" accent="gold" />
            <div className="flex flex-col gap-8">
              {report.mounts.map((m, i) => {
                const strength = m.strength ?? 0;
                const word = m.word ?? "";
                return (
                  <motion.article
                    key={m.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.06, duration: 0.7 }}
                    className="card-noise relative overflow-hidden px-7 py-9 sm:px-9 sm:py-10"
                    style={{
                      background: "#0e0a18",
                      border: "1px solid rgba(201,162,74,0.08)",
                      boxShadow:
                        "0 24px 48px -16px rgba(0,0,0,0.85), 0 8px 20px -8px rgba(0,0,0,0.6)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
                      style={{ borderColor: "rgba(201,162,74,0.2)" }}
                    />
                    <span
                      aria-hidden
                      className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
                      style={{ borderColor: "rgba(201,162,74,0.2)" }}
                    />

                    <div className="flex items-start gap-4 mb-5">
                      <div className="shrink-0 -mt-1">
                        <MountGlyph name={m.name} size={60} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 pt-1">
                        <span className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold-dim">
                          Monte
                        </span>
                        <h3 className="font-cinzel text-[17px] sm:text-[19px] font-medium tracking-[0.05em] text-gold mt-1">
                          {m.name}
                        </h3>
                        {m.planet_symbol && (
                          <span className="font-jetbrains text-[8px] text-bone-dim mt-1">
                            {m.planet_symbol}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barra de força no estilo de medição */}
                    {strength > 0 && (
                      <div className="mb-6">
                        <div className="flex items-baseline justify-between mb-2">
                          <span
                            className="font-jetbrains text-[9px] tracking-[1.5px] uppercase text-gold"
                            style={{ fontWeight: 500 }}
                          >
                            Força
                          </span>
                          {word && (
                            <span className="font-cormorant italic text-[16px] text-bone">
                              {word}
                            </span>
                          )}
                        </div>
                        <MeasurementBar
                          value={strength / 100}
                          delay={i * 0.06}
                          accent="gold"
                        />
                      </div>
                    )}

                    <p className="font-raleway text-[14px] sm:text-[15px] font-light leading-[1.88] text-bone-dim">
                      {m.content}
                    </p>

                    {m.cigana_quote && (
                      <div
                        className="relative mt-5 py-5 px-5"
                        style={{
                          borderLeft: "2px solid rgba(201,162,74,0.5)",
                          background:
                            "linear-gradient(90deg, rgba(201,162,74,0.08), transparent 80%)",
                        }}
                      >
                        <p
                          className="font-cormorant italic text-[17px] sm:text-[19px] leading-[1.45] text-bone"
                          style={{
                            textShadow:
                              "0 0 20px rgba(201,162,74,0.35), 0 0 40px rgba(201,162,74,0.15)",
                          }}
                        >
                          {m.cigana_quote}
                        </p>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          </>
        )}

        {/* Cruzamentos */}
        {report.crosses.length > 0 && (
          <>
            <SectionDivider
              number="08"
              label="Onde as linhas se encontram"
              accent="rose"
            />
            <div className="flex flex-col gap-8">
              {report.crosses.map((c, i) => {
                // Primeira sentença vira lead/subtítulo técnico
                const periodIdx = c.content.indexOf(". ");
                const lead =
                  periodIdx > -1 ? c.content.slice(0, periodIdx + 1) : "";
                const rest =
                  periodIdx > -1
                    ? c.content.slice(periodIdx + 2)
                    : c.content;
                const num = String(i + 1).padStart(2, "0");
                return (
                  <motion.article
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.7 }}
                    className="card-noise relative overflow-hidden px-7 py-10 sm:px-9 sm:py-12"
                    style={{
                      background: "#0e0a18",
                      border: "1px solid rgba(196,100,122,0.14)",
                      boxShadow:
                        "0 24px 48px -16px rgba(0,0,0,0.85), 0 0 40px -12px rgba(196,100,122,0.18)",
                    }}
                  >
                    {/* Glow rose */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,100,122,0.09), transparent 75%)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
                      style={{ borderColor: "rgba(196,100,122,0.35)" }}
                    />
                    <span
                      aria-hidden
                      className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
                      style={{ borderColor: "rgba(196,100,122,0.35)" }}
                    />

                    <div className="relative flex items-start gap-5 mb-5">
                      <div className="shrink-0 -mt-1">
                        <CrossingGlyph size={72} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 pt-1">
                        <span className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-rose/80">
                          Cruzamento {num}
                        </span>
                        {lead && (
                          <h3
                            className="font-cormorant italic text-[19px] sm:text-[22px] text-bone mt-2 leading-[1.35]"
                            style={{
                              textShadow:
                                "0 0 18px rgba(196,100,122,0.35), 0 0 34px rgba(196,100,122,0.14)",
                            }}
                          >
                            {lead}
                          </h3>
                        )}
                      </div>
                    </div>

                    {rest && (
                      <div
                        className="relative pt-5 border-t"
                        style={{
                          borderColor: "rgba(196,100,122,0.12)",
                        }}
                      >
                        <p className="font-raleway text-[14px] sm:text-[15px] font-light leading-[1.9] text-bone-dim">
                          {rest}
                        </p>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          </>
        )}

        {/* Sinais Raros */}
        {report.rare_signs.length > 0 && (
          <>
            <SectionDivider
              number="09"
              label="O que quase ninguém tem"
              accent="gold"
            />
            <div className="flex flex-col gap-8">
              {report.rare_signs.map((r, i) => (
                <motion.article
                  key={r.name}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.9 }}
                  className="card-noise relative overflow-hidden px-7 py-10 sm:px-9 sm:py-12"
                  style={{
                    background: "#0e0a18",
                    border: "1px solid rgba(201,162,74,0.22)",
                    boxShadow:
                      "0 28px 56px -16px rgba(0,0,0,0.9), 0 0 40px -8px rgba(201,162,74,0.15)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
                    style={{ borderColor: "rgba(201,162,74,0.35)" }}
                  />
                  <span
                    aria-hidden
                    className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
                    style={{ borderColor: "rgba(201,162,74,0.35)" }}
                  />
                  <div className="flex items-start gap-5 mb-4">
                    <div className="shrink-0 -mt-1">
                      <RareSignGlyph name={r.name} size={68} />
                    </div>
                    <div className="flex flex-col min-w-0 pt-1">
                      <span className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold">
                        Sinal raro
                      </span>
                      <h3 className="font-cinzel text-[18px] sm:text-[20px] font-medium tracking-[0.05em] text-gold mt-2">
                        {r.name}
                      </h3>
                    </div>
                  </div>
                  <p className="font-raleway text-[14px] sm:text-[15px] font-light leading-[1.88] text-bone">
                    {r.content}
                  </p>
                </motion.article>
              ))}
            </div>
          </>
        )}

        <Separator variant="ornamental" />

        {/* Fechamento */}
        <div className="flex flex-col items-center text-center gap-5 px-2 mt-4">
          <p className="font-cormorant italic text-[22px] sm:text-[26px] text-bone leading-[1.35] max-w-md">
            Foi isso que suas mãos me contaram. Agora é com você.
          </p>
          <ShareButton readingId={id} />
          <button
            type="button"
            onClick={() => {
              // Limpa a flag pra forçar /ler/nome a pedir de novo
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("maosfalam_name_fresh");
              }
              window.location.href = "/ler/nome";
            }}
            className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold hover:text-gold-light transition-colors mt-2"
            style={{ fontWeight: 500 }}
          >
            Ler outra mão →
          </button>
        </div>
      </div>

      <ResultStateSwitcher element={element} tier="completo" readingId={id} />
    </main>
  );
}

export default function CompletoPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <Suspense fallback={<main className="min-h-dvh bg-black" />}>
      <CompletoInner id={id} />
    </Suspense>
  );
}
