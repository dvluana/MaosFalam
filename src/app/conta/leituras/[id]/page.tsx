"use client";

import { notFound } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";

import BlurredCard from "@/components/reading/BlurredCard";
import ElementSection from "@/components/reading/ElementSection";
import ReadingSection from "@/components/reading/ReadingSection";
import UpsellSection from "@/components/reading/UpsellSection";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Separator from "@/components/ui/Separator";
import { getReading } from "@/lib/reading-client";
import { buildShareUrl } from "@/lib/share-url";
import type { Reading } from "@/types/report";

interface PageProps {
  params: Promise<{ id: string }>;
}

type State = "free_saved" | "premium_saved" | "share_options";

function ShareOptions({ readingId }: { readingId: string }) {
  const shareUrl = buildShareUrl(readingId);
  const waMessage = encodeURIComponent(`Olha o que suas mãos disseram: ${shareUrl}`);
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
        <Button variant="secondary" onClick={() => window.alert("Card pronto pros stories.")}>
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
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    getReading(id)
      .then((r) => {
        setReading(r);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-dvh velvet-bg flex items-center justify-center">
        <p className="font-cormorant italic text-bone-dim">Um momento...</p>
      </main>
    );
  }

  if (!reading) {
    notFound();
  }

  const currentTier: State = reading.tier === "premium" ? "premium_saved" : "free_saved";

  const isPremium = currentTier === "premium_saved";
  const heart = reading.report.sections.find((s) => s.key === "heart");
  const other = reading.report.sections.filter((s) => s.key !== "heart");

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
          <Badge variant={isPremium ? "violet" : "gold"}>{isPremium ? "Completa" : "Free"}</Badge>
        </div>
      </header>

      <ElementSection
        element={reading.report.element}
        impactPhrase={reading.report.impact_phrase}
      />
      <Separator variant="gold" />

      {isPremium ? (
        <>
          {reading.report.sections.map((s) => (
            <ReadingSection key={s.key} section={s} />
          ))}
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
              <BlurredCard key={s.key} label={s.label} teaser={s.opening} />
            ))}
          </div>
          <UpsellSection />
        </>
      )}

      <Separator variant="gold" />

      {showShare ? (
        <ShareOptions readingId={reading.id} />
      ) : (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setShowShare(true)}>
            Compartilhar
          </Button>
        </div>
      )}
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
