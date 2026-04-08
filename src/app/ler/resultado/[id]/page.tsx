"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMock } from "@/hooks/useMock";
import type { Reading, HandElement } from "@/types/reading";
import ElementHero from "@/components/reading/ElementHero";
import ReadingOverview from "@/components/reading/ReadingOverview";
import ReadingSection from "@/components/reading/ReadingSection";
import BlurredDeck from "@/components/reading/BlurredDeck";
import UpsellSection from "@/components/reading/UpsellSection";
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

function ResultadoInner({ id }: { id: string }) {
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

  const heart = data.report.sections.find((s) => s.line === "heart");
  const otherLines = data.report.sections.filter((s) => s.line !== "heart");

  return (
    <main className="min-h-dvh bg-black pb-24">
      <ElementHero
        element={data.report.element}
        fallbackName={data.report.user_name}
      />

      <div className="px-4 max-w-xl mx-auto flex flex-col gap-10">
        {/* Visão geral da mão */}
        <ReadingOverview
          element={data.report.element}
          fallbackName={data.report.user_name}
        />

        <Separator variant="gold" />

        {heart && <ReadingSection section={heart} />}

        <Separator variant="ornamental" />

        <div className="flex flex-col items-center text-center gap-4 px-2">
          <h2 className="font-cinzel text-[22px] sm:text-[26px] text-bone leading-tight">
            Tem mais. Muito mais.
          </h2>
          <p className="font-cormorant italic text-lg sm:text-xl text-bone-dim leading-snug max-w-md">
            Você leu o coração. Faltam três linhas, oito montes, e os sinais
            que quase ninguém tem. Eu vi todos na sua mão.
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
  return (
    <Suspense fallback={<main className="min-h-dvh bg-black" />}>
      <ResultadoInner id={id} />
    </Suspense>
  );
}
