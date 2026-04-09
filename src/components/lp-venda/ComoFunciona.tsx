"use client";

import { motion } from "framer-motion";

export default function ComoFunciona() {
  return (
    <section className="relative bg-gradient-to-b from-transparent via-[rgba(23,18,34,0.58)] to-transparent px-6 py-20">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      <div className="mb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-3 font-jetbrains text-[9px] uppercase tracking-[3px] text-gold/70"
        >
          Como funciona
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-cinzel text-[22px] tracking-[0.02em] text-bone"
        >
          Três passos.
          <br />
          Sem firula.
        </motion.h2>
      </div>

      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <motion.li
            key={step.numeral}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: index * 0.14 }}
            className="relative overflow-hidden branded-radius corner-ornaments"
            style={{
              background:
                "linear-gradient(160deg, rgba(23,18,34,0.92) 0%, rgba(17,12,26,0.98) 100%)",
            }}
          >
            <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-gold/60 to-transparent" />
            <div className="m-[4px] flex gap-4 border border-[rgba(201,162,74,0.08)] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(201,162,74,0.22)] bg-[rgba(201,162,74,0.08)]">
                <span className="font-cinzel text-[17px] leading-none text-gold">
                  {step.numeral}
                </span>
              </div>

              <div className="flex-1 pb-1">
                <p className="mb-2 font-cormorant text-[23px] leading-[1.22] text-bone italic">
                  {step.voice}
                </p>
                <p className="font-raleway text-[14px] leading-[1.65] text-bone/85">
                  {step.body}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="mx-auto mt-8 max-w-[330px] text-center font-raleway text-[13px] leading-[1.65] text-bone/78"
      >
        Você não precisa entender de leitura de mão. Só precisa mostrar a mão.
      </motion.p>
    </section>
  );
}

const STEPS = [
  {
    numeral: "I",
    voice: "Você abre a palma.",
    body: "Uma foto da mão inteira. Luz boa. Sem pose. Sem mistério.",
  },
  {
    numeral: "II",
    voice: "Eu cruzo o que ficou escrito.",
    body: "Linha do Coração, Linha de Saturno, Linha do Sol, Linha de Mercúrio, Monte de Vênus. Eu vejo se ele volta, se tem traição, se tem dinheiro preso e quem está no meio do caminho.",
  },
  {
    numeral: "III",
    voice: "Você lê o que doeu.",
    body: "Seu começo é grátis. A leitura completa abre amor, cama, dinheiro, corte, inveja e o que vem logo pela frente.",
  },
];
