"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ReadingReport, HandElement } from "@/types/reading";
import { readStoredName } from "@/lib/personalize";

interface Props {
  element: ReadingReport["element"];
  fallbackName: string;
}

// Abertura do capítulo: a cigana sentando, começando a falar sério.
const openings: Record<HandElement, (name: string) => string> = {
  fire: (n) =>
    `Senta, ${n}. Eu vou começar pelo começo. Tem muita coisa pra dizer, e a gente não tem pressa.`,
  water: (n) =>
    `Senta aí, ${n}. Eu preciso de um tempo pra contar o que vi. E você precisa de tempo pra ouvir.`,
  earth: (n) =>
    `Calma, ${n}. Eu vou do começo. Você construiu muita coisa em silêncio. Eu vi tudo.`,
  air: (n) =>
    `Respira, ${n}. Eu sei que sua cabeça já tá girando. Deixa eu começar do princípio.`,
};

export default function ReadingOverview({ element, fallbackName }: Props) {
  const [name, setName] = useState<string>(fallbackName);

  useEffect(() => {
    const stored = readStoredName();
    if (stored) setName(stored);
  }, []);

  // Quebra o body do elemento em parágrafos por pontos finais (aproximado),
  // agrupando em 2-3 sentenças por parágrafo pra respiração visual.
  const sentences = element.body
    .split(/(?<=\.)\s+/)
    .filter((s) => s.trim().length > 0);
  const paragraphs: string[] = [];
  const group = 3;
  for (let i = 0; i < sentences.length; i += group) {
    paragraphs.push(sentences.slice(i, i + group).join(" "));
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1 }}
      className="card-noise relative overflow-hidden px-7 py-11 sm:px-11 sm:py-14"
      style={{
        background: "#0e0a18",
        border: "1px solid rgba(201,162,74,0.10)",
        boxShadow:
          "0 28px 56px -16px rgba(0,0,0,0.85), 0 10px 24px -8px rgba(0,0,0,0.6)",
      }}
    >
      {/* Atmosfera: glow suave no topo */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(201,162,74,0.08), transparent 80%)",
        }}
      />

      {/* Corner accents */}
      <span
        aria-hidden
        className="absolute w-3 h-3 top-2 left-2 border-t border-l"
        style={{ borderColor: "rgba(201,162,74,0.28)" }}
      />
      <span
        aria-hidden
        className="absolute w-3 h-3 bottom-2 right-2 border-b border-r"
        style={{ borderColor: "rgba(201,162,74,0.28)" }}
      />

      <div className="relative flex flex-col">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <span className="h-px w-6 bg-gold-dim/50" />
          <span className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold-dim whitespace-nowrap">
            O que eu vi na sua mão
          </span>
          <span className="h-px flex-1 bg-gold-dim/20" />
        </div>

        {/* Abertura da cigana: frase grande em Cormorant */}
        <p className="font-cormorant italic text-[24px] sm:text-[28px] text-bone leading-[1.3] mb-8 max-w-xl">
          {openings[element.type](name)}
        </p>

        {/* Separador sutil */}
        <div
          className="h-px mb-8"
          style={{
            background:
              "linear-gradient(90deg, rgba(201,162,74,0.35), rgba(201,162,74,0.05) 60%, transparent)",
          }}
        />

        {/* Corpo: parágrafos maiores, mais respiração */}
        <div className="flex flex-col gap-5">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.8 }}
              className="font-raleway text-[15.5px] sm:text-[17px] font-light leading-[1.9] text-bone"
              style={
                i === 0
                  ? {
                      // Capitular na primeira letra do primeiro parágrafo
                      fontWeight: 300,
                    }
                  : undefined
              }
            >
              {i === 0 ? (
                <>
                  <span
                    className="font-cinzel text-gold float-left mr-2 leading-none"
                    style={{
                      fontSize: "54px",
                      lineHeight: "0.9",
                      marginTop: "4px",
                      textShadow: "0 0 16px rgba(201,162,74,0.3)",
                    }}
                  >
                    {p.charAt(0)}
                  </span>
                  {p.slice(1)}
                </>
              ) : (
                p
              )}
            </motion.p>
          ))}
        </div>

        {/* Assinatura visual: losango ornamental no fim */}
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-gold-dim/40" />
            <span
              className="w-1 h-1 rotate-45 bg-gold-dim"
              aria-hidden
            />
            <span className="h-px w-12 bg-gold-dim/60" />
            <span
              className="w-1.5 h-1.5 rotate-45 bg-gold"
              style={{ boxShadow: "0 0 6px rgba(201,162,74,0.6)" }}
              aria-hidden
            />
            <span className="h-px w-12 bg-gold-dim/60" />
            <span
              className="w-1 h-1 rotate-45 bg-gold-dim"
              aria-hidden
            />
            <span className="h-px w-8 bg-gold-dim/40" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
