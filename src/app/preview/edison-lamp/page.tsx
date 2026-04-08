"use client";

import { useState } from "react";
import EdisonLamp from "@/components/landing/EdisonLamp";

/**
 * Preview do EdisonLamp.
 * Botão "Acender de novo" remonta o componente pra reiniciar a timeline.
 */
export default function EdisonLampPreview() {
  const [key, setKey] = useState(0);

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <EdisonLamp key={key} />

      <div className="relative z-[25] flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-cinzel text-2xl tracking-[0.2em] text-gold mt-40">
          A LUZ CHEGOU
        </p>
        <p className="font-cormorant italic text-xl text-bone-dim max-w-md">
          Uma lâmpada. Um véu. E o que você chama de escuro,
          só existia porque ainda não tinha motivo pra ir embora.
        </p>

        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="mt-6 cursor-pointer border border-gold/20 bg-black/40 px-5 py-2 font-jetbrains text-[10px] uppercase tracking-[0.3em] text-gold-dim transition-colors hover:border-gold/40 hover:text-gold"
          style={{ borderRadius: "0 5px 0 5px" }}
        >
          Acender de novo
        </button>
      </div>
    </main>
  );
}
