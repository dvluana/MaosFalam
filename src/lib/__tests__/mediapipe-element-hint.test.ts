import { describe, expect, it, vi } from "vitest";

// Mock @mediapipe/tasks-vision since it's a client-side browser library
vi.mock("@mediapipe/tasks-vision", () => ({
  DrawingUtils: vi.fn(),
  FilesetResolver: { forVisionTasks: vi.fn() },
  HandLandmarker: { createFromOptions: vi.fn() },
}));

import { computeElementHint } from "@/lib/mediapipe";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * Builds a 21-element NormalizedLandmark array with key points placed so that
 * dist() calls inside computeElementHint produce the desired ratios.
 *
 * Key indices used by computeElementHint:
 *   landmarks[0]  = WRIST
 *   landmarks[5]  = INDEX_MCP
 *   landmarks[9]  = MIDDLE_MCP
 *   landmarks[12] = MIDDLE_TIP
 *   landmarks[17] = PINKY_MCP
 *
 * palmWidth  = dist(landmarks[5], landmarks[17])  → INDEX_MCP to PINKY_MCP
 * palmHeight = dist(landmarks[0], landmarks[9])   → WRIST to MIDDLE_MCP
 * fingerLength = dist(landmarks[9], landmarks[12]) → MIDDLE_MCP to MIDDLE_TIP
 */
function pt(x: number, y: number): NormalizedLandmark {
  return { x, y, z: 0, visibility: 1 };
}

function makeLandmarks(
  palmWidth: number,
  palmHeight: number,
  fingerLength: number,
): NormalizedLandmark[] {
  // Place all landmarks at origin by default
  const lm: NormalizedLandmark[] = Array.from({ length: 21 }, () => pt(0, 0));

  // WRIST at origin (0, 0)
  lm[0] = pt(0, 0);
  // MIDDLE_MCP at (0, palmHeight) — vertical distance from WRIST
  lm[9] = pt(0, palmHeight);
  // MIDDLE_TIP at (0, palmHeight + fingerLength) — extends from MIDDLE_MCP
  lm[12] = pt(0, palmHeight + fingerLength);
  // INDEX_MCP at (0, palmHeight) — same height as MIDDLE_MCP but left of it
  lm[5] = pt(0, palmHeight);
  // PINKY_MCP at (palmWidth, palmHeight) — palmWidth to the right of INDEX_MCP
  lm[17] = pt(palmWidth, palmHeight);

  return lm;
}

describe("computeElementHint", () => {
  it("returns undefined when landmarks.length < 21", () => {
    const lm: NormalizedLandmark[] = Array.from({ length: 20 }, () => pt(0, 0));
    expect(computeElementHint(lm)).toBeUndefined();
  });

  it("returns undefined for degenerate landmarks (palmWidth < 0.01)", () => {
    // palmWidth = 0 (INDEX_MCP and PINKY_MCP at same position)
    const lm = makeLandmarks(0, 0.3, 0.2);
    expect(computeElementHint(lm)).toBeUndefined();
  });

  it("returns 'earth' for square palm + short fingers", () => {
    // Square palm: palmHeight / palmWidth <= 1.1 (e.g., 1.0)
    // Short fingers: fingerLength / palmHeight <= 0.95 (e.g., 0.7)
    // palmWidth=0.2, palmHeight=0.2 → ratio=1.0 (square)
    // fingerLength=0.14 → 0.14/0.2=0.7 (short)
    const lm = makeLandmarks(0.2, 0.2, 0.14);
    expect(computeElementHint(lm)).toBe("earth");
  });

  it("returns 'air' for square palm + long fingers", () => {
    // Square palm: palmHeight / palmWidth <= 1.1 (e.g., 1.0)
    // Long fingers: fingerLength / palmHeight > 0.95 (e.g., 1.0)
    // palmWidth=0.2, palmHeight=0.2 → ratio=1.0 (square)
    // fingerLength=0.22 → 0.22/0.2=1.1 (long)
    const lm = makeLandmarks(0.2, 0.2, 0.22);
    expect(computeElementHint(lm)).toBe("air");
  });

  it("returns 'fire' for long palm + short fingers", () => {
    // Long palm: palmHeight / palmWidth > 1.1 (e.g., 1.5)
    // Short fingers: fingerLength / palmHeight <= 0.95 (e.g., 0.7)
    // palmWidth=0.2, palmHeight=0.3 → ratio=1.5 (long)
    // fingerLength=0.18 → 0.18/0.3=0.6 (short)
    const lm = makeLandmarks(0.2, 0.3, 0.18);
    expect(computeElementHint(lm)).toBe("fire");
  });

  it("returns 'water' for long palm + long fingers", () => {
    // Long palm: palmHeight / palmWidth > 1.1 (e.g., 1.5)
    // Long fingers: fingerLength / palmHeight > 0.95 (e.g., 1.1)
    // palmWidth=0.2, palmHeight=0.3 → ratio=1.5 (long)
    // fingerLength=0.33 → 0.33/0.3=1.1 (long)
    const lm = makeLandmarks(0.2, 0.3, 0.33);
    expect(computeElementHint(lm)).toBe("water");
  });
});
