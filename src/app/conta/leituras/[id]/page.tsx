"use client";

import { Suspense, use, useState } from "react";
import { notFound } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useMock } from "@/hooks/useMock";
import type { User } from "@/types/reading";
import ElementSection from "@/components/reading/ElementSection";
import ReadingSection from "@/components/reading/ReadingSection";
import BlurredCard from "@/components/reading/BlurredCard";
import UpsellSection from "@/components/reading/UpsellSection";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import StateSwitcher from "@/components/ui/StateSwitcher";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATES = ["free_saved", "premium_saved", "share_options"] as const;
type State = (typeof STATES)[number];

function ShareOptions({ token }: { token: string }) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/compartilhar/${token}`
      : `/compartilhar/${token}`;
  const waMessage = encodeURIComponent(
    `Olha o que suas mãos disseram: ${shareUrl}`,
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert("Link copiado.");
    } catch {
      window.alert("Não consegui copiar. Tente de novo.");
    }
  };
  return (
    <Card accentColor="gold">
      <h3 className="font-cinzel text-[15px] text-bone mb-4">Compartilhar</h3>
      <div className="flex flex-col gap-3">
        <Button
          variant="secondary"
          onClick={() => window.alert("Card pronto pros stories.")}
        >
          Stories
        </Button>
        <a
          href={`https://wa.me/?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-raleway uppercase tracking-[0.06em] text-[10px] text-bone inline-flex items-center justify-center gap-2 px-10 py-4 branded-radius corner-ornaments border border-[rgba(201,162,74,0.10)] hover:bg-[rgba(123,107,165,0.06)] transition-all"
        >
          WhatsApp
        </a>
        <Button variant="ghost" onClick={copy}>
          Copiar link
        </Button>
      </div>
    </Card>
  );
}

function LeituraContent({ id }: { id: string }) {
  const { data, loading } = useMock<User>("user");
  const search = useSearchParams();
  const stateParam = search.get("state") as State | null;
  const [showShare, setShowShare] = useState(false);

  if (loading || !data) {
    return (
      <main className="min-h-dvh velvet-bg flex items-center justify-center">
        <p className="font-cormorant italic text-bone-dim">Um momento...</p>
      </main>
    );
  }

  const reading = data.readings.find((r) => r.id === id);
  if (!reading) {
    notFound();
  }

  const forcedTier: State = stateParam && (STATES as readonly string[]).includes(stateParam)
    ? stateParam
    : reading.tier === "premium"
      ? "premium_saved"
      : "free_saved";

  const isPremium = forcedTier === "premium_saved";
  const heart = reading.report.sections.find((s) => s.line === "heart");
  const other = reading.report.sections.filter((s) => s.line !== "heart");

  return (
    <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-8 pb-20">
      <header className="text-center">
        <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest mb-2">
          leitura salva
        </p>
        <h1 className="font-cinzel text-[26px] text-bone">
          {isPremium ? "Suas linhas inteiras" : "Suas mãos falaram"}
        </h1>
        <div className="mt-3 flex justify-center">
          <Badge variant={isPremium ? "violet" : "gold"}>
            {isPremium ? "Completa" : "Free"}
          </Badge>
        </div>
      </header>

      <ElementSection element={reading.report.element} />
      <Separator variant="gold" />

      {isPremium ? (
        <>
          {reading.report.sections.map((s) => (
            <ReadingSection key={s.line} section={s} />
          ))}
          {reading.report.mounts.length > 0 && (
            <>
              <Separator variant="ornamental" />
              <h2 className="font-cinzel text-[18px] text-bone text-center">
                Os Montes
              </h2>
              {reading.report.mounts.map((m) => (
                <Card key={m.name} parchment accentColor="violet">
                  <h3 className="font-cinzel text-[15px] text-bone mb-3">
                    {m.name}
                  </h3>
                  <p className="font-raleway text-[15px] leading-[1.85] text-bone">
                    {m.content}
                  </p>
                </Card>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {heart && <ReadingSection section={heart} />}
          <Separator variant="ornamental" />
          <p className="font-cormorant italic text-xl text-bone-dim text-center">
            Tem mais. Muito mais.
          </p>
          <div className="flex flex-col gap-6">
            {other.map((s) => (
              <BlurredCard
                key={s.line}
                line={s.line}
                symbol={s.symbol}
                planet={s.planet}
                teaser={s.intro}
              />
            ))}
          </div>
          <UpsellSection />
        </>
      )}

      <Separator variant="gold" />

      {showShare || forcedTier === "share_options" ? (
        <ShareOptions token={reading.share_token} />
      ) : (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setShowShare(true)}>
            Compartilhar
          </Button>
        </div>
      )}

      <StateSwitcher states={STATES} current={forcedTier} />
    </div>
  );
}

export default function LeituraSalvaPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh velvet-bg flex items-center justify-center">
          <p className="font-cormorant italic text-bone-dim">Um momento...</p>
        </main>
      }
    >
      <LeituraContent id={id} />
    </Suspense>
  );
}
