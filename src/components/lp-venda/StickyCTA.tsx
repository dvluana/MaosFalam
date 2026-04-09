"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CTA fixo no rodapé.
 * Aparece depois que a usuária scrolla o hero e some ao chegar perto do CTA final.
 */
export default function StickyCTA() {
  const [pastHero, setPastHero] = useState(false);
  const [nearFinal, setNearFinal] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("lp-venda-hero");
    const finalCta = document.getElementById("lp-venda-cta-final");

    if (!hero || !finalCta) {
      return;
    }

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setPastHero(!entry.isIntersecting);
      },
      { threshold: 0.18 }
    );

    const finalObserver = new IntersectionObserver(
      ([entry]) => {
        setNearFinal(entry.isIntersecting);
      },
      { rootMargin: "0px 0px -35% 0px", threshold: 0.05 }
    );

    heroObserver.observe(hero);
    finalObserver.observe(finalCta);

    return () => {
      heroObserver.disconnect();
      finalObserver.disconnect();
    };
  }, []);

  const visible = pastHero && !nearFinal;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="mx-auto max-w-[430px] px-5 pb-5 pointer-events-auto">
            {/* Halo gradiente atrás */}
            <div
              aria-hidden
              className="absolute inset-x-0 -top-8 h-24 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,5,14,0.95) 0%, rgba(8,5,14,0.7) 50%, transparent 100%)",
              }}
            />

            <Link
              href="/ler/toque"
              className="relative block w-full branded-radius corner-ornaments text-bone overflow-hidden"
              aria-label="Começar leitura de mão"
              style={{
                background:
                  "linear-gradient(165deg, #4a1f2d 0%, #6b2b3c 45%, #3a1722 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(232,223,208,0.1), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(201,162,74,0.35), 0 2px 0 rgba(0,0,0,0.4), 0 20px 40px -10px rgba(121,39,55,0.5), 0 0 60px rgba(121,39,55,0.18)",
              }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-cormorant italic text-[15px] text-bone leading-none">
                    Me mostra sua mão
                  </span>
                  <span className="font-jetbrains text-[8px] uppercase tracking-[1.5px] text-gold/80">
                    Começa grátis
                  </span>
                </div>
                <span
                  aria-hidden
                  className="font-cinzel text-[18px] text-gold leading-none"
                >
                  →
                </span>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
