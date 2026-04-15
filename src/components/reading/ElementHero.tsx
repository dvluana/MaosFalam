"use client";

import { motion } from "framer-motion";

import useStoredName from "@/hooks/useStoredName";
import type { HandElement } from "@/types/report";

import ElementAtmosphere from "./ElementAtmosphere";
import ElementGlyph from "./ElementGlyph";

const elementLabel: Record<HandElement, string> = {
  fire: "Fogo",
  water: "Água",
  earth: "Terra",
  air: "Ar",
};

// Cor ambiente (glow) de cada elemento
const glowColor: Record<HandElement, string> = {
  fire: "rgba(201,162,74,0.18)",
  water: "rgba(123,107,165,0.18)",
  earth: "rgba(139,91,56,0.16)",
  air: "rgba(232,223,208,0.12)",
};

// A cigana abrindo. Fala fluida, sem cortar no meio. O elemento é a
// punchline — a última palavra da frase dela, não um rótulo no meio.
const ciganaOpening: Record<HandElement, (name: string) => string> = {
  fire: (n) => `Suas mãos queimam, ${n}. Eu sei antes de olhar que seu elemento é`,
  water: (n) => `Suas mãos são profundas, ${n}. Eu sei antes de tocar que seu elemento é`,
  earth: (n) => `Suas mãos são firmes, ${n}. Eu sei antes de segurar que seu elemento é`,
  air: (n) => `Sua mente não desliga, ${n}. Eu sei antes de ouvir que seu elemento é`,
};

// Cor do nome do elemento (destaque final da frase)
const nameGlow: Record<HandElement, string> = {
  fire: "rgba(239,130,40,0.5)",
  water: "rgba(139,123,191,0.5)",
  earth: "rgba(201,155,106,0.45)",
  air: "rgba(244,236,216,0.45)",
};

interface Props {
  element: { key: HandElement };
  impactPhrase: string;
  targetName?: string;
}

export default function ElementHero({ element, impactPhrase, targetName }: Props) {
  const storedName = useStoredName();
  // Prefer the reading's target_name (from API) over sessionStorage to avoid
  // stale names from a previous /ler/nome flow overriding the current reading.
  const name = targetName ?? storedName ?? "Você";

  return (
    <section className="relative overflow-hidden pt-28 pb-20 px-6">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 42%, ${glowColor[element.key]} 0%, transparent 70%)`,
        }}
      />

      {/* Side vertical lines */}
      <div
        aria-hidden
        className="absolute top-10 bottom-10 left-6 w-px"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(201,162,74,0.22), transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-10 bottom-10 right-6 w-px"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(201,162,74,0.22), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1 }}
        className="relative flex flex-col items-center gap-8 text-center max-w-lg mx-auto"
      >
        {/* Eyebrow: nome */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <span
            className="h-px w-10"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
            }}
          />
          <span className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold-dim whitespace-nowrap">
            Leitura de {name}
          </span>
          <span
            className="h-px w-10"
            style={{
              background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
            }}
          />
        </motion.div>

        {/* Glyph alquímico com ring rotativo */}
        <div className="relative flex items-center justify-center my-1">
          <motion.div
            aria-hidden
            className="absolute inset-[-20px] rounded-full"
            style={{ border: "1px dashed rgba(201,162,74,0.22)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-[-38px] rounded-full"
            style={{ border: "1px solid rgba(201,162,74,0.08)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          >
            <ElementGlyph type={element.key} size={150} />
          </motion.div>
        </div>

        {/* A fala da cigana fluindo até o nome do elemento */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 1 }}
          className="font-cormorant italic text-[22px] sm:text-[26px] text-bone leading-[1.38] max-w-md"
        >
          {ciganaOpening[element.key](name)}
        </motion.p>

        {/* MASSIVE element name — a última palavra da frase dela */}
        <div className="relative -mt-2 w-full flex items-center justify-center">
          {/* Atmosfera animada do elemento atrás do texto, com fade radial nas bordas */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              width: "min(560px, 100%)",
              height: "clamp(150px, 26vw, 280px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.6,
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, transparent 85%)",
              maskImage:
                "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, transparent 85%)",
            }}
          >
            <ElementAtmosphere type={element.key} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12, letterSpacing: "0.15em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.08em" }}
            transition={{
              delay: 0.85,
              duration: 1.2,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="relative font-cinzel font-medium text-gold leading-[0.95]"
            style={{
              fontSize: "clamp(64px, 18vw, 112px)",
              textShadow: `0 0 44px ${nameGlow[element.key]}, 0 0 88px ${nameGlow[element.key]}, 0 2px 0 rgba(0,0,0,0.8), 0 0 2px rgba(201,162,74,0.8)`,
            }}
          >
            {elementLabel[element.key]}
          </motion.h1>
        </div>

        {/* Divider ornamental */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex items-center gap-3 mt-2"
        >
          <span
            className="h-px w-16"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.6))",
            }}
          />
          <span
            className="w-1.5 h-1.5 rotate-45 bg-gold"
            style={{ boxShadow: "0 0 8px rgba(201,162,74,0.6)" }}
          />
          <span
            className="h-px w-16"
            style={{
              background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.6))",
            }}
          />
        </motion.div>

        {/* Impact phrase */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1.2 }}
          className="font-cormorant italic text-[22px] sm:text-[28px] text-gold-light leading-[1.35] max-w-md"
          style={{ textShadow: "0 0 24px rgba(201,162,74,0.2)" }}
        >
          {impactPhrase}
        </motion.p>
      </motion.div>
    </section>
  );
}
