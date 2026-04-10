"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui";

export default function LerError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[LerError]", error);
    }
  }, [error]);

  return (
    <div className="bg-black min-h-dvh flex items-center justify-center px-6">
      <div className="corner-ornaments branded-radius border border-[rgba(201,162,74,0.1)] bg-deep p-8 max-w-sm w-full text-center flex flex-col items-center gap-6">
        <p className="font-cormorant italic text-xl text-bone tracking-[0.02em] leading-relaxed">
          Suas linhas se embaralharam. Volta pro inicio.
        </p>

        <Link href="/ler/nome">
          <Button variant="secondary">Voltar</Button>
        </Link>
      </div>
    </div>
  );
}
