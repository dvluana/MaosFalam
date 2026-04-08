import Link from "next/link";
import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";

export default function UpsellSection() {
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
      <Link href="/creditos">
        <Button variant="primary" size="lg">
          Desbloquear tudo
        </Button>
      </Link>
    </div>
  );
}
