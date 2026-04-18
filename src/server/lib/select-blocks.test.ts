import { describe, it, expect, vi } from "vitest";

import type { HandAttributes } from "@/types/hand-attributes";

// Mock logger to avoid Pino imports

vi.mock("./logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { selectBlocks } from "./select-blocks";

const BASE_ATTRS: HandAttributes = {
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

describe("MIX-06 — hash estavel: secondary_element nao altera texto primario", () => {
  it("selectBlocks sem secondary_element e com secondary_element='water' produz mesmo elementIntro", () => {
    const withoutSecondary = selectBlocks(BASE_ATTRS, "Maria", "female");
    const withSecondary = selectBlocks(
      { ...BASE_ATTRS, secondary_element: "water" },
      "Maria",
      "female",
    );

    expect(withSecondary.element.intro).toBe(withoutSecondary.element.intro);
  });

  it("selectBlocks sem e com secondary_element produz mesmo elementBody", () => {
    const withoutSecondary = selectBlocks(BASE_ATTRS, "Maria", "female");
    const withSecondary = selectBlocks(
      { ...BASE_ATTRS, secondary_element: "water" },
      "Maria",
      "female",
    );

    expect(withSecondary.element.body).toBe(withoutSecondary.element.body);
  });

  it("selectBlocks sem e com secondary_element produz mesmo opening", () => {
    const withoutSecondary = selectBlocks(BASE_ATTRS, "Maria", "female");
    const withSecondary = selectBlocks(
      { ...BASE_ATTRS, secondary_element: "water" },
      "Maria",
      "female",
    );

    expect(withSecondary.opening).toBe(withoutSecondary.opening);
  });

  it("selectBlocks sem e com secondary_element produz mesmo impact_phrase", () => {
    const withoutSecondary = selectBlocks(BASE_ATTRS, "Maria", "female");
    const withSecondary = selectBlocks(
      { ...BASE_ATTRS, secondary_element: "water" },
      "Maria",
      "female",
    );

    expect(withSecondary.impact_phrase).toBe(withoutSecondary.impact_phrase);
  });
});

describe("MIX-05 — bridge injetado quando secondary_element presente", () => {
  it("report.element.bridge e string nao-vazia quando secondary_element='water' e element='fire'", () => {
    const result = selectBlocks({ ...BASE_ATTRS, secondary_element: "water" }, "Maria", "female");

    expect(result.element.bridge).toBeTruthy();
    expect(typeof result.element.bridge).toBe("string");
  });

  it("report.element.secondary_key === 'water' quando secondary_element='water'", () => {
    const result = selectBlocks({ ...BASE_ATTRS, secondary_element: "water" }, "Maria", "female");

    expect(result.element.secondary_key).toBe("water");
  });
});

describe("MIX-02 — bridge e secondary_key ausentes sem mao mista", () => {
  it("report.element.secondary_key e undefined quando secondary_element e undefined", () => {
    const result = selectBlocks(BASE_ATTRS, "Maria", "female");

    expect(result.element.secondary_key).toBeUndefined();
  });

  it("report.element.bridge e undefined quando secondary_element e undefined", () => {
    const result = selectBlocks(BASE_ATTRS, "Maria", "female");

    expect(result.element.bridge).toBeUndefined();
  });
});

describe("MIX-04 — exclusivity mista diferente da pura", () => {
  it("portrait.exclusivity com secondary_element='water' e diferente do exclusivity puro de fogo", () => {
    const pure = selectBlocks(BASE_ATTRS, "Maria", "female");
    const mixed = selectBlocks({ ...BASE_ATTRS, secondary_element: "water" }, "Maria", "female");

    expect(mixed.portrait.exclusivity).not.toBe(pure.portrait.exclusivity);
  });
});
