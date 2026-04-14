"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import { useAuth } from "@/hooks/useAuth";
import { upgradeReading } from "@/lib/reading-client";

interface UpsellSectionProps {
  readingId: string;
}

export default function UpsellSection({ readingId }: UpsellSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setUpgrading(true);
    setError(null);

    try {
      await upgradeReading(readingId);
      router.push(`/ler/resultado/${readingId}/completo`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("401") || msg.toLowerCase().includes("autenticado")) {
        router.push("/login");
      } else if (msg.startsWith("402") || msg.toLowerCase().includes("credito")) {
        router.push(`/creditos?reading=${readingId}`);
      } else {
        setError("Algo saiu do caminho. Tente de novo.");
        setUpgrading(false);
      }
    }
  };

  return (
    <div className="py-10 px-4 text-center">
      <Separator variant="ornamental" className="mb-6" />
      <p className="font-cormorant italic text-2xl text-bone mb-2">Tem mais. Muito mais.</p>
      <p className="font-raleway text-[14px] text-bone-dim mb-6 max-w-sm mx-auto leading-[1.8]">
        Você leu o coração. Faltam três linhas, oito montes, e os sinais que quase ninguém tem. Eu
        vi todos na sua mão.
      </p>
      {error && <p className="font-raleway text-[13px] text-rose mb-4">{error}</p>}
      <Button variant="primary" size="lg" onClick={handleClick} disabled={upgrading}>
        {upgrading ? "Desbloqueando..." : "Desbloquear tudo"}
      </Button>
    </div>
  );
}
