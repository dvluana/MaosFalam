"use client";

import { useRouter } from "next/navigation";
import type { Reading, User } from "@/types/reading";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type Variant =
  | "active_free"
  | "active_premium"
  | "expiring_soon"
  | "expired"
  | "reading_for_other";

interface ReadingCardProps {
  reading: Reading;
  currentUser: Pick<User, "name">;
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function resolveVariant(reading: Reading, currentUserName: string): Variant {
  const days = daysUntil(reading.share_expires_at);
  if (reading.report.user_name !== currentUserName) return "reading_for_other";
  if (days < 0) return "expired";
  if (days <= 7) return "expiring_soon";
  if (reading.tier === "premium") return "active_premium";
  return "active_free";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ReadingCard({ reading, currentUser }: ReadingCardProps) {
  const router = useRouter();
  const variant = resolveVariant(reading, currentUser.name);
  const days = daysUntil(reading.share_expires_at);
  const isExpired = variant === "expired";

  const badge = (() => {
    switch (variant) {
      case "active_free":
        return <Badge variant="gold">Free</Badge>;
      case "active_premium":
        return <Badge variant="violet">Completa</Badge>;
      case "expiring_soon":
        return <Badge variant="rose">Expira em {days}d</Badge>;
      case "expired":
        return <Badge variant="bone">Expirado</Badge>;
      case "reading_for_other":
        return <Badge variant="gold">Leitura de {reading.report.user_name}</Badge>;
    }
  })();

  const goTo = () => {
    if (!isExpired) router.push(`/conta/leituras/${reading.id}`);
  };

  const impact =
    reading.report.sections.find((s) => s.line === "heart")?.impact_phrase ??
    reading.report.share_phrase;

  return (
    <Card accentColor={reading.tier === "premium" ? "violet" : "gold"}>
      <button
        type="button"
        onClick={goTo}
        disabled={isExpired}
        className="w-full text-left disabled:cursor-default"
      >
        <div className="flex items-center justify-between mb-3">
          {badge}
          <span className="font-jetbrains text-[9px] text-bone-dim uppercase">
            {formatDate(reading.created_at)}
          </span>
        </div>
        <h3 className="font-cinzel text-[16px] text-bone mb-1">
          {reading.report.user_name}
        </h3>
        <p className="font-cormorant italic text-[14px] text-gold mb-3">
          {reading.report.element.title}
        </p>
        <p className="font-cormorant italic text-[14px] text-bone-dim leading-relaxed">
          {impact}
        </p>
      </button>
      {isExpired && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="font-cormorant italic text-[13px] text-bone-dim">
            O link público expirou. A leitura ainda é sua.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.alert("Novo link gerado.")}
            >
              Gerar novo link
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.alert("Imagem pronta pra salvar.")}
            >
              Compartilhar sem link
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
