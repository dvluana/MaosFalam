"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";

import BlurredDeck from "@/components/reading/BlurredDeck";
import ElementHero from "@/components/reading/ElementHero";
import ReadingOverview from "@/components/reading/ReadingOverview";
import ReadingSection from "@/components/reading/ReadingSection";
import ResultStateSwitcher from "@/components/reading/ResultStateSwitcher";
import ShareButton from "@/components/reading/ShareButton";
import UpsellSection from "@/components/reading/UpsellSection";
import PageLoading from "@/components/ui/PageLoading";
import Separator from "@/components/ui/Separator";
import { getReading } from "@/lib/reading-client";
import type { HandElement, Reading, ReportJSON } from "@/types/report";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Paywall teasers (from architecture doc section 3)
const PAYWALL_TEASERS: Array<{ label: string; teaser: string }> = [
  {
    label: "Mente",
    teaser: "Sua cabeça decide rápido. Seu coração demora pra aceitar. E no meio desse atraso...",
  },
  {
    label: "Passado",
    teaser: "Tem uma marca aqui que apareceu faz uns anos. Você sabe do que eu tô falando.",
  },
  {
    label: "Intimidade",
    teaser: "Quando a porta fecha, você é outra pessoa. E quase ninguém sabe.",
  },
  {
    label: "Destino",
    teaser: "Tem algo chegando. E não, não é o que você tá esperando.",
  },
  {
    label: "Sinais Raros",
    teaser: "Tem uma marca na sua mão que quase ninguém tem. Eu vi.",
  },
];

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

function ServerError() {
  return (
    <main className="min-h-dvh bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="font-cormorant italic text-[22px] text-bone leading-snug mb-6">
          Eu preciso de um momento. Volte em breve.
        </p>
        <a
          href={typeof window !== "undefined" ? window.location.href : "#"}
          className="font-body text-[10px] uppercase tracking-[0.06em] text-bone border border-gold/10 rounded-[0_6px_0_6px] px-10 py-4 inline-block hover:bg-violet/5 transition-colors"
        >
          Tentar de novo
        </a>
      </div>
    </main>
  );
}

function ResultadoInner({ id }: { id: string }) {
  const search = useSearchParams();
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    getReading(id)
      .then((r) => {
        if (!r) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setReading(r);
        setLoading(false);
      })
      .catch(() => {
        setServerError(true);
        setLoading(false);
      });
  }, [id]);

  // Keep search params available for ResultStateSwitcher
  void search;

  if (loading) return <PageLoading />;
  if (serverError) return <ServerError />;
  if (notFound || !reading) return <InvalidReading />;

  const report: ReportJSON = reading.report;
  const element: HandElement = report.element.key;
  const heart = report.sections.find((s) => s.key === "heart");

  return (
    <main className="min-h-dvh bg-black pb-24">
      <ElementHero
        element={{ key: element }}
        impactPhrase={report.impact_phrase}
        targetName={reading.target_name}
      />

      <div className="px-4 max-w-xl mx-auto flex flex-col gap-10">
        {/* Visão geral da mão */}
        <ReadingOverview
          opening={report.opening}
          elementIntro={report.element.intro}
          elementBody={report.element.body}
        />

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

        <BlurredDeck cards={PAYWALL_TEASERS} />

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
    <Suspense fallback={<PageLoading />}>
      <ResultadoInner id={id} />
    </Suspense>
  );
}
