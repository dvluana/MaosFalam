import { vi, describe, it, expect, afterEach } from "vitest";

import type { HandAttributes, HeartVariation } from "@/types/hand-attributes";

vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { logger } from "../logger";
import { selectBlocks } from "../select-blocks";

const VALID_ATTRIBUTES: HandAttributes = {
  element: "fire",
  heart: { variation: "long_straight", modifiers: [] },
  head: { variation: "medium_curved", modifiers: [] },
  life: { variation: "long_deep" },
  fate: { variation: "present_deep" },
  venus: { mount: "flat", cinturao: false },
  mounts: {
    jupiter: "normal",
    saturn: "flat",
    apollo: "normal",
    mercury: "flat",
    mars: "flat",
    moon: "flat",
  },
  rare_signs: {
    star_jupiter: false,
    mystic_cross: false,
    ring_solomon: false,
    sun_line: false,
    intuition_line: false,
    protection_marks: false,
  },
  confidence: 0.85,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("selectBlocks — valid attributes", () => {
  it("returns a ReportJSON with 4 sections for valid attributes", () => {
    const result = selectBlocks(VALID_ATTRIBUTES, "Maria", "female");

    expect(result.sections).toHaveLength(4);
    expect(result.sections[0].key).toBe("heart");
    expect(result.sections[0].opening).toBeTruthy();
    expect(result.element.key).toBe("fire");
  });

  it("known fate variation 'absent' uses block data, not fallback", () => {
    const attrs: HandAttributes = { ...VALID_ATTRIBUTES, fate: { variation: "absent" } };
    const result = selectBlocks(attrs, "Maria", "female");

    expect(result.sections[3].opening).toBeTruthy();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});

describe("selectBlocks — determinism (DETERMINISM-01)", () => {
  it("produces deterministic output for identical inputs", () => {
    const result1 = selectBlocks(VALID_ATTRIBUTES, "Maria", "female");
    const result2 = selectBlocks(VALID_ATTRIBUTES, "Maria", "female");

    expect(result1).toEqual(result2);
  });

  it("different attributes produce different reports", () => {
    const waterAttrs: HandAttributes = { ...VALID_ATTRIBUTES, element: "water" };
    const result1 = selectBlocks(VALID_ATTRIBUTES, "Maria", "female");
    const result2 = selectBlocks(waterAttrs, "Maria", "female");

    expect(result1).not.toEqual(result2);
  });

  it("different name produces different substituted text", () => {
    const result1 = selectBlocks(VALID_ATTRIBUTES, "Maria", "female");
    const result2 = selectBlocks(VALID_ATTRIBUTES, "Ana", "female");

    // element intro can contain {{name}} substitution — check opening or element text
    const text1 = JSON.stringify(result1);
    const text2 = JSON.stringify(result2);
    expect(text1).not.toEqual(text2);
  });
});

describe("selectBlocks — _fallback hardening (AI-02)", () => {
  it("unknown heart variation does not throw", () => {
    const attrs: HandAttributes = {
      ...VALID_ATTRIBUTES,
      heart: {
        variation: "unknown_variation" as HeartVariation,
        modifiers: [],
      },
    };

    expect(() => selectBlocks(attrs, "Maria", "female")).not.toThrow();
  });

  it("unknown variation returns a non-undefined heart section (uses _fallback)", () => {
    const attrs: HandAttributes = {
      ...VALID_ATTRIBUTES,
      heart: {
        variation: "unknown_variation" as HeartVariation,
        modifiers: [],
      },
    };
    const result = selectBlocks(attrs, "Maria", "female");

    expect(result.sections[0]).toBeDefined();
    // _fallback provides text, so opening should be a non-empty string
    expect(typeof result.sections[0].opening).toBe("string");
  });

  it("unknown variation triggers logger.warn with axis and variation (AI-02)", () => {
    const attrs: HandAttributes = {
      ...VALID_ATTRIBUTES,
      heart: {
        variation: "unknown_variation" as HeartVariation,
        modifiers: [],
      },
    };
    selectBlocks(attrs, "Maria", "female");

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ axis: "heart", variation: "unknown_variation" }),
      expect.any(String),
    );
  });
});
