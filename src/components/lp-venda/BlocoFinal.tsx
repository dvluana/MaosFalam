"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import Button from "@/components/ui/Button";

export default function BlocoFinal() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(139,90,56,0.12) 0%, transparent 60%), radial-gradient(ellipse 70% 40% at 50% 30%, rgba(121,39,55,0.12) 0%, transparent 55%)",
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 260px at 50% 50%, rgba(201,162,74,0.1) 0%, rgba(121,39,55,0.08) 42%, transparent 72%)",
        }}
        animate={{
          opacity: [0.55, 0.92, 0.55],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative mb-10 flex justify-center">
        <div className="flex items-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden branded-radius corner-ornaments"
        style={{
          background: "linear-gradient(160deg, rgba(23,18,34,0.9) 0%, rgba(17,12,26,0.98) 100%)",
        }}
      >
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
        <div className="m-[5px] border border-[rgba(201,162,74,0.08)] px-6 py-10 text-center">
          <p className="font-jetbrains text-[8px] uppercase tracking-[2px] text-gold/78">
            Último aviso
          </p>

          <p className="mt-4 font-cormorant text-[30px] leading-[1.18] text-bone italic">
            A pessoa que voltou
            <br />
            a bagunçar sua cabeça
            <br />
            <span className="text-gold-light">não voltou sozinha.</span>
          </p>

          <p className="mx-auto mt-6 max-w-[340px] font-raleway text-[15px] leading-[1.68] text-bone/88">
            Veio puxando desejo, ciúme, medo e confusão. Se você abrir a mão agora, você vê o resto
            antes que estoure na sua cara.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="relative mt-10 flex flex-col items-center gap-3"
          >
            <Link
              href="/ler/toque"
              className="flex w-full justify-center"
              aria-label="Abrir a leitura de mão"
            >
              <Button size="lg" className="w-full max-w-[320px]">
                Ler minha mão agora
              </Button>
            </Link>
            <p className="font-jetbrains text-[9px] uppercase tracking-[2px] text-bone-dim">
              Dura menos que uma música
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
