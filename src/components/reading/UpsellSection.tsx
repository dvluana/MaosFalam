"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import { useAuth } from "@/hooks/useAuth";

interface UpsellSectionProps {
  readingId: string;
}

export default function UpsellSection({ readingId }: UpsellSectionProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect to credits page — upgrade happens via purchase flow
    // (buy credit -> webhook credits -> user revisits reading)
    router.push(`/creditos?reading=${readingId}`);
  };

  return (
    <div className="py-10 px-4 text-center">
      <Separator variant="ornamental" className="mb-6" />
      <p className="font-cormorant italic text-2xl text-bone mb-2">Tem mais. Muito mais.</p>
      <p className="font-raleway text-[14px] text-bone-dim mb-6 max-w-sm mx-auto leading-[1.8]">
        Você leu o coração. Faltam três linhas, oito montes, e os sinais que quase ninguém tem. Eu
        vi todos na sua mão.
      </p>
      <Button variant="primary" size="lg" onClick={handleClick}>
        Desbloquear tudo
      </Button>
    </div>
  );
}
