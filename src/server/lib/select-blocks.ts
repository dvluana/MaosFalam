import {
  SECTION_META,
  TRANSITIONS,
  IMPACT_PHRASES,
  REPORT_OPENING,
  EPILOGUE,
  GENDER_MAP,
  HEART_MEASUREMENTS,
  HEAD_MEASUREMENTS,
  LIFE_MEASUREMENTS,
  FATE_MEASUREMENTS,
  ELEMENT_IMPACT,
  ELEMENT_INTRO,
  ELEMENT_BODY,
  HEART_BLOCKS,
  HEART_MODIFIERS,
  HEAD_BLOCKS,
  HEAD_MODIFIERS,
  LIFE_BLOCKS,
  FATE_BLOCKS,
  VENUS_OPENING,
  VENUS_BODY_PRONOUNCED,
  VENUS_BODY_FLAT,
  VENUS_CINTURAO,
  VENUS_CLOSING,
  CROSSING_BLOCKS,
  COMPAT_BLOCKS,
  RARE_SIGN_BLOCKS,
} from "@/data/blocks";
import type { TextBlock, LineBlocks, MeasurementSet } from "@/types/blocks";
import type { HandAttributes, MountKey, RareSignKey } from "@/types/hand-attributes";
import type {
  ReportJSON,
  ReportSection,
  ReportVenus,
  ReportCrossing,
  ReportCompat,
  ReportRareSign,
  HandElement,
  Accent,
  SectionKey,
  Tier,
} from "@/types/report";

// ---------------------------------------------------------------------------
// Helpers (internal)
// ---------------------------------------------------------------------------

function pickRandom(block: TextBlock): string {
  const options = [block.content, block.alt, block.alt2];
  return options[Math.floor(Math.random() * options.length)]!;
}

function replaceGender(text: string, gender: "female" | "male"): string {
  let result = text;
  const map = GENDER_MAP[gender];
  for (const [marker, replacement] of Object.entries(map)) {
    result = result.replaceAll(marker, replacement);
  }
  return result;
}

function replaceName(text: string, name: string): string {
  return text.replaceAll("{{name}}", name);
}

function apply(text: string, name: string, gender: "female" | "male"): string {
  return replaceGender(replaceName(text, name), gender);
}

function applyAll<T>(obj: T, name: string, gender: "female" | "male"): T {
  if (typeof obj === "string") return apply(obj, name, gender) as T;
  if (Array.isArray(obj)) return obj.map((item) => applyAll(item, name, gender)) as T;
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = applyAll(value, name, gender);
    }
    return result as T;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ELEMENT_EXCLUSIVITY: Record<HandElement, number> = {
  fire: 18,
  water: 22,
  earth: 35,
  air: 25,
};

const ELEMENT_LABELS: Record<HandElement, string> = {
  fire: "Fogo",
  water: "Agua",
  earth: "Terra",
  air: "Ar",
};

const MOUNT_PRIORITY: MountKey[] = ["jupiter", "mercury", "apollo", "mars", "saturn", "moon"];

const MOUNT_NAMES: Record<MountKey, string> = {
  jupiter: "Jupiter",
  mercury: "Mercurio",
  apollo: "Apolo",
  mars: "Marte",
  saturn: "Saturno",
  moon: "Lua",
};

// ---------------------------------------------------------------------------
// Crossing match conditions
// ---------------------------------------------------------------------------

type CrossingCondition = (attrs: HandAttributes) => boolean;

const CROSSING_CONDITIONS: Record<string, CrossingCondition> = {
  heart_straight_x_head_long: (a) =>
    a.heart.variation.includes("straight") && a.head.variation.includes("long"),
  heart_curved_x_head_short: (a) =>
    a.heart.variation.includes("curved") && a.head.variation.includes("short"),
  life_wide_x_venus_pronounced: (a) =>
    a.life.variation === "curved_wide" && a.venus.mount === "pronounced",
  fate_deep_x_jupiter: (a) =>
    a.fate.variation === "present_deep" && a.mounts.jupiter === "pronounced",
  head_moon_x_moon_pronounced: (a) =>
    a.head.variation.includes("curved") && a.mounts.moon === "pronounced",
  heart_deep_x_venus_cinturao: (a) =>
    (a.heart.modifiers as readonly string[]).includes("deep") && a.venus.cinturao,
  life_broken_x_fate_late: (a) =>
    a.life.variation === "broken_restart" && a.fate.variation === "late_start",
  head_touches_life_x_earth: (a) =>
    (a.head.modifiers as readonly string[]).includes("touches_life") && a.element === "earth",
};

// ---------------------------------------------------------------------------
// Transition keys per section
// ---------------------------------------------------------------------------

const TRANSITION_KEY: Record<string, string> = {
  heart: "prologue_to_heart",
  head: "head_to_life",
  life: "life_to_venus",
  fate: "mounts_to_fate",
};

// ---------------------------------------------------------------------------
// selectBlocks — pure function, no I/O
// ---------------------------------------------------------------------------

export function selectBlocks(
  attributes: HandAttributes,
  name: string,
  gender: "female" | "male",
): ReportJSON {
  const el = attributes.element;

  // --- Element ---
  const elementIntro = pickRandom(ELEMENT_INTRO[el]);
  const elementBody = pickRandom(ELEMENT_BODY[el]);

  // --- Impact phrase ---
  const heartTag = attributes.heart.variation.includes("straight") ? "straight" : "curved";
  const specificKey = `${el}_heart_${heartTag}`;
  const phrases = IMPACT_PHRASES as Record<string, string>;
  const impactPhrase = phrases[specificKey] ?? phrases[el] ?? pickRandom(ELEMENT_IMPACT[el]);

  // --- Opening ---
  const opening = pickRandom(REPORT_OPENING);

  // --- Portrait ---
  const dominantMount = resolveDominantMount(attributes.mounts);
  const nonFlatCount = Object.values(attributes.mounts).filter((s) => s !== "flat").length;
  const rareCount = Object.values(attributes.rare_signs).filter(Boolean).length;
  const pct = ELEMENT_EXCLUSIVITY[el];

  const portrait = {
    dominant_mount: MOUNT_NAMES[dominantMount],
    lines_detected: "4/4",
    mounts_mapped: `${nonFlatCount}/8`,
    rare_signs_found: `${rareCount}/9`,
    exclusivity: `${pct}% das maos que eu ja li sao ${ELEMENT_LABELS[el]}`,
  };

  // --- Sections (heart, head, life, fate) ---
  const heartSection = buildLineSection(
    "heart",
    attributes.heart.variation,
    attributes.heart.modifiers,
    HEART_BLOCKS as unknown as Record<string, LineBlocks>,
    HEART_MODIFIERS as unknown as Record<string, TextBlock>,
    HEART_MEASUREMENTS as unknown as Record<string, MeasurementSet>,
  );

  const headSection = buildLineSection(
    "head",
    attributes.head.variation,
    attributes.head.modifiers,
    HEAD_BLOCKS as unknown as Record<string, LineBlocks>,
    HEAD_MODIFIERS as unknown as Record<string, TextBlock>,
    HEAD_MEASUREMENTS as unknown as Record<string, MeasurementSet>,
  );

  const lifeSection = buildLineSection(
    "life",
    attributes.life.variation,
    [],
    LIFE_BLOCKS as unknown as Record<string, LineBlocks>,
    {},
    LIFE_MEASUREMENTS as unknown as Record<string, MeasurementSet>,
  );

  const fateSection = buildLineSection(
    "fate",
    attributes.fate.variation,
    [],
    FATE_BLOCKS as unknown as Record<string, LineBlocks>,
    {},
    FATE_MEASUREMENTS as unknown as Record<string, MeasurementSet>,
  );

  // --- Venus ---
  const venus = buildVenus(attributes);

  // --- Crossings ---
  const crossings = buildCrossings(attributes);

  // --- Compatibility ---
  const compatibility = buildCompatibility(el);

  // --- Rare signs ---
  const rareSigns = buildRareSigns(attributes.rare_signs);

  // --- Epilogue ---
  const epilogue = pickRandom(EPILOGUE);

  // --- Assemble ---
  const report: ReportJSON = {
    opening,
    impact_phrase: impactPhrase,
    element: { key: el, intro: elementIntro, body: elementBody },
    portrait,
    sections: [heartSection, headSection, lifeSection, fateSection],
    venus,
    crossings,
    compatibility,
    rare_signs: rareSigns,
    epilogue,
  };

  return applyAll(report, name, gender);
}

// ---------------------------------------------------------------------------
// Section builder
// ---------------------------------------------------------------------------

function resolveMeta(key: string): {
  chapter: number;
  title: string;
  label: string;
  icon: string | null;
  accent: Accent;
  tier: Tier;
} {
  const raw = SECTION_META[key as SectionKey];
  if (!raw) {
    return {
      chapter: 0,
      title: key,
      label: key,
      icon: null,
      accent: "bone",
      tier: "premium",
    };
  }
  return {
    chapter: raw.number ? parseInt(raw.number, 10) : 0,
    title: raw.title ?? key,
    label: raw.label ?? key,
    icon: raw.icon,
    accent: raw.accent as Accent,
    tier: raw.tier as Tier,
  };
}

function resolveTransition(sectionKey: string): string {
  const tKey = TRANSITION_KEY[sectionKey];
  if (!tKey) return "";
  const t = (TRANSITIONS as Record<string, string>)[tKey];
  return t ?? "";
}

function buildLineSection(
  key: string,
  variation: string,
  modifiers: readonly string[],
  blocks: Record<string, LineBlocks>,
  modifierBlocks: Record<string, TextBlock>,
  measurements: Record<string, MeasurementSet>,
): ReportSection {
  const meta = resolveMeta(key);

  const lineBlock = blocks[variation];
  const sectionOpening = lineBlock ? pickRandom(lineBlock.opening) : "";
  const bodyPast = lineBlock ? pickRandom(lineBlock.body_past) : "";
  const bodyPresent = lineBlock ? pickRandom(lineBlock.body_present) : "";

  const activeModifiers: string[] = [];
  for (const mod of modifiers) {
    const modBlock = modifierBlocks[mod];
    if (modBlock) {
      activeModifiers.push(pickRandom(modBlock));
    }
  }

  const measurement = measurements[variation] ?? {};

  return {
    chapter: meta.chapter,
    key,
    title: meta.title,
    label: meta.label,
    icon: meta.icon,
    accent: meta.accent,
    tier: meta.tier,
    opening: sectionOpening,
    body_past: bodyPast,
    body_present: bodyPresent,
    modifiers: activeModifiers,
    measurement: { ...measurement },
    transition: resolveTransition(key),
  };
}

// ---------------------------------------------------------------------------
// Venus builder
// ---------------------------------------------------------------------------

function buildVenus(attributes: HandAttributes): ReportVenus {
  const meta = resolveMeta("venus");

  const venusOpening = pickRandom(VENUS_OPENING);
  const bodyBlock =
    attributes.venus.mount === "pronounced" ? VENUS_BODY_PRONOUNCED : VENUS_BODY_FLAT;
  const venusBody = pickRandom(bodyBlock);
  const cinturaoText = attributes.venus.cinturao ? pickRandom(VENUS_CINTURAO) : null;
  const venusClosing = pickRandom(VENUS_CLOSING);

  const measurement: Record<string, string> = {
    "Cinturao de Venus": attributes.venus.cinturao ? "Presente. Sinal raro." : "Ausente.",
    "Monte de Venus": attributes.venus.mount === "pronounced" ? "Pronunciado, firme." : "Discreto.",
    Perfil:
      attributes.venus.mount === "pronounced" ? "Intenso + imaginativo." : "Seletivo + mental.",
  };

  return {
    chapter: meta.chapter,
    title: meta.title,
    label: meta.label,
    accent: "rose",
    tier: "premium",
    opening: venusOpening,
    body: venusBody,
    cinturao: cinturaoText,
    closing: venusClosing,
    measurement,
    transition: resolveTransition("venus"),
  };
}

// ---------------------------------------------------------------------------
// Crossings builder
// ---------------------------------------------------------------------------

function buildCrossings(attributes: HandAttributes): ReportCrossing[] {
  const results: ReportCrossing[] = [];

  for (const [key, condition] of Object.entries(CROSSING_CONDITIONS)) {
    if (condition(attributes)) {
      const block = CROSSING_BLOCKS[key];
      if (block) {
        results.push({ key, body: pickRandom(block) });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Compatibility builder
// ---------------------------------------------------------------------------

function buildCompatibility(element: HandElement): ReportCompat[] {
  const elements: HandElement[] = ["fire", "water", "earth", "air"];
  const results: ReportCompat[] = [];

  for (const other of elements) {
    const key = `${element}_${other}`;
    const block = COMPAT_BLOCKS[key];
    if (block) {
      results.push({
        key,
        pair: block.pair,
        word: block.word,
        body: pickRandom(block.body),
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Rare signs builder
// ---------------------------------------------------------------------------

function buildRareSigns(signs: Record<RareSignKey, boolean>): ReportRareSign[] {
  const results: ReportRareSign[] = [];

  for (const [key, present] of Object.entries(signs) as [RareSignKey, boolean][]) {
    if (present) {
      const block = RARE_SIGN_BLOCKS[key];
      if (block) {
        results.push({
          key,
          name: block.name,
          body: pickRandom(block.body),
        });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Dominant mount resolver
// ---------------------------------------------------------------------------

function resolveDominantMount(mounts: Record<MountKey, string>): MountKey {
  for (const key of MOUNT_PRIORITY) {
    if (mounts[key] === "pronounced") return key;
  }
  for (const key of MOUNT_PRIORITY) {
    if (mounts[key] === "normal") return key;
  }
  return MOUNT_PRIORITY[0];
}
