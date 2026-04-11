"use client";

import { motion } from "framer-motion";

import MeasurementBar from "./MeasurementBar";

interface Props {
  items: string[];
}

/**
 * Painel de medição da palma. Cada item no formato "ÍCONE LABEL: VALOR"
 * vira uma célula num grid com tipografia hierárquica, mini-ruler decorativo
 * e ticks, pra parecer um relatório de instrumento de laboratório.
 *
 * Ex de entrada: "⟶ COMPRIMENTO: LONGA, TERMINA NO MONTE DE JÚPITER"
 */
interface Measurement {
  icon: string;
  label: string;
  value: string;
}

// Termos de quiromancia que devem ficar capitalizados mesmo após normalização
const PROPER_NOUNS = new Set([
  "júpiter",
  "jupiter",
  "saturno",
  "apolo",
  "apollo",
  "mercúrio",
  "mercurio",
  "vênus",
  "venus",
  "lua",
  "marte",
  "mars",
  "monte",
  "montes",
  "coração",
  "cabeça",
  "vida",
  "destino",
  "linha",
]);

/**
 * Converte uma string em CAPS pra sentence case, mantendo substantivos
 * próprios (montes/planetas/linhas) capitalizados.
 */
function toSentenceCase(input: string): string {
  const lower = input.toLowerCase();
  let result = "";
  let capitalizeNext = true;
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i]!;
    if (/[a-záàâãéêíóôõúüçñ]/.test(ch)) {
      // palavra inteira
      let word = ch;
      let j = i + 1;
      while (j < lower.length && /[a-záàâãéêíóôõúüçñ]/.test(lower[j]!)) {
        word += lower[j]!;
        j += 1;
      }
      if (capitalizeNext || PROPER_NOUNS.has(word)) {
        result += word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        result += word;
      }
      capitalizeNext = false;
      i = j;
    } else {
      if (ch === ".") capitalizeNext = true;
      result += ch;
      i += 1;
    }
  }
  return result;
}

function parse(item: string): Measurement {
  const colonIdx = item.indexOf(":");
  if (colonIdx === -1) {
    return { icon: "·", label: "", value: toSentenceCase(item.trim()) };
  }
  const head = item.slice(0, colonIdx).trim();
  const rawValue = item.slice(colonIdx + 1).trim();
  const value = toSentenceCase(rawValue);
  const firstSpace = head.indexOf(" ");
  if (firstSpace === -1) {
    return { icon: head, label: "", value };
  }
  return {
    icon: head.slice(0, firstSpace),
    label: head.slice(firstSpace + 1),
    value,
  };
}

// Seeds baseados no index pra barra ter "intensidade" visual coerente
// mas determinística (evita hydration mismatch).
const FILL_SEEDS = [0.82, 0.64, 0.91, 0.55, 0.78, 0.7, 0.86, 0.6];

export default function TechnicalStrip({ items }: Props) {
  const measurements = items.map(parse);

  return (
    <div
      className="relative mt-2"
      style={{
        background: "linear-gradient(180deg, rgba(201,162,74,0.035), rgba(201,162,74,0.015))",
        border: "1px solid rgba(201,162,74,0.16)",
        padding: "22px 20px 20px",
      }}
    >
      {/* Cantinhos ornamentais */}
      <span
        aria-hidden
        className="absolute w-[6px] h-[6px] top-[3px] left-[3px] border-t border-l"
        style={{ borderColor: "rgba(201,162,74,0.45)" }}
      />
      <span
        aria-hidden
        className="absolute w-[6px] h-[6px] top-[3px] right-[3px] border-t border-r"
        style={{ borderColor: "rgba(201,162,74,0.45)" }}
      />
      <span
        aria-hidden
        className="absolute w-[6px] h-[6px] bottom-[3px] left-[3px] border-b border-l"
        style={{ borderColor: "rgba(201,162,74,0.45)" }}
      />
      <span
        aria-hidden
        className="absolute w-[6px] h-[6px] bottom-[3px] right-[3px] border-b border-r"
        style={{ borderColor: "rgba(201,162,74,0.45)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          aria-hidden
          className="h-px flex-1"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.5))",
          }}
        />
        <span
          className="font-jetbrains text-[10px] tracking-[2px] uppercase text-gold whitespace-nowrap"
          style={{ fontWeight: 500 }}
        >
          Medição da palma
        </span>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{
            background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.5))",
          }}
        />
      </div>

      {/* Grid de medições */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {measurements.map((m, i) => {
          const fill = FILL_SEEDS[i % FILL_SEEDS.length]!;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
              className="flex flex-col gap-2"
            >
              {/* Label + ícone */}
              <div className="flex items-baseline gap-2">
                <span className="font-cinzel text-[13px] text-gold leading-none" aria-hidden>
                  {m.icon}
                </span>
                <span
                  className="font-jetbrains text-[9.5px] tracking-[1.5px] uppercase text-gold"
                  style={{ fontWeight: 500 }}
                >
                  {m.label}
                </span>
              </div>

              <MeasurementBar value={fill} delay={i * 0.06} accent="gold" />

              {/* Valor */}
              <p
                className="font-raleway text-[13.5px] sm:text-[14.5px] text-bone leading-[1.5]"
                style={{ fontWeight: 400 }}
              >
                {m.value}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
