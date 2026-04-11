"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

function personalize(phrase: string, name: string | null): string {
  if (!name) return phrase;
  if (phrase.toLowerCase().includes(name.toLowerCase())) return phrase;
  return `${name}. ${phrase}`;
}

export default function RevelacaoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [phrase, setPhrase] = useState(
    "Você carrega mais do que mostra. E isso te protege e te prende.",
  );
  const [typed, setTyped] = useState("");
  const [complete, setComplete] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const name = sessionStorage.getItem("maosfalam_name");
      const stored = sessionStorage.getItem("maosfalam_impact_phrase");
      const raw = stored ?? "Você carrega mais do que mostra. E isso te protege e te prende.";
      setPhrase(personalize(raw, name));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Atraso pra iniciar a digitação só depois da carta virar
  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!flipped) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(interval);
        setComplete(true);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [flipped, phrase]);

  useEffect(() => {
    if (!complete) return;
    const t = setTimeout(() => setShowButton(true), 1400);
    return () => clearTimeout(t);
  }, [complete]);

  const onContinue = () => {
    setFadingOut(true);
    const readingId = sessionStorage.getItem("maosfalam_reading_id") ?? "demo";
    const hasCredits = user
      ? (user as { credits?: number }).credits !== undefined &&
        ((user as { credits?: number }).credits ?? 0) > 0
      : false;
    const destination =
      user && hasCredits ? `/ler/resultado/${readingId}/completo` : `/ler/resultado/${readingId}`;
    setTimeout(() => router.push(destination), 500);
  };

  return (
    <motion.main
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-16 gap-10 overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Atmosfera — radial gold pulsante atrás do card */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: flipped ? [0.4, 1, 0.6, 0.9, 0.5] : 0.3,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(201,162,74,0.12), transparent 70%)",
        }}
      />

      {/* Partículas de luz flutuando ao redor */}
      {flipped &&
        [0.12, 0.28, 0.44, 0.62, 0.78, 0.9].map((x, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              left: `${x * 100}%`,
              top: "75%",
              width: 2,
              height: 2,
              background: "#ffe79a",
              borderRadius: "50%",
              boxShadow: "0 0 8px rgba(255,231,154,0.8)",
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [-20, -260],
              opacity: [0, 1, 1, 0],
              x: [0, i % 2 === 0 ? 12 : -12, 0],
            }}
            transition={{
              duration: 6 + (i % 3),
              delay: i * 0.7,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex items-center gap-3"
      >
        <span
          className="h-px w-10"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
        <span
          className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
          style={{ fontWeight: 500 }}
        >
          A primeira verdade
        </span>
        <span
          className="h-px w-10"
          style={{
            background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
      </motion.div>

      {/* === CARTA DE TAROT === */}
      <motion.div
        initial={{ rotateY: -180, opacity: 0, scale: 0.85 }}
        animate={{
          rotateY: flipped ? 0 : -180,
          opacity: flipped ? 1 : 0,
          scale: flipped ? 1 : 0.85,
        }}
        transition={{
          duration: 1.3,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="relative"
        style={{
          width: "min(340px, 88vw)",
          transformStyle: "preserve-3d",
        }}
      >
        <article
          className="card-noise relative overflow-hidden"
          style={{
            aspectRatio: "5 / 7",
            background: "linear-gradient(165deg, #0e0a18 0%, #110c1a 50%, #08050e 100%)",
            border: "1px solid rgba(201,162,74,0.55)",
            boxShadow:
              "0 40px 80px -20px rgba(0,0,0,0.95), 0 0 80px -8px rgba(201,162,74,0.35), 0 0 1px rgba(201,162,74,0.6), inset 0 0 60px rgba(201,162,74,0.05)",
          }}
        >
          {/* Radial glow central atrás do texto */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(201,162,74,0.14), transparent 75%)",
            }}
          />

          {/* Moldura interna ornamental dupla */}
          <div
            aria-hidden
            className="absolute inset-3 pointer-events-none"
            style={{
              border: "1px solid rgba(201,162,74,0.22)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-[14px] pointer-events-none"
            style={{
              border: "1px solid rgba(201,162,74,0.08)",
            }}
          />

          {/* 4 corner accents maiores pra vibe de carta */}
          {(
            [
              ["top", "left"],
              ["top", "right"],
              ["bottom", "left"],
              ["bottom", "right"],
            ] as const
          ).map(([v, h]) => (
            <span
              key={`${v}-${h}`}
              aria-hidden
              className="absolute"
              style={{
                [v]: 4,
                [h]: 4,
                width: 18,
                height: 18,
                borderStyle: "solid",
                borderColor: "rgba(201,162,74,0.75)",
                borderWidth: `${v === "top" ? "2px" : "0"} ${h === "right" ? "2px" : "0"} ${v === "bottom" ? "2px" : "0"} ${h === "left" ? "2px" : "0"}`,
                boxShadow: "0 0 8px rgba(201,162,74,0.4)",
              }}
            />
          ))}

          {/* Deco topo: linha + losango + linha */}
          <div
            aria-hidden
            className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <span
              className="h-px w-10"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.7))",
              }}
            />
            <span
              className="w-2 h-2 rotate-45 bg-gold"
              style={{ boxShadow: "0 0 10px rgba(201,162,74,0.8)" }}
            />
            <span
              className="h-px w-10"
              style={{
                background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.7))",
              }}
            />
          </div>

          {/* Deco rodapé: mesmo padrão espelhado */}
          <div
            aria-hidden
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <span
              className="h-px w-10"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.7))",
              }}
            />
            <span
              className="w-2 h-2 rotate-45 bg-gold"
              style={{ boxShadow: "0 0 10px rgba(201,162,74,0.8)" }}
            />
            <span
              className="h-px w-10"
              style={{
                background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.7))",
              }}
            />
          </div>

          {/* Roman numeral no topo (tarot classic) */}
          <div
            aria-hidden
            className="absolute top-14 left-1/2 -translate-x-1/2 font-cinzel text-[11px] tracking-[3px] uppercase text-gold-dim"
            style={{ fontWeight: 500 }}
          >
            I · A Verdade
          </div>

          {/* Conteúdo central: a frase de impacto */}
          <div className="absolute inset-0 flex items-center justify-center px-8 py-24">
            <p
              className="font-cormorant italic text-center text-bone leading-[1.35]"
              style={{
                fontSize: "clamp(21px, 5.5vw, 28px)",
                textShadow: "0 0 24px rgba(201,162,74,0.35), 0 0 50px rgba(201,162,74,0.15)",
              }}
            >
              {typed}
              {flipped && !complete && <span className="opacity-70 text-gold ml-0.5">|</span>}
            </p>
          </div>

          {/* Shine sweep (passa uma vez após a carta virar) */}
          {flipped && (
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "100%", opacity: [0, 0.6, 0] }}
              transition={{
                duration: 1.8,
                delay: 0.4,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "linear-gradient(110deg, transparent 40%, rgba(255,231,154,0.25) 48%, rgba(255,255,255,0.4) 50%, rgba(255,231,154,0.25) 52%, transparent 60%)",
              }}
            />
          )}

          {/* Borda brilhante pulsante após completar */}
          {complete && (
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              animate={{
                boxShadow: [
                  "inset 0 0 40px rgba(201,162,74,0.1)",
                  "inset 0 0 60px rgba(201,162,74,0.25)",
                  "inset 0 0 40px rgba(201,162,74,0.1)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </article>

        {/* Sombra projetada no chão */}
        <div
          aria-hidden
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "70%",
            height: 20,
            background:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(201,162,74,0.18), transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </motion.div>

      {/* Botão continuar — FORA do card */}
      <div className="relative h-12 flex items-center">
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button variant="primary" onClick={onContinue}>
                Continuar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
