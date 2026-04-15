"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";

import CompatibilityGrid from "@/components/reading/CompatibilityGrid";
import CrossingGlyph from "@/components/reading/CrossingGlyph";
import ElementHero from "@/components/reading/ElementHero";
import HandSummary from "@/components/reading/HandSummary";
import RareSignGlyph from "@/components/reading/RareSignGlyph";
import ReadingOverview from "@/components/reading/ReadingOverview";
import ReadingSection from "@/components/reading/ReadingSection";
import SectionDivider from "@/components/reading/SectionDivider";
import ShareButton from "@/components/reading/ShareButton";
import TransitionLine from "@/components/reading/TransitionLine";
import VenusSection from "@/components/reading/VenusSection";
import PageLoading from "@/components/ui/PageLoading";
import Separator from "@/components/ui/Separator";
import { getReading } from "@/lib/reading-client";
import type { HandElement, Reading } from "@/types/report";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ELEMENT_LABEL: Record<HandElement, string> = {
  fire: "Fogo",
  water: "Água",
  earth: "Terra",
  air: "Ar",
};

function CompletoInner({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getReading(id)
      .then((r) => {
        if (!r) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (r.tier !== "premium") {
          router.replace(`/ler/resultado/${id}`);
          return;
        }
        setData(r);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) return <PageLoading />;
  if (notFound || !data) {
    return (
      <main className="min-h-dvh bg-black flex items-center justify-center px-6">
        <p className="font-cormorant italic text-[22px] text-bone text-center">
          Leitura não encontrada.
        </p>
      </main>
    );
  }

  const report = data.report;
  const element: HandElement = report.element.key;

  return (
    <main className="min-h-dvh bg-black pb-24">
      <ElementHero
        element={{ key: element }}
        impactPhrase={report.impact_phrase}
        targetName={data.target_name}
      />

      {/* Retrato da mão */}
      <div className="px-4 max-w-xl mx-auto -mt-4 mb-2">
        <HandSummary
          element={element}
          elementName={ELEMENT_LABEL[element]}
          portrait={report.portrait}
        />
      </div>

      <div className="px-4 max-w-xl mx-auto flex flex-col gap-6">
        {/* Visão geral */}
        <ReadingOverview
          opening={report.opening}
          elementIntro={report.element.intro}
          elementBody={report.element.body}
        />

        {/* Sections with SectionDividers and transitions */}
        <div className="flex flex-col gap-10">
          {report.sections.map((s) => (
            <div key={s.key} className="flex flex-col">
              <SectionDivider
                number={String(s.chapter).padStart(2, "0")}
                label={s.label}
                accent={s.accent}
              />
              <ReadingSection section={s} />
              {s.transition && <TransitionLine text={s.transition} />}
            </div>
          ))}
        </div>

        {/* Seção Intimidade (Vênus) */}
        <SectionDivider
          number={String(report.venus.chapter).padStart(2, "0")}
          label={report.venus.label}
          accent="rose"
        />
        <VenusSection venus={report.venus} />
        {report.venus.transition && <TransitionLine text={report.venus.transition} />}

        {/* Cruzamentos */}
        {report.crossings.length > 0 && (
          <>
            <SectionDivider number="07" label="Onde as linhas se encontram" accent="rose" />
            <div className="flex flex-col gap-8">
              {report.crossings.map((c, i) => {
                // Primeira sentença vira lead/subtítulo técnico
                const periodIdx = c.body.indexOf(". ");
                const lead = periodIdx > -1 ? c.body.slice(0, periodIdx + 1) : "";
                const rest = periodIdx > -1 ? c.body.slice(periodIdx + 2) : c.body;
                const num = String(i + 1).padStart(2, "0");
                return (
                  <motion.article
                    key={`cross-${i}`}
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

        {/* Compatibilidade */}
        {report.compatibility.length > 0 && (
          <div className="mt-6">
            <SectionDivider number="08" label="Com quem você casa" accent="gold" />
            <CompatibilityGrid items={report.compatibility} />
          </div>
        )}

        {/* Sinais Raros */}
        {report.rare_signs.length > 0 && (
          <>
            <SectionDivider number="09" label="O que quase ninguém tem" accent="gold" />
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
                    {r.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </>
        )}

        <Separator variant="ornamental" />

        {/* Epílogo */}
        <div className="flex flex-col items-center text-center gap-5 px-2 mt-4">
          <p className="font-cormorant italic text-[22px] sm:text-[26px] text-bone leading-[1.35] max-w-md">
            {report.epilogue}
          </p>
          <ShareButton readingId={id} />
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("maosfalam_name_fresh");
                sessionStorage.removeItem("maosfalam_reading_id");
                sessionStorage.removeItem("maosfalam_impact_phrase");
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
    </main>
  );
}

export default function CompletoPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <Suspense fallback={<PageLoading />}>
      <CompletoInner id={id} />
    </Suspense>
  );
}
