"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";

/**
 * Ao clicar "Desbloquear tudo", salva o reading id atual em sessionStorage
 * pra que depois do pagamento a /creditos consiga mandar a usuária de volta
 * exatamente pra essa leitura em modo /completo (sem perder contexto).
 *
 * TODO (backend): o id da leitura atual devia vir do contexto da URL/rota
 * em vez de sessionStorage. Por enquanto lemos do pathname.
 */
export default function UpsellSection() {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined") {
      // Extrai o id da leitura atual do pathname: /ler/resultado/{id}
      const match = window.location.pathname.match(
        /\/ler\/resultado\/([^/]+)/,
      );
      if (match?.[1]) {
        sessionStorage.setItem("maosfalam_pending_reading", match[1]);
      }
    }
    router.push("/creditos");
  };

  return (
    <div className="py-10 px-4 text-center">
      <Separator variant="ornamental" className="mb-6" />
      <p className="font-cormorant italic text-2xl text-bone mb-2">
        Tem mais. Muito mais.
      </p>
      <p className="font-raleway text-[14px] text-bone-dim mb-6 max-w-sm mx-auto leading-[1.8]">
        Você leu o coração. Faltam três linhas, oito montes, e os sinais que
        quase ninguém tem. Eu vi todos na sua mão.
      </p>
      <Button variant="primary" size="lg" onClick={handleClick}>
        Desbloquear tudo
      </Button>
    </div>
  );
}
