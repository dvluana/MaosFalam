"use client";

import { use, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { useMock } from "@/hooks/useMock";
import type { Reading } from "@/types/reading";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SharePage({ params }: PageProps) {
  const { id } = use(params);
  const { data, loading } = useMock<Reading>("reading-fire");
  const [shared, setShared] = useState(false);

  if (loading || !data) {
    return (
      <main className="min-h-dvh bg-black flex items-center justify-center">
        <p className="font-cormorant italic text-bone-dim">Um momento...</p>
      </main>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/compartilhar/${data.share_token}`
      : `/compartilhar/${data.share_token}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
    } catch {
      setShared(true);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "MãosFalam",
          text: data.report.share_phrase,
          url: shareUrl,
        });
        setShared(true);
        return;
      } catch {
        /* user cancelled */
      }
    }
    void handleCopy();
  };

  if (shared) {
    return (
      <main className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 gap-6 text-center">
        <p className="font-cormorant italic text-2xl text-bone max-w-sm">
          Sua leitura está no mundo.
        </p>
        <Link href={`/ler/resultado/${id}`}>
          <Button variant="secondary">Voltar pra leitura</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black px-4 py-10 flex flex-col items-center gap-8">
      <h1 className="font-cinzel text-[18px] text-bone-dim uppercase tracking-widest">
        Compartilhar
      </h1>

      <div className="w-full max-w-xs aspect-[9/16]">
        <Card parchment accentColor="gold" className="h-full">
          <div className="flex flex-col h-full justify-between items-center text-center py-6 px-2">
            <Badge variant="gold">{data.report.element.title}</Badge>
            <p className="font-cormorant italic text-[22px] leading-snug text-bone px-2">
              &ldquo;{data.report.share_phrase}&rdquo;
            </p>
            <p className="font-logo text-[18px] text-gold tracking-wider">
              MãosFalam
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="primary" onClick={handleShare}>
          Compartilhar
        </Button>
        <Button variant="secondary" onClick={handleCopy}>
          Copiar link
        </Button>
        <Button variant="ghost" onClick={() => setShared(true)}>
          Baixar imagem
        </Button>
      </div>
    </main>
  );
}
