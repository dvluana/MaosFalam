"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, use, useMemo } from "react";

import BlurredDeck from "@/components/reading/BlurredDeck";
import ElementHero from "@/components/reading/ElementHero";
import ReadingOverview from "@/components/reading/ReadingOverview";
import ReadingSection from "@/components/reading/ReadingSection";
import ResultStateSwitcher from "@/components/reading/ResultStateSwitcher";
import ShareButton from "@/components/reading/ShareButton";
import UpsellSection from "@/components/reading/UpsellSection";
import Separator from "@/components/ui/Separator";
import { buildMockReading } from "@/mocks/build-reading";
import type { HandElement } from "@/types/reading";

/** IDs de mock validos enquanto nao tem backend */
const VALID_MOCK_IDS = new Set(["fire", "water", "earth", "air", "mock", "demo"]);

interface PageProps {
  params: Promise<{ id: string }>;
}

const VALID_ELEMENTS: HandElement[] = ["fire", "water", "earth", "air"];

function isElement(v: string | null): v is HandElement {
  return v !== null && (VALID_ELEMENTS as string[]).includes(v);
}

function InvalidReading() {
  return (
    <main className="min-h-dvh bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="font-cormorant italic text-[22px] text-bone leading-snug mb-6">
          Essa leitura nao existe. Mas a sua pode comecar agora.
        </p>
        <a
          href="/ler/nome"
          className="font-body text-[10px] uppercase tracking-[0.06em] text-bone border border-gold/10 rounded-[0_6px_0_6px] px-10 py-4 inline-block hover:bg-violet/5 transition-colors"
        >
          Comecar leitura
        </a>
      </div>
    </main>
  );
}

function ResultadoInner({ id }: { id: string }) {
  const search = useSearchParams();
  const elementParam = search?.get("element") ?? null;
  const element: HandElement = isElement(elementParam) ? elementParam : "fire";
  const data = useMemo(() => buildMockReading(element), [element]);

  const heart = data.report.sections.find((s) => s.line === "heart");
  const otherLines = data.report.sections.filter((s) => s.line !== "heart");

  return (
    <main className="min-h-dvh bg-black pb-24">
      <ElementHero element={data.report.element} fallbackName={data.report.user_name} />

      <div className="px-4 max-w-xl mx-auto flex flex-col gap-10">
        {/* Visão geral da mão */}
        <ReadingOverview element={data.report.element} fallbackName={data.report.user_name} />

        <Separator variant="gold" />

        {heart && <ReadingSection section={heart} />}

        <Separator variant="ornamental" />

        <div className="flex flex-col items-center text-center gap-4 px-2">
          <h2 className="font-cinzel text-[22px] sm:text-[26px] text-bone leading-tight">
            Tem mais. Muito mais.
          </h2>
          <p className="font-cormorant italic text-lg sm:text-xl text-bone-dim leading-snug max-w-md">
            Você leu o coração. Faltam três linhas, oito montes, e os sinais que quase ninguém tem.
            Eu vi todos na sua mão.
          </p>
        </div>

        <BlurredDeck
          cards={otherLines.map((s) => ({
            line: s.line,
            symbol: s.symbol,
            planet: s.planet,
            teaser: s.intro,
          }))}
        />

        <div className="flex flex-col gap-6 mt-4">
          <UpsellSection />
          <div className="flex justify-center">
            <ShareButton readingId={id} />
          </div>
        </div>
      </div>

      <ResultStateSwitcher element={element} tier="free" readingId={id} />
    </main>
  );
}

export default function ResultadoPage({ params }: PageProps) {
  const { id } = use(params);

  // Guard: IDs invalidos sem sessao ativa
  if (
    typeof window !== "undefined" &&
    !VALID_MOCK_IDS.has(id) &&
    !sessionStorage.getItem("maosfalam_name_fresh")
  ) {
    return <InvalidReading />;
  }

  return (
    <Suspense fallback={<main className="min-h-dvh bg-black" />}>
      <ResultadoInner id={id} />
    </Suspense>
  );
}
