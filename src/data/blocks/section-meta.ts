import type { SectionKey } from "@/types/report";

export const SECTION_META: Record<
  SectionKey,
  {
    readonly number: string | null;
    readonly title: string | null;
    readonly label: string | null;
    readonly icon: string | null;
    readonly accent: string;
    readonly tier: string;
  }
> = {
  prologue: {
    number: null,
    title: null,
    label: null,
    icon: null,
    accent: "gold",
    tier: "free",
  },
  heart: {
    number: "01",
    title: "Como você ama",
    label: "♀ Linha do Coração · Vênus",
    icon: "♀",
    accent: "rose",
    tier: "free",
  },
  head: {
    number: "02",
    title: "O que não te deixa dormir",
    label: "☿ Linha da Cabeça · Mercúrio",
    icon: "☿",
    accent: "violet",
    tier: "premium",
  },
  life: {
    number: "03",
    title: "O que você já sobreviveu",
    label: "☉ Linha da Vida · Sol",
    icon: "☉",
    accent: "gold",
    tier: "premium",
  },
  venus: {
    number: "04",
    title: "Quando a porta fecha",
    label: "♀ Monte de Vênus · Cinturão de Vênus",
    icon: "♀",
    accent: "rose",
    tier: "premium",
  },
  mounts: {
    number: "05",
    title: "Como o mundo te vê",
    label: "Montes da Mão",
    icon: null,
    accent: "gold",
    tier: "premium",
  },
  fate: {
    number: "06",
    title: "Pra onde você tá indo",
    label: "♄ Linha do Destino · Saturno",
    icon: "♄",
    accent: "violet",
    tier: "premium",
  },
  crossings: {
    number: "07",
    title: "Onde tudo se encontra",
    label: "Cruzamentos",
    icon: null,
    accent: "gold",
    tier: "premium",
  },
  compatibility: {
    number: "08",
    title: "Com quem suas mãos conversam",
    label: "Compatibilidade por Elemento",
    icon: null,
    accent: "rose",
    tier: "premium",
  },
  rare_signs: {
    number: "09",
    title: "O que quase ninguém tem",
    label: "Sinais Raros",
    icon: null,
    accent: "gold",
    tier: "premium",
  },
} as const;
