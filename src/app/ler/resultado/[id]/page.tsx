"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useCallback, useEffect, useState } from "react";

import BlurredDeck from "@/components/reading/BlurredDeck";
import ElementHero from "@/components/reading/ElementHero";
import ReadingOverview from "@/components/reading/ReadingOverview";
import ReadingSection from "@/components/reading/ReadingSection";
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

function PaymentConfirming({ message }: { message: string }) {
  return (
    <main className="min-h-dvh bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-sm flex flex-col items-center gap-4">
        <span className="block w-6 h-6 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
        <p className="font-cormorant italic text-[22px] text-bone leading-snug">{message}</p>
      </div>
    </main>
  );
}

function ResultadoInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPaidReturn = searchParams.get("paid") === "1";

  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [paymentPending, setPaymentPending] = useState(isPaidReturn);
  const [retried, setRetried] = useState(false);

  const handlePaymentReturn = useCallback(
    (r: Reading) => {
      if (r.tier === "premium") {
        router.replace(`/ler/resultado/${id}/completo`);
      } else if (!retried) {
        // Webhook may not have processed yet; retry once after 3s
        const timer = setTimeout(() => {
          setRetried(true);
          getReading(id)
            .then((refetched) => {
              if (refetched?.tier === "premium") {
                router.replace(`/ler/resultado/${id}/completo`);
              } else {
                // Still free after retry — show normal page
                setPaymentPending(false);
              }
            })
            .catch(() => {
              setPaymentPending(false);
            });
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setPaymentPending(false);
      }
    },
    [id, retried, router],
  );

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

        if (isPaidReturn) {
          handlePaymentReturn(r);
        }
      })
      .catch(() => {
        setServerError(true);
        setLoading(false);
      });
  }, [id, isPaidReturn, handlePaymentReturn]);

  if (loading) return <PageLoading />;
  if (paymentPending) {
    return (
      <PaymentConfirming
        message={
          retried
            ? "Seu pagamento esta sendo confirmado. Recarregue em alguns instantes."
            : "Confirmando seu pagamento..."
        }
      />
    );
  }
  if (serverError) return <ServerError />;
  if (notFound || !reading) return <InvalidReading />;

  const report: ReportJSON = reading.report;
  const element: HandElement = report.element.key;
  const heart = report.sections.find((s) => s.key === "heart");

  return (
    <main className="min-h-dvh bg-black pb-24">
      <ElementHero
        element={{ key: element, secondary_key: report.element.secondary_key }}
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
          <UpsellSection readingId={id} />
          <div className="flex justify-center">
            <ShareButton readingId={id} />
          </div>
        </div>
      </div>
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
