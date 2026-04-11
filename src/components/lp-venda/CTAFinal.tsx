"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import Button from "@/components/ui/Button";

/**
 * Rodapé da LP: uma última frase de puxão + CTA + microcopy.
 */
export default function CTAFinal() {
  return (
    <section id="lp-venda-cta-final" className="relative px-6 pt-8 pb-28">
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
          <span aria-hidden className="w-1 h-1 bg-gold rotate-45" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="font-cormorant italic text-[24px] leading-[1.3] text-bone text-center mb-3"
      >
        Suas mãos já sabem.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.15 }}
        className="font-cormorant italic text-[24px] leading-[1.3] text-gold-light text-center mb-10"
      >
        Você ainda não.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.3 }}
        className="flex flex-col items-center gap-3"
      >
        <Link href="/ler/toque" className="w-full flex justify-center">
          <Button size="lg" className="w-full max-w-[320px]">
            Me mostre sua mão
          </Button>
        </Link>
        <p className="font-jetbrains text-[9px] uppercase tracking-[2px] text-bone-dim">
          Grátis pra começar · você vê rápido
        </p>
      </motion.div>

      {/* Assinatura sutil */}
      <div className="mt-16 flex flex-col items-center gap-2">
        <div
          aria-hidden
          className="w-10 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
        <p className="font-logo text-[12px] text-gold/70 tracking-[0.2em]">MãosFalam</p>
        <p className="font-jetbrains text-[8px] uppercase tracking-[2px] text-bone-dim/60">
          Leitura de mão · Brasil
        </p>
      </div>
    </section>
  );
}
