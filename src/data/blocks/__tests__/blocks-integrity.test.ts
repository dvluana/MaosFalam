import { describe, it, expect } from "vitest";

import type { TextBlock } from "@/types/blocks";

import { COMPAT_BLOCKS } from "../compatibility";
import { CROSSING_BLOCKS } from "../crossings";
import { ELEMENT_IMPACT, ELEMENT_INTRO, ELEMENT_BODY } from "../element";
import { EPILOGUE } from "../epilogue";
import { FATE_BLOCKS } from "../fate";
import { GENDER_MAP } from "../gender-map";
import { HEAD_BLOCKS, HEAD_MODIFIERS } from "../head";
import { HEART_BLOCKS, HEART_MODIFIERS } from "../heart";
import { IMPACT_PHRASES } from "../impact-phrases";
import { LIFE_BLOCKS } from "../life";
import { MOUNT_BLOCKS } from "../mounts";
import { PAYWALL_TEASERS } from "../paywall-teasers";
import { RARE_SIGN_BLOCKS } from "../rare-signs";
import { REPORT_OPENING } from "../report-opening";
import { TRANSITIONS } from "../transitions";
import {
  VENUS_OPENING,
  VENUS_BODY_PRONOUNCED,
  VENUS_BODY_FLAT,
  VENUS_CINTURAO,
  VENUS_CLOSING,
} from "../venus";

function collectTextBlocks(): TextBlock[] {
  const blocks: TextBlock[] = [];

  // Element blocks
  for (const rec of [ELEMENT_IMPACT, ELEMENT_INTRO, ELEMENT_BODY]) {
    for (const tb of Object.values(rec)) {
      blocks.push(tb as TextBlock);
    }
  }

  // Line blocks (heart, head, life, fate)
  for (const rec of [HEART_BLOCKS, HEAD_BLOCKS, LIFE_BLOCKS, FATE_BLOCKS]) {
    for (const lb of Object.values(rec)) {
      const line = lb as { opening: TextBlock; body_past: TextBlock; body_present: TextBlock };
      blocks.push(line.opening, line.body_past, line.body_present);
    }
  }

  // Modifiers
  for (const rec of [HEART_MODIFIERS, HEAD_MODIFIERS]) {
    for (const tb of Object.values(rec)) {
      blocks.push(tb as TextBlock);
    }
  }

  // Mount blocks
  for (const mb of Object.values(MOUNT_BLOCKS)) {
    const mount = mb as { intro: TextBlock; body: TextBlock };
    blocks.push(mount.intro, mount.body);
  }

  // Venus
  blocks.push(VENUS_OPENING, VENUS_BODY_PRONOUNCED, VENUS_BODY_FLAT, VENUS_CINTURAO, VENUS_CLOSING);

  // Crossings
  for (const tb of Object.values(CROSSING_BLOCKS)) {
    blocks.push(tb as TextBlock);
  }

  // Compatibility
  for (const cb of Object.values(COMPAT_BLOCKS)) {
    const compat = cb as { body: TextBlock };
    blocks.push(compat.body);
  }

  // Rare signs
  for (const rs of Object.values(RARE_SIGN_BLOCKS)) {
    const rare = rs as { body: TextBlock };
    blocks.push(rare.body);
  }

  // Standalone
  blocks.push(REPORT_OPENING, EPILOGUE);

  return blocks;
}

function collectAllStrings(): string[] {
  const strings: string[] = [];

  for (const tb of collectTextBlocks()) {
    strings.push(tb.content, tb.alt, tb.alt2);
  }

  // Impact phrases (plain strings)
  for (const s of Object.values(IMPACT_PHRASES)) {
    strings.push(s as string);
  }

  // Transitions (plain strings)
  for (const s of Object.values(TRANSITIONS)) {
    strings.push(s as string);
  }

  // Paywall teasers
  for (const s of PAYWALL_TEASERS) {
    strings.push(s);
  }

  return strings;
}

describe("blocks integrity", () => {
  const femaleMarkers = new Set(Object.keys(GENDER_MAP.female));
  const allStrings = collectAllStrings();
  const allTextBlocks = collectTextBlocks();

  it("all gender markers in texts exist in GENDER_MAP", () => {
    const markerRegex = /\{\{(\w+)}}/g;
    const missing: string[] = [];

    for (const text of allStrings) {
      let match;
      while ((match = markerRegex.exec(text)) !== null) {
        const marker = `{{${match[1]}}}`;
        if (marker === "{{name}}") continue;
        if (!femaleMarkers.has(marker)) {
          missing.push(`${marker} in: "${text.slice(0, 60)}..."`);
        }
      }
    }

    expect(missing, `Missing markers in GENDER_MAP:\n${missing.join("\n")}`).toHaveLength(0);
  });

  it("no em dashes in any text", () => {
    const found: string[] = [];

    for (const text of allStrings) {
      if (text.includes("\u2014")) {
        found.push(`"${text.slice(0, 80)}..."`);
      }
    }

    expect(found, `Em dashes found:\n${found.join("\n")}`).toHaveLength(0);
  });

  it("no empty content/alt/alt2 in TextBlocks", () => {
    const empty: string[] = [];

    for (const [i, tb] of allTextBlocks.entries()) {
      if (!tb.content) empty.push(`Block ${i}: empty content`);
      if (!tb.alt) empty.push(`Block ${i}: empty alt`);
      if (!tb.alt2) empty.push(`Block ${i}: empty alt2`);
    }

    expect(empty, `Empty fields:\n${empty.join("\n")}`).toHaveLength(0);
  });

  it("has expected number of text blocks (~170+)", () => {
    expect(allTextBlocks.length).toBeGreaterThan(150);
  });

  it("has expected number of total strings (~500+)", () => {
    expect(allStrings.length).toBeGreaterThan(480);
  });
});
