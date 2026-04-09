"use client";

import { motion } from "framer-motion";

export default function Entrega() {
  return (
    <section className="relative px-6 py-20">
      <div className="mb-10 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-3 font-jetbrains text-[9px] uppercase tracking-[3px] text-gold/70"
        >
          Tudo que você vai abrir
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-cinzel text-[24px] leading-[1.2] text-bone"
        >
          Sua leitura completa
          <br />
          <span className="text-[20px] text-gold-light">
            não deixa ponta solta
          </span>
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9 }}
        className="relative overflow-hidden bg-deep/80 branded-radius corner-ornaments"
      >
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="m-[5px] border border-[rgba(201,162,74,0.06)] p-6">
          <ul className="space-y-5">
            {ENTREGA.map((item, index) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex gap-4"
              >
                <span aria-hidden className="relative mt-[6px] h-3 w-3 shrink-0">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-2 w-2 rotate-45 bg-gold" />
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-[3px] w-[3px] rotate-45 bg-black" />
                  </span>
                </span>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-cinzel text-[12px] leading-[1.3] tracking-wide text-gold-light">
                    {item.title}
                  </p>
                  <p className="font-raleway text-[13px] leading-[1.65] text-bone/85">
                    {item.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="my-7 flex items-center justify-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(201,162,74,0.35)]" />
            <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(201,162,74,0.35)]" />
          </div>

          <div className="text-center">
            <p className="mb-2 font-jetbrains text-[8px] uppercase tracking-[2px] text-rose">
              + brinde
            </p>
            <p className="font-cormorant text-[19px] leading-[1.3] text-bone italic">
              O tarô entra junto.
              <br />
              Sem pagar nada. Sem enrolação.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-8 px-4 text-center font-raleway text-[14px] leading-[1.65] text-bone/85"
      >
        Você começa grátis. Se quiser abrir tudo, a leitura completa entra com
        crédito.
      </motion.p>
    </section>
  );
}

const ENTREGA = [
  {
    title: "Linha do Coração",
    body: "Eu mostro quem ainda pesa, quem já foi e quem ainda te puxa de volta.",
  },
  {
    title: "Monte de Vênus",
    body: "Eu revelo onde seu desejo manda mais do que sua cabeça.",
  },
  {
    title: "Linha de Saturno",
    body: "Você vê o caminho que te puxa, mesmo quando você tenta fugir dele.",
  },
  {
    title: "Linha do Sol",
    body: "Eu revelo onde seu dinheiro abre e o preço que ele cobra antes de entrar.",
  },
  {
    title: "Linha de Mercúrio",
    body: "Você enxerga a mentira, o jogo duplo e a conversa mole.",
  },
  {
    title: "Montes centrais",
    body: "Monte de Júpiter, Marte, Lua e o resto da mão entram no peso final da leitura.",
  },
  {
    title: "Cinto de Vênus",
    body: "Eu mostro o excesso que te entrega, o ciúme que te puxa e o fogo que te desmonta.",
  },
  {
    title: "Sinais raros",
    body: "Cruzes, ilhas, estrelas e marca de mão que não aparece em qualquer uma.",
  },
  {
    title: "Seu elemento e sua compatibilidade",
    body: "Você vê com quem combina de verdade e com quem só vai repetir dor.",
  },
  {
    title: "Previsão de 3 meses e carta pra guardar",
    body: "Eu abro o que chega logo e te entrego a leitura num formato que fica salvo com você.",
  },
];
