"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import BuyCreditsModal from "@/components/account/BuyCreditsModal";
import ElementGlyph from "@/components/reading/ElementGlyph";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { getCredits } from "@/lib/payment-client";
import { getUserProfile, getUserReadings } from "@/lib/user-client";
import type { Reading as BaseReading, HandElement, ReportJSON, Tier } from "@/types/report";

type Reading = BaseReading & { target_name?: string };

type State = "has_readings" | "empty" | "loading";

type View = "cards" | "list";

const ELEMENT_LABEL: Record<HandElement, string> = {
  fire: "Fogo",
  water: "Água",
  earth: "Terra",
  air: "Ar",
};

const ELEMENT_GLOW: Record<HandElement, string> = {
  fire: "rgba(239,130,40,0.25)",
  water: "rgba(139,123,191,0.25)",
  earth: "rgba(201,155,106,0.2)",
  air: "rgba(232,223,208,0.2)",
};

function Skeletons() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="card-noise relative"
          style={{
            aspectRatio: "5 / 7",
            background: "#0e0a18",
            border: "1px solid rgba(201,162,74,0.15)",
          }}
        >
          <div className="absolute inset-3 border border-[rgba(201,162,74,0.08)] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

function getVariant(
  reading: Reading,
  currentUserName: string,
): "active_free" | "active_premium" | "for_other" {
  if (reading.target_name && reading.target_name !== currentUserName) return "for_other";
  if (reading.tier === "premium") return "active_premium";
  return "active_free";
}

const BADGE_META: Record<ReturnType<typeof getVariant>, { label: string; color: string }> = {
  active_free: { label: "Free", color: "rgba(201,162,74,0.8)" },
  active_premium: { label: "Completa", color: "rgba(139,123,191,0.8)" },
  for_other: { label: "Pra outra pessoa", color: "rgba(201,162,74,0.8)" },
};

/**
 * Card tipo tarot da leitura — thumbnail grid com glyph + nome + impact
 * resumido. Click → navega pra leitura.
 */
function TarotReadingCard({
  reading,
  currentUserName,
  index,
}: {
  reading: Reading;
  currentUserName: string;
  index: number;
}) {
  const variant = getVariant(reading, currentUserName);
  const badge = BADGE_META[variant];
  const element = reading.report.element.key;

  return (
    <Link href={`/conta/leituras/${reading.id}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 16, rotate: index % 2 === 0 ? -1 : 1 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        whileHover={{ y: -4, rotate: 0 }}
        transition={{ delay: index * 0.06, duration: 0.6 }}
        className="card-noise relative overflow-hidden group cursor-pointer"
        style={{
          aspectRatio: "5 / 7",
          background: "linear-gradient(165deg, #0e0a18 0%, #110c1a 55%, #08050e 100%)",
          border: "1px solid rgba(201,162,74,0.25)",
          boxShadow: `0 20px 40px -16px rgba(0,0,0,0.9), 0 0 30px -8px ${ELEMENT_GLOW[element]}`,
        }}
      >
        {/* Radial glow na cor do elemento */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${ELEMENT_GLOW[element]}, transparent 75%)`,
          }}
        />

        {/* Moldura interna dupla */}
        <div
          aria-hidden
          className="absolute inset-2 pointer-events-none"
          style={{ border: "1px solid rgba(201,162,74,0.18)" }}
        />

        {/* Corner accents */}
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
              [v]: 3,
              [h]: 3,
              width: 10,
              height: 10,
              borderStyle: "solid",
              borderColor: "rgba(201,162,74,0.6)",
              borderWidth: `${v === "top" ? "1.5px" : "0"} ${h === "right" ? "1.5px" : "0"} ${v === "bottom" ? "1.5px" : "0"} ${h === "left" ? "1.5px" : "0"}`,
            }}
          />
        ))}

        {/* Conteúdo */}
        <div className="relative h-full flex flex-col items-center justify-between px-3 py-5 sm:py-6 text-center">
          {/* Data + deco topo */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-px w-3 bg-gold-dim/40" />
              <span
                className="w-1 h-1 rotate-45 bg-gold"
                style={{ boxShadow: "0 0 4px rgba(201,162,74,0.6)" }}
              />
              <span className="h-px w-3 bg-gold-dim/40" />
            </div>
            <span
              className="font-jetbrains text-[8px] tracking-[1.5px] uppercase text-gold-dim"
              style={{ fontWeight: 500 }}
            >
              {formatDate(reading.created_at)}
            </span>
          </div>

          {/* Glyph central */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="transition-transform duration-500 group-hover:scale-105">
              <ElementGlyph type={element} size={64} />
            </div>
          </div>

          {/* Nome + elemento */}
          <div className="flex flex-col items-center gap-1 w-full">
            <h3
              className="font-cinzel text-[13px] sm:text-[14px] font-medium tracking-[0.04em] text-bone leading-none line-clamp-1 max-w-full"
              title={reading.target_name ?? "Leitura"}
            >
              {reading.target_name ?? "Leitura"}
            </h3>
            <span className="font-cormorant italic text-[12px] text-bone-dim">
              {ELEMENT_LABEL[element]}
            </span>
          </div>

          {/* Badge */}
          <div className="mt-2">
            <span
              className="font-jetbrains text-[7px] tracking-[1.5px] uppercase px-2 py-1"
              style={{
                color: badge.color,
                background: "rgba(14,10,24,0.7)",
                border: `1px solid ${badge.color}`,
                borderRadius: "0 3px 0 3px",
                fontWeight: 500,
              }}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

/**
 * Item compacto da view em lista — uma linha por leitura.
 */
function ListReadingItem({
  reading,
  currentUserName,
  index,
}: {
  reading: Reading;
  currentUserName: string;
  index: number;
}) {
  const variant = getVariant(reading, currentUserName);
  const badge = BADGE_META[variant];
  const element = reading.report.element.key;

  return (
    <Link href={`/conta/leituras/${reading.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: index * 0.05, duration: 0.5 }}
        whileHover={{ x: 2 }}
        className="card-noise relative overflow-hidden flex items-center gap-4 px-4 py-4 sm:px-5 cursor-pointer group"
        style={{
          background: "#0e0a18",
          border: "1px solid rgba(201,162,74,0.15)",
          boxShadow: "0 10px 24px -12px rgba(0,0,0,0.8)",
        }}
      >
        <span
          aria-hidden
          className="absolute w-[8px] h-[8px] top-1.5 left-1.5 border-t border-l"
          style={{ borderColor: "rgba(201,162,74,0.4)" }}
        />
        <span
          aria-hidden
          className="absolute w-[8px] h-[8px] bottom-1.5 right-1.5 border-b border-r"
          style={{ borderColor: "rgba(201,162,74,0.4)" }}
        />

        <div className="shrink-0">
          <ElementGlyph type={element} size={48} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-cinzel text-[15px] sm:text-[16px] font-medium tracking-[0.04em] text-bone leading-none truncate">
              {reading.target_name ?? "Leitura"}
            </h3>
            <span className="font-cormorant italic text-[13px] text-bone-dim">
              · {ELEMENT_LABEL[element]}
            </span>
          </div>
          <p className="font-cormorant italic text-[13px] sm:text-[14px] text-bone-dim leading-[1.35] line-clamp-1">
            {reading.report.impact_phrase}
          </p>
          <span className="font-jetbrains text-[8px] tracking-[1.5px] uppercase text-gold-dim mt-0.5">
            {formatDate(reading.created_at)}
          </span>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span
            className="font-jetbrains text-[8px] tracking-[1.5px] uppercase px-2 py-1 whitespace-nowrap"
            style={{
              color: badge.color,
              border: `1px solid ${badge.color}`,
              borderRadius: "0 3px 0 3px",
              fontWeight: 500,
            }}
          >
            {badge.label}
          </span>
          <span className="text-gold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
            ›
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

/**
 * Bloco de saldo de créditos no topo da página.
 */
function CreditsBanner({ credits, onBuyMore }: { credits: number; onBuyMore: () => void }) {
  const lowCredits = credits <= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card-noise relative overflow-hidden mb-8 px-5 py-5 sm:px-6 sm:py-6"
      style={{
        background: "#0e0a18",
        border: "1px solid rgba(201,162,74,0.22)",
        boxShadow: "0 20px 40px -16px rgba(0,0,0,0.85), 0 0 32px -12px rgba(201,162,74,0.18)",
      }}
    >
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
        style={{ borderColor: "rgba(201,162,74,0.55)" }}
      />
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
        style={{ borderColor: "rgba(201,162,74,0.55)" }}
      />

      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col">
          <span
            className="font-jetbrains text-[9px] tracking-[1.8px] uppercase text-gold-dim mb-1"
            style={{ fontWeight: 500 }}
          >
            Seus créditos
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="font-cinzel text-[38px] sm:text-[44px] text-gold leading-none"
              style={{
                textShadow: "0 0 24px rgba(201,162,74,0.45), 0 0 48px rgba(201,162,74,0.2)",
              }}
            >
              {credits}
            </span>
            <span className="font-cormorant italic text-[16px] text-bone-dim">
              {credits === 1 ? "leitura" : "leituras"}
            </span>
          </div>
          {lowCredits && credits > 0 && (
            <span className="font-cormorant italic text-[12px] text-bone-dim mt-1">
              Sobrou pouco. Usa com sabedoria.
            </span>
          )}
        </div>

        <Button variant="secondary" size="sm" onClick={onBuyMore}>
          Comprar mais
        </Button>
      </div>
    </motion.div>
  );
}

function LeiturasContent() {
  const router = useRouter();
  const [userData, setUserData] = useState<{ name: string; credits: number } | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([getUserProfile(), getUserReadings(), getCredits()])
      .then(([profile, data, creditsData]) => {
        setUserData({ name: profile.name, credits: creditsData.balance });
        const mapped: Reading[] = data.readings.map((r) => ({
          id: r.id,
          tier: r.tier as Tier,
          report: r.report as ReportJSON,
          created_at: r.created_at,
          target_name: r.target_name,
        }));
        setReadings(mapped);
        setLoading(false);
      })
      .catch(() => {
        showToast({
          variant: "rose",
          message: "Nao consegui trazer suas leituras. Tenta de novo.",
        });
        setLoading(false);
      });
  }, [showToast]);

  const currentState: State = useMemo(() => {
    if (loading) return "loading";
    if (!readings.length) return "empty";
    return "has_readings";
  }, [loading, readings]);

  return (
    <div className="max-w-xl mx-auto px-5 pt-4 pb-16">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="h-px w-8"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.5))",
            }}
          />
          <span
            className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
            style={{ fontWeight: 500 }}
          >
            Suas leituras
          </span>
          <span className="h-px flex-1 bg-gold-dim/20" />
        </div>
        <h1 className="font-cinzel text-[26px] sm:text-[32px] text-bone leading-tight">
          O que as suas mãos já disseram.
        </h1>
      </header>

      {/* Credits banner (só quando tem data) */}
      {userData && currentState !== "loading" && (
        <CreditsBanner credits={userData.credits} onBuyMore={() => setBuyModalOpen(true)} />
      )}

      <BuyCreditsModal open={buyModalOpen} onClose={() => setBuyModalOpen(false)} />

      {/* CTA nova leitura — posicionado logo após o banner de créditos
          pra ficar acessível sem precisar rolar até o fim da lista */}
      {currentState === "has_readings" && (
        <div className="flex justify-center mb-8">
          <Button variant="primary" size="lg" onClick={() => router.push("/ler/nome")}>
            Fazer nova leitura
          </Button>
        </div>
      )}

      {/* Toggle de view + contador */}
      {currentState === "has_readings" && userData && (
        <div className="flex items-center justify-between mb-5">
          <span
            className="font-jetbrains text-[9px] tracking-[1.8px] uppercase text-gold-dim"
            style={{ fontWeight: 500 }}
          >
            {readings.length} {readings.length === 1 ? "leitura" : "leituras"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setView("cards")}
              aria-label="Ver como cartas"
              className="px-3 py-2 transition-all focus:outline-none"
              style={{
                background: view === "cards" ? "rgba(201,162,74,0.12)" : "transparent",
                border:
                  view === "cards"
                    ? "1px solid rgba(201,162,74,0.45)"
                    : "1px solid rgba(201,162,74,0.12)",
              }}
            >
              <span
                className="font-jetbrains text-[9px] tracking-[1.5px] uppercase"
                style={{
                  color: view === "cards" ? "#c9a24a" : "#9b9284",
                  fontWeight: 500,
                }}
              >
                Cartas
              </span>
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="Ver como lista"
              className="px-3 py-2 transition-all focus:outline-none"
              style={{
                background: view === "list" ? "rgba(201,162,74,0.12)" : "transparent",
                border:
                  view === "list"
                    ? "1px solid rgba(201,162,74,0.45)"
                    : "1px solid rgba(201,162,74,0.12)",
              }}
            >
              <span
                className="font-jetbrains text-[9px] tracking-[1.5px] uppercase"
                style={{
                  color: view === "list" ? "#c9a24a" : "#9b9284",
                  fontWeight: 500,
                }}
              >
                Lista
              </span>
            </button>
          </div>
        </div>
      )}

      {currentState === "loading" && <Skeletons />}

      {currentState === "empty" && (
        <div className="flex flex-col items-center gap-6 py-14 text-center">
          <p className="font-cormorant italic text-[22px] sm:text-[26px] text-bone-dim leading-[1.35] max-w-sm">
            Suas mãos ainda não falaram. Faça sua primeira leitura.
          </p>
          <Button variant="primary" onClick={() => router.push("/ler/nome")}>
            Fazer leitura
          </Button>
        </div>
      )}

      {currentState === "has_readings" && userData && (
        <>
          {view === "cards" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {readings.map((r, i) => (
                <TarotReadingCard
                  key={r.id}
                  reading={r}
                  currentUserName={userData.name}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {readings.map((r, i) => (
                <ListReadingItem key={r.id} reading={r} currentUserName={userData.name} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function LeiturasPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh velvet-bg flex items-center justify-center">
          <p className="font-cormorant italic text-bone-dim">Um momento...</p>
        </main>
      }
    >
      <LeiturasContent />
    </Suspense>
  );
}
