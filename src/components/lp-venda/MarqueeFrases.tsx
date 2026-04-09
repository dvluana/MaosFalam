"use client";

import { motion } from "framer-motion";

export default function MarqueeFrases() {
  return (
    <section
      aria-hidden
      className="relative overflow-hidden py-10 select-none"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(23,18,34,0.4) 50%, transparent 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, #08050e 0%, transparent 12%, transparent 88%, #08050e 100%)",
        }}
      />

      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex shrink-0 gap-10 whitespace-nowrap pr-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        >
          {[...ROW_1, ...ROW_1].map((phrase, index) => (
            <MarqueeItem key={`row-1-${index}`} phrase={phrase} tone="gold" />
          ))}
        </motion.div>
      </div>

      <div className="h-3" />

      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex shrink-0 gap-10 whitespace-nowrap pr-10"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
        >
          {[...ROW_2, ...ROW_2].map((phrase, index) => (
            <MarqueeItem key={`row-2-${index}`} phrase={phrase} tone="rose" />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function MarqueeItem({
  phrase,
  tone,
}: {
  phrase: string;
  tone: "gold" | "rose";
}) {
  const color = tone === "gold" ? "text-gold/72" : "text-rose/68";

  return (
    <span className="flex shrink-0 items-center gap-6">
      <span
        className={`font-cormorant text-[17px] tracking-wide italic ${color}`}
      >
        {phrase}
      </span>
      <span aria-hidden className="h-1 w-1 rotate-45 bg-gold/40" />
    </span>
  );
}

const ROW_1 = [
  "Seu ex ainda ronda.",
  "Tem outra pessoa no caminho dele.",
  "Seu desejo te entrega.",
  "Tem mentira muito perto de você.",
  "Você chama de amarração. Sua mão chama de repetição.",
  "Você repete homem ruim com roupa nova.",
  "Quem mexeu com você não saiu limpo.",
  "A perda vem de onde você menos espera.",
];

const ROW_2 = [
  "Linha do Coração · amor mal fechado.",
  "Monte de Vênus · fogo mal apagado.",
  "Linha de Saturno · caminho puxado.",
  "Linha do Sol · dinheiro travado.",
  "Linha de Mercúrio · traição de boca doce.",
  "Monte de Júpiter · vontade de crescer.",
  "Cinto de Vênus · ciúme e excesso.",
  "Sua mão já abriu o jogo.",
];
