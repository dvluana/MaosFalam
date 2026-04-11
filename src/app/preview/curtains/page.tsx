"use client";

import { useState } from "react";

import Curtains from "@/components/landing/Curtains";

/**
 * Preview do Curtains.
 * Botão "reset" remonta o componente pra ver o reveal de novo sem F5.
 */
export default function CurtainsPreview() {
  const [key, setKey] = useState(0);

  return (
    <main className="relative min-h-screen bg-black">
      <Curtains key={key} />

      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-cinzel text-3xl tracking-[0.2em] text-gold">REVELADA</p>
        <p className="font-cormorant italic text-xl text-bone-dim max-w-md">
          A cortina já abriu. O que você está vendo é o que fica depois.
        </p>

        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="mt-6 cursor-pointer border border-gold/20 bg-black/40 px-5 py-2 font-jetbrains text-[10px] uppercase tracking-[0.3em] text-gold-dim transition-colors hover:border-gold/40 hover:text-gold"
          style={{ borderRadius: "0 5px 0 5px" }}
        >
          Abrir de novo
        </button>
      </div>
    </main>
  );
}
