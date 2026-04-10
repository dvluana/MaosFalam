"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function NumerosQueFalam() {
  return (
    <section className="relative overflow-hidden px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(82,28,36,0.24) 0%, rgba(23,18,34,0.74) 55%, transparent 100%)",
        }}
      />

      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
      />

      <div className="relative">
        <div className="mb-12 text-center">
          <p className="mb-3 font-jetbrains text-[9px] uppercase tracking-[3px] text-gold/70">
            Os números
          </p>
          <h2 className="font-cinzel text-[22px] leading-[1.2] text-bone">
            Depois da prova,
            <br />
            <span className="text-gold-light">agora vem o peso.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        <p className="mt-10 px-2 text-center font-raleway text-[13px] leading-[1.65] text-bone/80">
          Número de gente que entrou desconfiando e saiu em silêncio.
        </p>
      </div>
    </section>
  );
}

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  sub: string;
  accent: string;
  accentLine: string;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    const duration = 1600;
    const start = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.floor(eased * stat.value));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [inView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      className="relative overflow-hidden branded-radius corner-ornaments"
      style={{
        background: "linear-gradient(160deg, rgba(23,18,34,0.95) 0%, rgba(17,12,26,0.98) 100%)",
      }}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-[1.5px] bg-gradient-to-r ${stat.accentLine}`}
      />

      <div className="m-[4px] flex min-h-[140px] flex-col justify-between border border-[rgba(201,162,74,0.08)] p-4">
        <div>
          <p className="mb-2 font-jetbrains text-[8px] uppercase tracking-[1.5px] text-bone-dim">
            {stat.label}
          </p>

          <div className="flex items-baseline gap-0.5">
            {stat.prefix ? (
              <span className={`font-cinzel text-[18px] leading-none ${stat.accent}`}>
                {stat.prefix}
              </span>
            ) : null}

            <span
              className={`font-cinzel text-[30px] leading-none tracking-[-0.01em] ${stat.accent}`}
            >
              {value.toLocaleString("pt-BR")}
            </span>

            {stat.suffix ? (
              <span className={`font-cinzel text-[18px] leading-none ${stat.accent}`}>
                {stat.suffix}
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-3 font-raleway text-[11px] leading-[1.45] text-bone-dim">{stat.sub}</p>
      </div>
    </motion.div>
  );
}

const STATS: Stat[] = [
  {
    value: 12847,
    label: "mãos lidas",
    sub: "gente que já mostrou a palma por aqui",
    accent: "text-gold-light",
    accentLine: "from-gold/70 via-gold-light to-gold/70",
  },
  {
    value: 94,
    label: "disseram que acertou",
    suffix: "%",
    sub: "logo na primeira leitura",
    accent: "text-rose-light",
    accentLine: "from-rose/70 via-rose-light to-rose/70",
  },
  {
    value: 180,
    label: "blocos escritos à mão",
    suffix: "+",
    sub: "pra leitura sair forte. Não genérica.",
    accent: "text-[#c8b8a0]",
    accentLine: "from-[#8b5a38]/60 via-[#c8b8a0] to-[#8b5a38]/60",
  },
  {
    value: 5000,
    label: "anos de tradição",
    sub: "batendo na mão que você vai mostrar",
    accent: "text-bone",
    accentLine: "from-bone/60 via-bone to-bone/60",
  },
];
