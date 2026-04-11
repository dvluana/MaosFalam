import BlocoFinal from "@/components/lp-venda/BlocoFinal";
import ComoFunciona from "@/components/lp-venda/ComoFunciona";
import Credibilidade from "@/components/lp-venda/Credibilidade";
import CTAFinal from "@/components/lp-venda/CTAFinal";
import Depoimentos from "@/components/lp-venda/Depoimentos";
import Entrega from "@/components/lp-venda/Entrega";
import FAQ from "@/components/lp-venda/FAQ";
import Hero from "@/components/lp-venda/Hero";
import MarqueeFrases from "@/components/lp-venda/MarqueeFrases";
import NumerosQueFalam from "@/components/lp-venda/NumerosQueFalam";
import Perguntas from "@/components/lp-venda/Perguntas";
import StickyCTA from "@/components/lp-venda/StickyCTA";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MãosFalam | A primeira plataforma de leitura de mão do Brasil",
  description:
    "Seu ex. Seu futuro. E tudo que ainda não te contaram. Leitura de mão de verdade, com base escrita à mão, sinais cruzados e leitura humana.",
};

export default function LpVendaPage() {
  return (
    <main className="relative min-h-svh w-full overflow-x-hidden bg-black">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 130% 78% at 50% -14%, rgba(121,39,55,0.16) 0%, transparent 58%)",
            "radial-gradient(ellipse 100% 62% at 50% 118%, rgba(139,90,56,0.16) 0%, transparent 58%)",
            "linear-gradient(180deg, rgba(8,5,14,0.9) 0%, rgba(8,5,14,0.74) 38%, rgba(8,5,14,0.96) 100%)",
          ].join(", "),
        }}
      />

      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative mx-auto max-w-[430px]">
        <Hero />
        <MarqueeFrases />
        <Perguntas />
        <Credibilidade />
        <Depoimentos />
        <ComoFunciona />
        <Entrega />
        <NumerosQueFalam />
        <BlocoFinal />
        <FAQ />
        <CTAFinal />
      </div>

      <StickyCTA />
    </main>
  );
}
