export type HandElement = "fire" | "water" | "earth" | "air";
export type LineName = "heart" | "head" | "life" | "fate";
export type Tier = "free" | "premium";

export interface ReadingSection {
  line: LineName;
  symbol: string;
  planet: string;
  tier: Tier;
  /** Legenda curta tipo "Como você ama" / "Como você pensa". */
  tagline?: string;
  intro: string;
  body: string;
  /** Parágrafos adicionais após o body. Pra sensação de leitura longa. */
  body_extras?: string[];
  /** Frases da cigana interjetadas no meio da leitura (após o body, entre os extras). */
  cigana_quotes?: string[];
  /** Lista de atributos técnicos pra strip JetBrains no rodapé do card. */
  technical?: string[];
  impact_phrase: string;
}

export interface CompatibilityEntry {
  pair: string;
  word: string;
  description: string;
}

export interface ReadingStats {
  lines: number;
  mounts: number;
  dominant_planet: string;
  rare_signs: number;
  rarity_percent: number;
}

export interface MountDetail {
  name: string;
  content: string;
  planet_symbol?: string;
  strength?: number;
  word?: string;
  cigana_quote?: string;
}

export interface ReadingReport {
  user_name: string;
  element: {
    type: HandElement;
    title: string;
    body: string;
    impact: string;
  };
  sections: ReadingSection[];
  mounts: MountDetail[];
  crosses: Array<{ content: string }>;
  rare_signs: Array<{ name: string; content: string }>;
  compatibility?: CompatibilityEntry[];
  stats?: ReadingStats;
  intimacy?: {
    title: string;
    subtitle: string;
    quote: string;
    body: string[];
    cigana_quotes: string[];
    technical: string[];
  };
  share_phrase: string;
}

export interface Reading {
  id: string;
  tier: Tier;
  share_token: string;
  share_expires_at: string;
  report: ReadingReport;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  credits_expires_at: string | null;
  readings: Reading[];
}
