"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Star, User, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Menu from "@/components/landing/Menu";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/shadcn/drawer";
import BrandIcon from "@/components/ui/BrandIcon";
import { GUEST_ITEMS, LOGGED_ITEMS } from "@/data/menu-items";
import { useAuth } from "@/hooks/useAuth";

// ─── Data ────────────────────────────────────────────────────────────

const FRASES = [
  {
    title: "Leitura de mão por especialistas",
    sub: "Primeira plataforma de quiromancia do Brasil. Resultado em 30 segundos.",
  },
  {
    title: "Mais de 12 mil mãos lidas",
    sub: "Quatro linhas, oito montes e sinais raros. Tudo sobre você numa única foto.",
  },
  {
    title: "Quiromancia real, não horóscopo",
    sub: "Nomenclatura técnica de quiromancia. Monte de Júpiter, Linha de Saturno. Sem genérico.",
  },
  {
    title: "Resultado que parece escrito pra você",
    sub: "Cada leitura é única. Personalizada pelo formato da sua mão e das suas linhas.",
  },
];

const DEPOIMENTOS = [
  {
    name: "Juliana",
    age: 31,
    city: "Recife",
    text: "Ela bateu no meu trabalho e no meu dinheiro sem dó. Pouco depois aconteceu o corte que estava escrito.",
  },
  {
    name: "Mariana",
    age: 27,
    city: "São Paulo",
    text: "Achei que era genérico. Aí ela descreveu meu ex em duas frases. Mandei pra ele.",
  },
  {
    name: "Carol",
    age: 24,
    city: "BH",
    text: "Fiz de brincadeira com as amigas. Todas ficaram em silêncio lendo o resultado.",
  },
  {
    name: "Bia",
    age: 29,
    city: "Curitiba",
    text: "Minha mãe pediu pra fazer. Agora ela quer ler a mão de todo mundo da família.",
  },
];

const PROMO_ITEMS = [
  "Leitura completa das 4 linhas",
  "Análise dos 8 montes da palma",
  "Sinais raros e cruzamentos",
  "Compatibilidade entre elementos",
  "Resultado salvo pra sempre",
];

// ─── Small components ────────────────────────────────────────────────

function getSecsUntilMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return Math.floor((end.getTime() - now.getTime()) / 1000);
}

function CountdownTimer() {
  const [secs, setSecs] = useState(getSecsUntilMidnight);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return (
    <span className="font-mono text-[11px] text-primary tabular-nums">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

/** Mystic tag — dot + text, replaces generic Badge */
function Tag({
  children,
  color = "primary",
}: {
  children: string;
  color?: "primary" | "rose" | "accent";
}) {
  const colors = {
    primary: { dot: "#C9A24A", text: "text-primary" },
    rose: { dot: "#C4647A", text: "text-rose" },
    accent: { dot: "#7B6BA5", text: "text-accent" },
  };
  const c = colors[color];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] ${c.text}`}>
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}40` }}
      />
      {children}
    </span>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-5 px-12" aria-hidden>
      <span
        className="flex-1 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.12))" }}
      />
      <span
        className="w-1.5 h-1.5 rotate-45 bg-primary/40"
        style={{ boxShadow: "0 0 6px rgba(201,162,74,0.25)" }}
      />
      <span
        className="flex-1 h-px"
        style={{ background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.12))" }}
      />
    </div>
  );
}

// ─── Illustrations ───────────────────────────────────────────────────

function _PalmLinesGlyph() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 160 200" fill="none">
      <defs>
        <radialGradient id="plg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(201,162,74,0.18)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="lr" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#C4647A" stopOpacity="0" />
          <stop offset="15%" stopColor="#C4647A" />
          <stop offset="85%" stopColor="#C4647A" />
          <stop offset="100%" stopColor="#C4647A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lv" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#7B6BA5" stopOpacity="0" />
          <stop offset="15%" stopColor="#7B6BA5" />
          <stop offset="85%" stopColor="#7B6BA5" />
          <stop offset="100%" stopColor="#7B6BA5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="llg" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#C9A24A" stopOpacity="0" />
          <stop offset="20%" stopColor="#C9A24A" />
          <stop offset="80%" stopColor="#C9A24A" />
          <stop offset="100%" stopColor="#C9A24A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lb" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#E8DFD0" stopOpacity="0" />
          <stop offset="20%" stopColor="#E8DFD0" stopOpacity="0.5" />
          <stop offset="80%" stopColor="#E8DFD0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8DFD0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="100" r="75" fill="url(#plg)" />
      <circle
        cx="80"
        cy="100"
        r="70"
        stroke="rgba(201,162,74,0.08)"
        strokeWidth="0.4"
        fill="none"
        strokeDasharray="2 6"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 80 100"
          to="360 80 100"
          dur="90s"
          repeatCount="indefinite"
        />
      </circle>
      <path
        d="M20 75 Q50 60 80 68 Q110 76 140 65"
        stroke="url(#lr)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </path>
      <path
        d="M20 75 Q50 60 80 68 Q110 76 140 65"
        stroke="#C4647A"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.08"
      >
        <animate
          attributeName="opacity"
          values="0.04;0.12;0.04"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M25 100 Q55 90 80 95 Q105 100 135 92"
        stroke="url(#lv)"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4s" repeatCount="indefinite" />
      </path>
      <path
        d="M45 55 Q35 85 38 115 Q42 145 55 165"
        stroke="url(#llg)"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <animate attributeName="opacity" values="0.5;0.85;0.5" dur="5s" repeatCount="indefinite" />
      </path>
      <path
        d="M80 160 Q78 130 80 100 Q82 75 80 50"
        stroke="url(#lb)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="4 3"
      >
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="6s" repeatCount="indefinite" />
      </path>
      <circle cx="50" cy="82" r="4" fill="rgba(196,100,122,0.2)">
        <animate attributeName="r" values="3;5;3" dur="4s" repeatCount="indefinite" />
        <animate
          attributeName="opacity"
          values="0.15;0.35;0.15"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="80" cy="95" r="3.5" fill="rgba(123,107,165,0.2)">
        <animate attributeName="r" values="2.5;4.5;2.5" dur="5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/** Small animated glyph for the promo banner */
function PromoGlyph() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <defs>
        <radialGradient id="prg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(196,100,122,0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="28" r="26" fill="url(#prg)" />
      <circle cx="28" cy="28" r="22" stroke="rgba(196,100,122,0.3)" strokeWidth="0.5" fill="none">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 28 28"
          to="360 28 28"
          dur="15s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="28"
        cy="28"
        r="16"
        stroke="rgba(201,162,74,0.25)"
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="2 3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360 28 28"
          to="0 28 28"
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Lightning bolt */}
      <path
        d="M31 16 L25 27 L29 27 L25 40 L35 25 L30 25 L33 16 Z"
        fill="rgba(201,162,74,0.7)"
        stroke="rgba(201,162,74,0.9)"
        strokeWidth="0.5"
      >
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function TarotGlyph() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 120 100" fill="none">
      <defs>
        <linearGradient id="tc" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(201,162,74,0.25)" />
          <stop offset="100%" stopColor="rgba(201,162,74,0.06)" />
        </linearGradient>
      </defs>
      <rect
        x="14"
        y="16"
        width="36"
        height="58"
        rx="4"
        fill="url(#tc)"
        stroke="rgba(201,162,74,0.35)"
        strokeWidth="0.7"
        transform="rotate(-15 32 45)"
      />
      <rect
        x="70"
        y="16"
        width="36"
        height="58"
        rx="4"
        fill="url(#tc)"
        stroke="rgba(201,162,74,0.35)"
        strokeWidth="0.7"
        transform="rotate(15 88 45)"
      />
      <rect
        x="42"
        y="12"
        width="36"
        height="62"
        rx="4"
        fill="rgba(201,162,74,0.14)"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="0.9"
      />
      <rect
        x="46"
        y="16"
        width="28"
        height="54"
        rx="2"
        stroke="rgba(201,162,74,0.18)"
        strokeWidth="0.4"
        fill="none"
      />
      <circle cx="60" cy="38" r="10" stroke="rgba(201,162,74,0.5)" strokeWidth="0.6" fill="none">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 60 38"
          to="360 60 38"
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="60" cy="38" r="5" fill="rgba(201,162,74,0.2)" />
      <circle cx="60" cy="38" r="2" fill="rgba(201,162,74,0.6)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function AstralGlyph() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 120 100" fill="none">
      <defs>
        <radialGradient id="ag" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(123,107,165,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="50" r="42" fill="url(#ag)" />
      <circle cx="60" cy="50" r="38" stroke="rgba(123,107,165,0.4)" strokeWidth="0.5" fill="none" />
      <circle cx="60" cy="50" r="28" stroke="rgba(123,107,165,0.3)" strokeWidth="0.5" fill="none" />
      <circle
        cx="60"
        cy="50"
        r="18"
        stroke="rgba(123,107,165,0.25)"
        strokeWidth="0.5"
        fill="none"
      />
      <g stroke="rgba(123,107,165,0.2)" strokeWidth="0.4">
        <line x1="60" y1="12" x2="60" y2="88" />
        <line x1="22" y1="50" x2="98" y2="50" />
        <line x1="34" y1="22" x2="86" y2="78" />
        <line x1="86" y1="22" x2="34" y2="78" />
      </g>
      <circle
        cx="60"
        cy="12"
        r="3"
        fill="rgba(123,107,165,0.6)"
        stroke="rgba(123,107,165,0.8)"
        strokeWidth="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 60 50"
          to="360 60 50"
          dur="25s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="88"
        cy="50"
        r="2.5"
        fill="rgba(201,162,74,0.5)"
        stroke="rgba(201,162,74,0.7)"
        strokeWidth="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 60 50"
          to="-360 60 50"
          dur="40s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="60" cy="50" r="4" fill="rgba(123,107,165,0.4)" />
      <circle cx="60" cy="50" r="2" fill="rgba(123,107,165,0.8)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────

export default function HomeV2Landing() {
  const [fraseIdx, setFraseIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = useMemo(() => {
    if (!user) return GUEST_ITEMS;
    return [
      ...LOGGED_ITEMS,
      {
        id: "sair",
        num: "07",
        label: "Sair",
        sub: "Até a próxima",
        href: "/",
        onClick: () => {
          logout();
          router.push("/");
        },
      },
    ];
  }, [user, logout, router]);

  useEffect(() => {
    document.body.classList.add("hide-site-header");
    return () => {
      document.body.classList.remove("hide-site-header");
    };
  }, []);

  const nextFrase = useCallback(() => setFraseIdx((i) => (i + 1) % FRASES.length), []);
  useEffect(() => {
    const t = setInterval(nextFrase, 6000);
    return () => clearInterval(t);
  }, [nextFrase]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let idx = 0;
    const t = setInterval(() => {
      idx = (idx + 1) % DEPOIMENTOS.length;
      const card = el.children[idx] as HTMLElement | undefined;
      if (card) el.scrollTo({ left: card.offsetLeft - 20, behavior: "smooth" });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-dvh relative"
      style={{
        background: `
          linear-gradient(180deg,
            #08050e 0%,
            #09060f 20%,
            #0a0711 45%,
            #090610 65%,
            #08050e 100%
          )
        `,
      }}
    >
      {/* ── Ambient glows (layered, asymmetric) ── */}
      <div
        className="fixed top-0 left-0 right-0 h-[600px] pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 45% at 25% 8%, rgba(123,107,165,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 80% 20%, rgba(196,100,122,0.03) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 h-[350px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(201,162,74,0.025) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[420px] pb-28">
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link href={user ? "/conta/leituras" : "/login"}>
            <Button variant="outline" size="sm" className="rounded-full">
              {user ? "Conta" : "Entrar"}
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <BrandIcon width={22} height={14} className="text-primary" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vetor-logo.svg"
              alt="MãosFalam"
              className="opacity-90 h-auto"
              style={{ width: 54 }}
            />
          </Link>
          <Menu activeId="home" items={menuItems} />
        </header>

        {/* ── Promo banner (opens bottom sheet) ── */}
        <section className="px-5 pt-2 pb-2">
          <Drawer>
            <DrawerTrigger asChild>
              <button className="w-full text-left relative rounded-2xl overflow-hidden border border-rose/20 bg-gradient-to-r from-[#1f0f1a] via-[#1a0e20] to-[#1f0f1a] p-0 cursor-pointer">
                {/* Shimmer */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 40%, rgba(196,100,122,0.08) 45%, rgba(196,100,122,0.15) 50%, rgba(196,100,122,0.08) 55%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s infinite",
                  }}
                />
                <div className="flex items-center gap-3 px-4 py-3.5 relative">
                  <PromoGlyph />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-rose/20 text-rose hover:bg-rose/20 text-[8px] px-1.5 py-0 h-4">
                        <Zap size={8} className="mr-0.5" /> Oferta relâmpago
                      </Badge>
                      <CountdownTimer />
                    </div>
                    <p className="text-[14px] text-foreground leading-tight">
                      Leitura completa{" "}
                      <span className="text-primary font-fraunces font-semibold">R$9,90</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      <span className="line-through">R$14,90</span> · Só hoje
                    </p>
                  </div>
                </div>
              </button>
            </DrawerTrigger>

            {/* ── Bottom sheet: promo details ── */}
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm px-6 pt-4 pb-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <Badge className="bg-rose/20 text-rose hover:bg-rose/20 mb-3">
                    <Zap size={10} className="mr-1" /> Oferta relâmpago
                  </Badge>
                  <h2 className="font-fraunces text-2xl text-foreground mb-1">Leitura completa</h2>
                  <p className="text-muted-foreground text-sm">
                    Tudo que suas mãos escondem de você
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline justify-center gap-3 mb-6">
                  <span className="text-muted-foreground text-lg line-through">R$14,90</span>
                  <span className="text-primary text-4xl font-fraunces font-semibold">R$9,90</span>
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 mb-6 py-2 rounded-xl bg-rose/5 border border-rose/10">
                  <Zap size={14} className="text-rose" />
                  <span className="text-sm text-foreground/80">Expira em</span>
                  <CountdownTimer />
                </div>

                {/* What you get */}
                <div className="space-y-3 mb-8">
                  {PROMO_ITEMS.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-[14px] text-foreground/85">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href="/ler/nome">
                  <Button size="lg" className="w-full rounded-xl gap-2 text-base">
                    Ler minha mão agora
                    <ArrowRight size={18} />
                  </Button>
                </Link>

                <p className="text-center text-[11px] text-muted-foreground mt-3">
                  Pagamento seguro · PIX ou cartão
                </p>
              </div>
            </DrawerContent>
          </Drawer>
        </section>

        {/* ── Frase rotativa da cigana ── */}
        <section className="px-5 pt-3 pb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={fraseIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-fraunces text-[17px] leading-[1.25] text-foreground mb-1">
                {FRASES[fraseIdx].title}
              </h2>
              <p className="text-[13px] text-muted-foreground leading-[1.5]">
                {FRASES[fraseIdx].sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Main CTA card — with mandala pattern ── */}
        <section className="px-5 pb-5">
          <Card
            className="overflow-hidden py-0 card-noise relative"
            style={{
              background: "linear-gradient(160deg, #0a0815 0%, #070612 60%, #050410 100%)",
            }}
          >
            {/* Top radial glow */}
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-[200px] h-[120px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(30,25,60,0.5) 0%, transparent 70%)",
              }}
            />

            {/* Mandala pattern — top right corner, very subtle */}
            <svg
              className="absolute -top-12 -right-12 pointer-events-none opacity-[0.18]"
              width="240"
              height="240"
              viewBox="0 0 200 200"
              fill="none"
            >
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 100 100"
                  to="360 100 100"
                  dur="120s"
                  repeatCount="indefinite"
                />
                <circle cx="100" cy="100" r="90" stroke="#C9A24A" strokeWidth="0.3" />
                <circle cx="100" cy="100" r="70" stroke="#C9A24A" strokeWidth="0.25" />
                <circle cx="100" cy="100" r="50" stroke="#C9A24A" strokeWidth="0.25" />
                <circle cx="100" cy="100" r="30" stroke="#C9A24A" strokeWidth="0.2" />
                {/* Petals */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                  <line
                    key={angle}
                    x1="100"
                    y1="100"
                    x2={100 + 90 * Math.cos((angle * Math.PI) / 180)}
                    y2={100 + 90 * Math.sin((angle * Math.PI) / 180)}
                    stroke="#C9A24A"
                    strokeWidth="0.2"
                  />
                ))}
                {/* Diamond shapes at intersections */}
                {[0, 60, 120, 180, 240, 300].map((angle) => {
                  const r = 50;
                  const cx = 100 + r * Math.cos((angle * Math.PI) / 180);
                  const cy = 100 + r * Math.sin((angle * Math.PI) / 180);
                  return (
                    <rect
                      key={`d${angle}`}
                      x={cx - 1.5}
                      y={cy - 1.5}
                      width="3"
                      height="3"
                      fill="#C9A24A"
                      transform={`rotate(45 ${cx} ${cy})`}
                    />
                  );
                })}
                {/* Outer petal arcs */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                  const r = 75;
                  const cx1 = 100 + r * Math.cos(((angle - 10) * Math.PI) / 180);
                  const cy1 = 100 + r * Math.sin(((angle - 10) * Math.PI) / 180);
                  const cx2 = 100 + (r + 12) * Math.cos((angle * Math.PI) / 180);
                  const cy2 = 100 + (r + 12) * Math.sin((angle * Math.PI) / 180);
                  const cx3 = 100 + r * Math.cos(((angle + 10) * Math.PI) / 180);
                  const cy3 = 100 + r * Math.sin(((angle + 10) * Math.PI) / 180);
                  return (
                    <path
                      key={`p${angle}`}
                      d={`M ${cx1} ${cy1} Q ${cx2} ${cy2} ${cx3} ${cy3}`}
                      stroke="#C9A24A"
                      strokeWidth="0.25"
                      fill="none"
                    />
                  );
                })}
              </g>
            </svg>

            {/* Subtle bg gradient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(201,162,74,0.04) 0%, transparent 60%)",
              }}
            />

            <CardContent className="px-5 py-5 relative">
              <h2 className="font-fraunces text-[22px] leading-[1.15] text-foreground mb-2">
                Me mostre sua mão
              </h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                Eu te conto o que ela esconde de você.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Tag color="rose">Grátis</Tag>
                <span className="text-[10px] text-muted-foreground">30 segundos</span>
              </div>

              <Link href="/ler/nome" className="block">
                <button
                  className="w-full h-[46px] rounded-[14px] text-[15px] font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] font-fraunces tracking-wide"
                  style={{ background: "#C9A24A", color: "#08050e" }}
                >
                  Começar
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* ── Tarô + Mapa Astral — each with unique decorative pattern ── */}
        <section className="px-5 pb-5 grid grid-cols-2 gap-3">
          {/* Tarô — pentagram/star pattern */}
          <Link href="/tarot">
            <Card
              className="py-0 cursor-pointer relative overflow-hidden card-noise-dim transition-shadow"
              style={{
                background: "linear-gradient(170deg, #0a0816 0%, #070612 100%)",
              }}
            >
              {/* Top glow */}
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-[100px] h-[80px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(30,25,55,0.6) 0%, transparent 70%)",
                }}
              />
              {/* Star/pentagram pattern — top right */}
              <svg
                className="absolute -top-3 -right-3 pointer-events-none opacity-[0.05]"
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle cx="50" cy="50" r="45" stroke="#C9A24A" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="30" stroke="#C9A24A" strokeWidth="0.25" />
                {[0, 72, 144, 216, 288].map((a) => {
                  const x1 = 50 + 45 * Math.cos(((a - 90) * Math.PI) / 180);
                  const y1 = 50 + 45 * Math.sin(((a - 90) * Math.PI) / 180);
                  const x2 = 50 + 45 * Math.cos(((a + 144 - 90) * Math.PI) / 180);
                  const y2 = 50 + 45 * Math.sin(((a + 144 - 90) * Math.PI) / 180);
                  return (
                    <line
                      key={a}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#C9A24A"
                      strokeWidth="0.25"
                    />
                  );
                })}
              </svg>
              <CardContent className="p-4 flex flex-col gap-2 min-h-[165px] relative">
                <div className="h-[75px] flex items-center justify-center">
                  <TarotGlyph />
                </div>
                <div className="mt-auto">
                  <div className="mb-1">
                    <Tag color="primary">Grátis</Tag>
                  </div>
                  <h3 className="font-fraunces text-[15px] text-foreground">Tarô</h3>
                  <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                    Três cartas, uma resposta
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Mapa Astral — celestial/constellation pattern */}
          <Card
            className="py-0 relative overflow-hidden card-noise-dim"
            style={{
              background: "linear-gradient(170deg, #08071a 0%, #060514 100%)",
            }}
          >
            {/* Top glow */}
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-[100px] h-[80px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(25,22,55,0.6) 0%, transparent 70%)",
              }}
            />
            {/* Constellation pattern — scattered */}
            <svg
              className="absolute -top-2 -right-2 pointer-events-none opacity-[0.06]"
              width="110"
              height="110"
              viewBox="0 0 110 110"
              fill="none"
            >
              {/* Constellation dots */}
              {[
                [20, 15],
                [45, 8],
                [70, 22],
                [35, 40],
                [60, 35],
                [85, 18],
                [50, 55],
                [75, 50],
                [30, 65],
                [55, 70],
                [80, 60],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.2" fill="#7B6BA5" />
              ))}
              {/* Connection lines */}
              <path
                d="M20 15 L45 8 L70 22 M35 40 L60 35 L85 18 M50 55 L75 50 M30 65 L55 70 L80 60"
                stroke="#7B6BA5"
                strokeWidth="0.3"
              />
              <path
                d="M45 8 L35 40 M70 22 L60 35 L75 50 M35 40 L50 55 L55 70"
                stroke="#7B6BA5"
                strokeWidth="0.2"
              />
            </svg>
            <CardContent className="p-4 flex flex-col gap-2 min-h-[165px] relative">
              <div className="h-[75px] flex items-center justify-center">
                <AstralGlyph />
              </div>
              <div className="mt-auto">
                <div className="mb-1">
                  <Tag color="accent">Em breve</Tag>
                </div>
                <h3 className="font-fraunces text-[15px] text-foreground">Mapa astral</h3>
                <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                  O céu do dia que nasceu
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <SectionDivider />

        {/* ── Depoimentos ── */}
        <div className="px-5 pb-3">
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-primary">
            Quem já mostrou a mão
          </p>
        </div>

        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-6 w-6 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, var(--background), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-6 w-10 z-10 pointer-events-none"
            style={{ background: "linear-gradient(270deg, var(--background), transparent)" }}
          />

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-5 px-5 snap-x snap-mandatory no-scrollbar"
          >
            {DEPOIMENTOS.map((d, i) => (
              <div key={i} className="shrink-0 snap-center" style={{ width: "min(280px, 75vw)" }}>
                <Card
                  className="py-0 h-full card-noise-dim"
                  style={{ background: "linear-gradient(160deg, #0b0918 0%, #070613 100%)" }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-0.5 mb-2.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={11} className="fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-[13px] text-foreground/85 leading-[1.55] mb-3">
                      &ldquo;{d.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted border border-primary/10 flex items-center justify-center text-primary text-[10px] font-semibold shrink-0">
                        {d.name[0]}
                      </div>
                      <div>
                        <p className="text-[12px] text-foreground font-medium leading-tight">
                          {d.name}, {d.age}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{d.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* ── Social proof ── */}
        <div className="px-5 pb-8">
          <div
            className="flex items-center justify-center gap-3 py-3 rounded-2xl ring-1 ring-white/[0.02]"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center"
                >
                  <User size={10} className="text-muted-foreground" />
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground">
              <span className="text-primary font-semibold">12.847</span> mãos já foram lidas
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40"
          style={{
            background: "rgba(8,5,14,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(201,162,74,0.06)",
          }}
        >
          <div className="grid grid-cols-4 pt-2.5 pb-7">
            {(
              [
                { label: "Início", href: "/", active: true },
                { label: "Leituras", href: "/ler/nome", active: false },
                { label: "Tarô", href: "/tarot", active: false },
                { label: "Entrar", href: user ? "/conta/leituras" : "/login", active: false },
              ] as const
            ).map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex flex-col items-center gap-1.5 py-0.5 no-underline transition-colors ${tab.active ? "text-primary" : "text-muted-foreground"}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 22 22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={tab.active ? "1.6" : "1.3"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {tab.label === "Início" && (
                    <>
                      <path
                        d="M3.5 10 L11 3.5 L18.5 10 V18.5 H3.5 Z"
                        fill={tab.active ? "rgba(201,162,74,0.1)" : "none"}
                      />
                      <path d="M9 18.5 V13.5 H13 V18.5" />
                    </>
                  )}
                  {tab.label === "Leituras" && (
                    <>
                      <path d="M5 16 C9 9 13 7 18 5" />
                      <path d="M4 12 C10 9 15 9 19 10" opacity="0.6" />
                      <path d="M6 6 C10 5 15 7 17 14" opacity="0.4" />
                    </>
                  )}
                  {tab.label === "Tarô" && (
                    <>
                      <rect x="6" y="3" width="10" height="16" rx="1.5" />
                      <circle cx="11" cy="11" r="2.5" opacity="0.6" />
                    </>
                  )}
                  {tab.label === "Entrar" && (
                    <>
                      <circle cx="11" cy="8" r="3.5" />
                      <path d="M4 19 C4 14 8 12 11 12 C14 12 18 14 18 19" />
                    </>
                  )}
                </svg>
                <span className={`text-[9px] tracking-[1.2px] ${tab.active ? "font-medium" : ""}`}>
                  {tab.label}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
