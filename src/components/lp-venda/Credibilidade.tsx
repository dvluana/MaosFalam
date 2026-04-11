"use client";

import { motion } from "framer-motion";

export default function Credibilidade() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(23,18,34,0.58) 16%, rgba(23,18,34,0.72) 50%, rgba(23,18,34,0.58) 84%, transparent 100%)",
        }}
      />

      <div
        aria-hidden
        className="absolute left-0 right-0 top-[14%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"
      />
      <div
        aria-hidden
        className="absolute bottom-[14%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"
      />

      <div className="relative">
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-4 font-jetbrains text-[9px] uppercase tracking-[3px] text-gold/70"
          >
            Antes que você pergunte
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-cinzel text-[24px] leading-[1.2] text-bone"
          >
            Não é chute.
            <br />
            <span className="text-gold-light">Nem joguinho.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-5 max-w-[360px] px-2 font-raleway text-[14px] leading-[1.65] text-bone/85"
          >
            Eu olho linha, monte, marca e detalhe da sua palma. Eu cruzo tudo antes de falar. Você
            entra numa leitura de mão séria. Sem frase pronta pra te enrolar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {SEALS.map((seal) => (
              <span
                key={seal}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,162,74,0.18)] bg-[rgba(201,162,74,0.06)] px-3 py-1.5 font-jetbrains text-[8px] uppercase tracking-[1.5px] text-gold/78"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {seal}
              </span>
            ))}
          </motion.div>
        </div>

        <ul className="space-y-5">
          {PILLARS.map((pillar, index) => (
            <motion.li
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: index * 0.12 }}
              className="relative overflow-hidden branded-radius corner-ornaments"
              style={{
                background:
                  "linear-gradient(155deg, rgba(23,18,34,0.9) 0%, rgba(17,12,26,0.95) 100%)",
              }}
            >
              <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-gold/60 to-transparent" />

              <div className="m-[5px] border border-[rgba(201,162,74,0.08)] p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center border border-[rgba(201,162,74,0.25)] branded-radius"
                    style={{
                      background: "linear-gradient(145deg, rgba(201,162,74,0.08), transparent)",
                    }}
                  >
                    <span className="font-cinzel text-[16px] leading-none text-gold">
                      {pillar.numeral}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 font-jetbrains text-[9px] uppercase tracking-[2px] text-gold/70">
                      {pillar.stat}
                    </p>
                    <p className="mb-3 font-cinzel text-[14px] leading-[1.3] tracking-wide text-bone">
                      {pillar.title}
                    </p>
                    <p className="font-raleway text-[13px] leading-[1.6] text-bone-dim">
                      {pillar.body}
                    </p>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/40" />
            <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/40" />
          </div>

          <p className="px-4 font-cormorant text-[22px] leading-[1.35] text-bone italic">
            Eu leio.
            <br />
            <span className="text-gold-light">Eu não invento.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    numeral: "I",
    stat: "5.000 anos de leitura de mão",
    title: "Leitura de mão de verdade",
    body: "Monte de Júpiter. Linha do Coração. Linha de Saturno. Linha do Sol. Linha de Mercúrio. Eu falo o nome certo do que está na sua mão.",
  },
  {
    numeral: "II",
    stat: "180+ blocos escritos à mão",
    title: "Feita por gente",
    body: "Cada trecho foi escrito por gente que já leu muita mão. Não sai texto bobo. Sai amor virado, desejo preso, dinheiro travado e verdade na cara.",
  },
  {
    numeral: "III",
    stat: "Linhas, montes e marcas cruzados",
    title: "Eu cruzo os sinais da sua mão",
    body: "Eu junto linha, monte, marca e detalhe da sua palma antes de te falar qualquer coisa. O que se repete pesa. O resto fica de fora.",
  },
];

const SEALS = ["Leitura de mão", "Olho humano", "Começo grátis"];
