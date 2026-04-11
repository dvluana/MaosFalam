"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative px-6 py-20">
      <div className="mb-10 text-center">
        <p className="mb-3 font-jetbrains text-[9px] uppercase tracking-[3px] text-gold/70">
          Antes de você abrir a mão
        </p>
        <h2 className="font-cinzel text-[22px] text-bone">As dúvidas de sempre</h2>
      </div>

      <ul className="space-y-3">
        {ITEMS.map((item, index) => {
          const isOpen = open === index;

          return (
            <li
              key={item.q}
              className="relative overflow-hidden bg-deep/60 branded-radius corner-ornaments"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-cinzel text-[13px] leading-[1.35] tracking-wide text-bone">
                  {item.q}
                </span>

                <span aria-hidden className="relative mt-1 h-4 w-4 shrink-0">
                  <span
                    className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <span className="block h-px w-3 bg-gold" />
                    <span className="absolute block h-3 w-px bg-gold" />
                  </span>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                      <p className="font-raleway text-[13px] leading-[1.7] text-bone/85">
                        {item.a}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const ITEMS = [
  {
    q: "Isso funciona mesmo?",
    a: "Funciona quando você mostra a palma inteira. O que está marcado aparece.",
  },
  {
    q: "Preciso pagar pra começar?",
    a: "Não. Você entra, mostra a mão e começa grátis. Se quiser abrir tudo, aí entra o crédito.",
  },
  {
    q: "Preciso fazer cadastro?",
    a: "Pra começar, não. Você só entra e mostra a mão.",
  },
  {
    q: "Serve foto de qualquer celular?",
    a: "Serve. Luz boa. Palma inteira. Dedos visíveis. Só isso.",
  },
  {
    q: "Posso ler a mão de outra pessoa?",
    a: "Pode. Você só precisa da foto da mão dela.",
  },
];
