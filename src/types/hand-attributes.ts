export type HeartVariation =
  | "long_straight"
  | "long_curved"
  | "long_deep_curved"
  | "short_straight"
  | "short_curved"
  | "medium_straight"
  | "medium_curved"
  | "faint";

export type HeartModifier = "fork_end" | "island" | "break" | "ends_index" | "ends_middle" | "deep";

export type HeadVariation =
  | "long_straight"
  | "long_curved"
  | "long_deep_curved"
  | "short_straight"
  | "short_curved"
  | "medium_straight"
  | "medium_curved"
  | "faint";

export type HeadModifier = "fork_moon" | "touches_life" | "island" | "break";

export type LifeVariation =
  | "long_deep"
  | "long_faint"
  | "short_deep"
  | "short_faint"
  | "curved_wide"
  | "curved_tight"
  | "broken_restart"
  | "chained";

export type FateVariation =
  | "present_deep"
  | "present_faint"
  | "broken"
  | "multiple"
  | "late_start"
  | "absent";

export type MountKey = "jupiter" | "saturn" | "apollo" | "mercury" | "mars" | "moon";

export type MountState = "pronounced" | "normal" | "flat";

export type RareSignKey =
  | "star_jupiter"
  | "mystic_cross"
  | "ring_solomon"
  | "sun_line"
  | "intuition_line"
  | "protection_marks";

export interface HandAttributes {
  element: "fire" | "water" | "earth" | "air";
  secondary_element?: "fire" | "water" | "earth" | "air"; // ausente quando mao nao e mista

  heart: {
    variation: HeartVariation;
    modifiers: HeartModifier[];
  };

  head: {
    variation: HeadVariation;
    modifiers: HeadModifier[];
  };

  life: {
    variation: LifeVariation;
  };

  fate: {
    variation: FateVariation;
  };

  venus: {
    mount: "pronounced" | "flat";
    cinturao: boolean;
  };

  mounts: Record<MountKey, MountState>;

  rare_signs: Record<RareSignKey, boolean>;

  confidence: number;
}
