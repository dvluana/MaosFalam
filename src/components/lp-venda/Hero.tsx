"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      id="lp-venda-hero"
      className="relative min-h-[94svh] w-full overflow-hidden px-6 pb-12 pt-[72px]"
    >
      <div className="absolute inset-0 bg-black" />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 92% 44% at 50% 8%, rgba(196,100,122,0.14) 0%, rgba(139,90,56,0.08) 34%, transparent 70%)",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-[32%] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8,5,14,0.22) 20%, rgba(8,5,14,0.84) 60%, #08050e 100%)",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {DUST.map((dust, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${dust.x}%`,
              top: `${dust.y}%`,
              width: dust.size,
              height: dust.size,
              background: "rgba(201,162,74,0.56)",
              boxShadow: "0 0 7px rgba(201,162,74,0.35)",
            }}
            animate={{
              opacity: [0.14, 0.65, 0.14],
              y: [0, -5, 0],
            }}
            transition={{
              duration: dust.duration,
              repeat: Infinity,
              delay: dust.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-[94svh] flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="branded-radius corner-ornaments px-4 py-[7px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,162,74,0.12), rgba(121,39,55,0.08))",
              border: "1px solid rgba(201,162,74,0.28)",
              boxShadow: "0 0 24px rgba(201,162,74,0.12)",
            }}
          >
            <p className="max-w-[260px] text-center font-jetbrains text-[8px] uppercase tracking-[1.9px] text-gold">
              A primeira plataforma de leitura de mão do Brasil
            </p>
          </div>
          <p className="font-jetbrains text-[8px] uppercase tracking-[3px] text-bone-dim/80">
            Leitura de mão · feita por gente
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mx-auto mt-6 w-full max-w-[390px]"
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-[32px] blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 26%, rgba(121,39,55,0.28) 0%, rgba(121,39,55,0.08) 44%, transparent 76%)",
            }}
          />

          <div
            className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-[rgba(201,162,74,0.22)] bg-[rgba(8,5,14,0.82)]"
            style={{
              boxShadow:
                "0 24px 70px -28px rgba(0,0,0,0.78), 0 0 0 1px rgba(201,162,74,0.08), inset 0 1px 0 rgba(232,223,208,0.06)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 88% 66% at 50% 26%, rgba(255,255,255,0.02) 0%, transparent 56%), linear-gradient(180deg, rgba(8,5,14,0.08) 0%, rgba(8,5,14,0.18) 100%)",
              }}
            />

            <Image
              src="/IMG_8098.PNG"
              alt=""
              fill
              priority
              quality={100}
              unoptimized
              sizes="(max-width: 430px) 100vw, 390px"
              className="object-cover"
              style={{
                objectPosition: "50% 18%",
                transform: "scale(0.9)",
              }}
            />

            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-28"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(8,5,14,0.28) 30%, rgba(8,5,14,0.72) 100%)",
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35 }}
          className="relative mt-8 text-center"
        >
          <div className="relative">
            <p className="mb-3 font-jetbrains text-[8px] uppercase tracking-[3px] text-gold/78">
              Eu cruzo os sinais e já vejo
            </p>

            <h1 className="font-cormorant text-[40px] leading-[0.98] tracking-[-0.01em] text-bone italic">
              Seu ex.
              <br />
              Seu futuro.
              <br />
              <span className="text-gold-light">E o que estão</span>
              <br />
              <span className="text-gold-light">escondendo de você.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-[348px] px-2 font-raleway text-[15px] leading-[1.7] text-bone/92">
              Na sua mão eu vejo se ele volta, quem te enrola, onde seu
              dinheiro trava e a mentira que ainda vai cair no seu colo.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <Link
            href="/ler/toque"
            className="flex w-full justify-center"
            aria-label="Começar sua leitura de mão"
          >
            <Button size="lg" className="w-full max-w-[320px]">
              Me mostre sua mão
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold/70" />
            <p className="font-jetbrains text-[9px] uppercase tracking-[2px] text-bone-dim">
              Grátis pra começar
            </p>
            <span className="h-1 w-1 rounded-full bg-gold/70" />
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex -space-x-2">
              {AVATARS.map((avatar, index) => (
                <span
                  key={index}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/60"
                  style={{ background: avatar.background }}
                >
                  <span className="font-cinzel text-[9px] leading-none text-bone">
                    {avatar.letter}
                  </span>
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-[2px]">
              <div className="flex items-center gap-[2px]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    viewBox="0 0 24 24"
                    className="h-[9px] w-[9px] fill-gold"
                  >
                    <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" />
                  </svg>
                ))}
              </div>
              <p className="font-jetbrains text-[8px] uppercase leading-none tracking-[1.5px] text-bone-dim/90">
                12.847 mãos lidas
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <motion.span
          className="block h-9 w-px origin-top"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(201,162,74,0.55), transparent)",
          }}
          animate={{
            scaleY: [0, 1, 1, 0],
            transformOrigin: ["top", "top", "bottom", "bottom"],
          }}
          transition={{
            duration: 2.2,
            times: [0, 0.45, 0.55, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="font-jetbrains text-[7px] uppercase tracking-[4px] text-gold/40">
          desce
        </span>
      </motion.div>
    </section>
  );
}

const AVATARS = [
  { letter: "M", background: "linear-gradient(135deg, #4c2032, #1d1324)" },
  { letter: "J", background: "linear-gradient(135deg, #5d3823, #1d1324)" },
  { letter: "C", background: "linear-gradient(135deg, #7a6832, #1d1324)" },
  { letter: "R", background: "linear-gradient(135deg, #643147, #1d1324)" },
];

const DUST = [
  { x: 16, y: 19, size: 2, duration: 6.8, delay: 0.1 },
  { x: 74, y: 15, size: 3, duration: 7.4, delay: 0.4 },
  { x: 81, y: 28, size: 2, duration: 6.2, delay: 1.1 },
  { x: 23, y: 36, size: 2, duration: 7.8, delay: 0.7 },
  { x: 62, y: 42, size: 3, duration: 5.9, delay: 1.4 },
  { x: 14, y: 57, size: 2, duration: 7.1, delay: 1.8 },
  { x: 77, y: 61, size: 2, duration: 6.5, delay: 0.9 },
  { x: 39, y: 68, size: 3, duration: 8.1, delay: 0.3 },
];
