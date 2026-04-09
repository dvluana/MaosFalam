"use client";

import { motion } from "framer-motion";

export default function Depoimentos() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-[rgba(82,28,36,0.18)] to-transparent py-20">
      <div className="mb-8 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-3 font-jetbrains text-[9px] uppercase tracking-[3px] text-rose/80"
        >
          Elas já viram
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-cormorant text-[28px] leading-[1.18] text-bone italic"
        >
          O que elas disseram
          <br />
          <span className="text-gold-light">depois de mostrar a mão</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 inline-flex items-center gap-3"
        >
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg
                key={index}
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 fill-gold"
              >
                <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" />
              </svg>
            ))}
          </div>
          <span className="font-jetbrains text-[9px] uppercase tracking-[1.8px] text-bone-dim">
            4,9 · 2.341 avaliações
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mx-auto mt-4 max-w-[332px] font-raleway text-[13px] leading-[1.65] text-bone/78"
        >
          Quem entra achando que é brincadeira costuma sair em silêncio.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="relative"
      >
        <div
          className="overflow-x-auto snap-x snap-mandatory pb-5"
          style={{ scrollbarWidth: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="flex gap-4 px-6">
            {QUOTES.map((quote, index) => (
              <blockquote
                key={quote.author}
                className="relative w-[82%] max-w-[320px] shrink-0 snap-center overflow-hidden branded-radius corner-ornaments"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(23,18,34,0.95) 0%, rgba(17,12,26,0.98) 100%)",
                }}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-[2px] ${ACCENTS[index % ACCENTS.length]}`}
                />

                <div className="m-[5px] flex min-h-[212px] flex-col border border-[rgba(201,162,74,0.06)] p-5">
                  <span
                    aria-hidden
                    className="-mb-5 -ml-1 block font-cinzel text-[52px] leading-none text-gold/15"
                  >
                    &ldquo;
                  </span>

                  <p className="flex-1 pl-1 font-raleway text-[14px] leading-[1.65] text-bone/90">
                    {quote.text}
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(201,162,74,0.25)]"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(201,162,74,0.15), rgba(121,39,55,0.12))",
                      }}
                    >
                      <span className="font-cinzel text-[11px] text-gold-light">
                        {quote.author[0]}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-cinzel text-[11px] leading-tight text-bone">
                        {quote.author}
                      </p>
                      <p className="font-jetbrains text-[8px] uppercase tracking-[1.5px] text-bone-dim">
                        {quote.city} · {quote.age} anos
                      </p>
                    </div>
                  </div>
                </div>
              </blockquote>
            ))}

            <div aria-hidden className="w-2 shrink-0" />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="h-px w-5 bg-gold/40" />
          <span className="font-jetbrains text-[8px] uppercase tracking-[2px] text-bone-dim/60">
            arrasta pra ver mais
          </span>
          <span className="h-px w-5 bg-gold/40" />
        </div>
      </motion.div>
    </section>
  );
}

const ACCENTS = [
  "bg-gradient-to-b from-transparent via-rose to-transparent",
  "bg-gradient-to-b from-transparent via-gold to-transparent",
  "bg-gradient-to-b from-transparent via-[#8b5a38] to-transparent",
];

const QUOTES = [
  {
    text: "Eu entrei de bobeira. Ela falou do homem que eu tento largar e sempre volto. Na hora meu peito gelou.",
    author: "Marina",
    city: "São Paulo",
    age: 27,
  },
  {
    text: "Ela bateu no meu trabalho e no meu dinheiro sem dó. Pouco tempo depois aconteceu o corte que estava escrito.",
    author: "Juliana",
    city: "Recife",
    age: 31,
  },
  {
    text: "Ela falou de cama e desejo do jeito que eu sentia e nunca tive coragem de dizer pra ninguém.",
    author: "Rafaela",
    city: "Belo Horizonte",
    age: 24,
  },
  {
    text: "Ela falou de traição perto de mim. Eu não quis acreditar. Depois veio a prova e eu voltei correndo pra ler de novo.",
    author: "Camila",
    city: "Salvador",
    age: 29,
  },
  {
    text: "Eu fiz a minha e depois fiz a dele. A compatibilidade mostrou certinho por que eu sofria naquela relação.",
    author: "Beatriz",
    city: "Curitiba",
    age: 33,
  },
  {
    text: "Ela acertou uma escolha que eu ia fazer naquele dia. Não foi fofo. Foi reto. E era verdade.",
    author: "Letícia",
    city: "Fortaleza",
    age: 26,
  },
];
