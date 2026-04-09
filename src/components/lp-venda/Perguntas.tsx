"use client";

import { motion } from "framer-motion";

export default function Perguntas() {
  return (
    <section className="relative px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(23,18,34,0.3) 22%, rgba(23,18,34,0.52) 50%, rgba(23,18,34,0.3) 78%, transparent 100%)",
        }}
      />

      <div className="mb-12 flex justify-center">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(201,162,74,0.35)]" />
          <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-[rgba(201,162,74,0.35)]" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="relative mb-10 text-center"
      >
        <p className="font-cinzel text-[11px] uppercase tracking-[3px] text-gold/90">
          Você quer saber
        </p>
        <h2 className="mt-4 font-cormorant text-[28px] leading-[1.16] text-bone italic">
          Eu já vi isso
          <br />
          <span className="text-gold-light">na mão de muita mulher.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[340px] font-raleway text-[14px] leading-[1.65] text-bone/82">
          O nome muda. A dor muda de roupa. O resto quase sempre repete.
        </p>
      </motion.div>

      <ul className="relative space-y-4">
        {QUESTIONS.map((question, index) => (
          <motion.li
            key={question.line}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: index * 0.08 }}
            className="relative overflow-hidden branded-radius corner-ornaments"
            style={{
              background:
                "linear-gradient(160deg, rgba(23,18,34,0.94) 0%, rgba(17,12,26,0.98) 100%)",
            }}
          >
            <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-gold/60 to-transparent" />
            <div className="m-[4px] border border-[rgba(201,162,74,0.08)] p-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(201,162,74,0.2)] bg-[rgba(201,162,74,0.06)] px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <p className="font-jetbrains text-[8px] uppercase tracking-[1.8px] text-gold/78">
                  {question.whisper}
                </p>
              </div>

              <p className="font-raleway text-[17px] leading-[1.55] text-bone">
                {question.line}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.35 }}
        className="mt-14 px-2 text-center font-cormorant text-[20px] leading-[1.45] text-bone italic"
      >
        Sua mão já mostrou a cena.
        <br />
        Agora falta você ter coragem de ver.
      </motion.p>
    </section>
  );
}

const QUESTIONS = [
  {
    line: "Seu ex sumiu do celular. Não sumiu da sua Linha do Coração.",
    whisper: "Linha do Coração · Rupturas não cicatrizadas",
  },
  {
    line: "Seu corpo ainda chama uma pessoa que sua boca jurou esquecer.",
    whisper: "Monte de Vênus · Desejo mal escondido",
  },
  {
    line: "Tem outra mulher rondando a história que você chama de volta.",
    whisper: "Linha de Mercúrio · Nome no meio do caminho",
  },
  {
    line: "Seu dinheiro só anda quando você corta uma pessoa que te seca.",
    whisper: "Linha de Saturno · Corte que destrava",
  },
  {
    line: "Tem mentira sentada do seu lado. Você ouviu. Você fingiu que não.",
    whisper: "Linha de Mercúrio · Traição próxima",
  },
  {
    line: "Você repete o mesmo homem com nome, bairro e desculpa trocados.",
    whisper: "Cinto de Vênus · Padrão que se repete",
  },
  {
    line: "A perda não vem de onde você está vigiando.",
    whisper: "Linha do Coração · Ausência anunciada",
  },
];
