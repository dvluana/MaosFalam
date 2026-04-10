import Link from "next/link";

import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";

export default function NotFound() {
  return (
    <main className="min-h-dvh velvet-bg flex flex-col items-center justify-center px-6 text-center gap-10">
      {/* gold ornamental separator above text */}
      <Separator variant="ornamental" className="w-40" />

      <div className="relative rounded-[0_6px_0_6px] max-w-md">
        {/* corner ornaments */}
        <span
          aria-hidden
          className="absolute -top-3 -left-3 w-2 h-2 border-t border-l border-[rgba(201,162,74,0.25)]"
        />
        <span
          aria-hidden
          className="absolute -bottom-3 -right-3 w-2 h-2 border-b border-r border-[rgba(201,162,74,0.25)]"
        />

        <p className="font-cormorant italic text-2xl text-bone leading-snug">
          Esse caminho não existe. Mas o seu, sim.
        </p>
      </div>

      <Link href="/">
        <Button variant="primary">Voltar pro início</Button>
      </Link>
    </main>
  );
}
