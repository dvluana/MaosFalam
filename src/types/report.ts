export type HandElement = "fire" | "water" | "earth" | "air";
export type Tier = "free" | "premium";
export type SectionKey =
  | "prologue"
  | "heart"
  | "head"
  | "life"
  | "venus"
  | "mounts"
  | "fate"
  | "crossings"
  | "compatibility"
  | "rare_signs";
export type Accent = "gold" | "rose" | "violet" | "bone";

export interface ReportJSON {
  opening: string;
  impact_phrase: string;

  element: {
    key: HandElement;
    intro: string;
    body: string;
    secondary_key?: HandElement; // ausente se nao misto
    bridge?: string; // ausente se nao misto
  };

  portrait: {
    dominant_mount: string;
    lines_detected: string;
    mounts_mapped: string;
    rare_signs_found: string;
    exclusivity: string;
  };

  sections: ReportSection[];

  venus: ReportVenus;

  crossings: ReportCrossing[];
  compatibility: ReportCompat[];
  rare_signs: ReportRareSign[];

  epilogue: string;
}

export interface ReportSection {
  chapter: number;
  key: string;
  title: string;
  label: string;
  icon: string | null;
  accent: Accent;
  tier: Tier;
  opening: string;
  body_past: string;
  body_present: string;
  modifiers: string[];
  measurement: Record<string, string>;
  transition: string;
}

export interface ReportVenus {
  chapter: number;
  title: string;
  label: string;
  accent: "rose";
  tier: "premium";
  opening: string;
  body: string;
  cinturao: string | null;
  closing: string;
  measurement: Record<string, string>;
  transition: string;
}

export interface ReportCrossing {
  key: string;
  body: string;
}

export interface ReportCompat {
  key: string;
  pair: string;
  word: string;
  body: string;
}

export interface ReportRareSign {
  key: string;
  name: string;
  body: string;
}

export interface Reading {
  id: string;
  tier: Tier;
  target_name?: string;
  report: ReportJSON;
  created_at: string;
}
