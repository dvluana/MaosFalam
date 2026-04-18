import { describe, expect, it, vi } from "vitest";

// Mock @mediapipe/tasks-vision since it's a client-side browser library
vi.mock("@mediapipe/tasks-vision", () => ({
  DrawingUtils: vi.fn(),
  FilesetResolver: { forVisionTasks: vi.fn() },
  HandLandmarker: { createFromOptions: vi.fn() },
}));

import { computeElementHint, validateLandmarks } from "@/lib/mediapipe";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * Builds a 21-element 3D landmark array with key points placed so that
 * dist3D() calls inside computeElementHint produce the desired ratios.
 *
 * worldLandmarks use real-world meter-scale values (not normalized 0-1).
 *
 * Key indices used by computeElementHint:
 *   landmarks[0]  = WRIST
 *   landmarks[5]  = INDEX_MCP
 *   landmarks[9]  = MIDDLE_MCP
 *   landmarks[12] = MIDDLE_TIP
 *   landmarks[17] = PINKY_MCP
 *
 * palmWidth  = dist3D(landmarks[5], landmarks[17])  → INDEX_MCP to PINKY_MCP
 * palmHeight = dist3D(landmarks[0], landmarks[9])   → WRIST to MIDDLE_MCP
 * fingerLength = dist3D(landmarks[9], landmarks[12]) → MIDDLE_MCP to MIDDLE_TIP
 */
function pt3D(x: number, y: number, z: number = 0): { x: number; y: number; z: number } {
  return { x, y, z };
}

function makeLandmarks3D(
  palmWidth: number,
  palmHeight: number,
  fingerLength: number,
): Array<{ x: number; y: number; z: number }> {
  // Place all landmarks at origin by default
  const lm: Array<{ x: number; y: number; z: number }> = Array.from({ length: 21 }, () =>
    pt3D(0, 0),
  );

  // WRIST at origin (0, 0, 0)
  lm[0] = pt3D(0, 0);
  // MIDDLE_MCP at (0, palmHeight) — vertical distance from WRIST
  lm[9] = pt3D(0, palmHeight);
  // MIDDLE_TIP at (0, palmHeight + fingerLength) — extends from MIDDLE_MCP
  lm[12] = pt3D(0, palmHeight + fingerLength);
  // INDEX_MCP at (0, palmHeight) — same height as MIDDLE_MCP but left of it
  lm[5] = pt3D(0, palmHeight);
  // PINKY_MCP at (palmWidth, palmHeight) — palmWidth to the right of INDEX_MCP
  lm[17] = pt3D(palmWidth, palmHeight);

  return lm;
}

describe("computeElementHint (worldLandmarks - 3D)", () => {
  it("returns undefined when worldLandmarks.length < 21", () => {
    const lm = Array.from({ length: 20 }, () => pt3D(0, 0));
    expect(computeElementHint(lm)).toBeUndefined();
  });

  it("returns undefined for degenerate landmarks (palmWidth < 0.001)", () => {
    // palmWidth = 0 (INDEX_MCP and PINKY_MCP at same position)
    const lm = makeLandmarks3D(0, 0.08, 0.05);
    expect(computeElementHint(lm)).toBeUndefined();
  });

  it("returns 'earth' for square palm + short fingers (3D coords)", () => {
    // Square palm: palmHeight / palmWidth <= 1.1 (e.g., 1.0)
    // Short fingers: fingerLength / palmHeight < 0.75 (e.g., 0.7)
    // palmWidth=0.08m, palmHeight=0.08m → ratio=1.0 (square)
    // fingerLength=0.056m → 0.056/0.08=0.7 (short)
    const lm = makeLandmarks3D(0.08, 0.08, 0.056);
    expect(computeElementHint(lm)).toBe("earth");
  });

  it("returns 'air' for square palm + long fingers (3D coords)", () => {
    // Square palm: palmHeight / palmWidth <= 1.1 (e.g., 1.0)
    // Long fingers: fingerLength / palmHeight >= 0.75 (e.g., 0.9)
    // palmWidth=0.08m, palmHeight=0.08m → ratio=1.0 (square)
    // fingerLength=0.072m → 0.072/0.08=0.9 (long)
    const lm = makeLandmarks3D(0.08, 0.08, 0.072);
    expect(computeElementHint(lm)).toBe("air");
  });

  it("returns 'fire' for rectangular palm + short fingers (3D coords)", () => {
    // Long palm: palmHeight / palmWidth > 1.1 (e.g., 1.5)
    // Short fingers: fingerLength / palmHeight < 0.75 (e.g., 0.6)
    // palmWidth=0.07m, palmHeight=0.105m → ratio=1.5 (long)
    // fingerLength=0.063m → 0.063/0.105=0.6 (short)
    const lm = makeLandmarks3D(0.07, 0.105, 0.063);
    expect(computeElementHint(lm)).toBe("fire");
  });

  it("returns 'water' for rectangular palm + long fingers (3D coords)", () => {
    // Long palm: palmHeight / palmWidth > 1.1 (e.g., 1.5)
    // Long fingers: fingerLength / palmHeight >= 0.75 (e.g., 0.85)
    // palmWidth=0.07m, palmHeight=0.105m → ratio=1.5 (long)
    // fingerLength=0.089m → 0.089/0.105 ≈ 0.85 (long)
    const lm = makeLandmarks3D(0.07, 0.105, 0.089);
    expect(computeElementHint(lm)).toBe("water");
  });

  it("boundary: palmRatio exactly 1.1 is square (not rectangular)", () => {
    // palmHeight / palmWidth = 1.1 exactly → NOT > 1.1 → square palm
    // fingerLength/palmHeight = 0.7 → short fingers → earth
    const lm = makeLandmarks3D(0.08, 0.088, 0.056);
    // palmHeight/palmWidth = 0.088/0.08 = 1.1, not long palm
    expect(computeElementHint(lm)).toBe("earth");
  });

  it("boundary: fingerRatio exactly 0.75 is long fingers", () => {
    // palmHeight/palmWidth = 1.0 → square
    // fingerLength/palmHeight = 0.75 → exactly at boundary → long → air
    const lm = makeLandmarks3D(0.08, 0.08, 0.06);
    // fingerLength/palmHeight = 0.06/0.08 = 0.75 → long fingers
    expect(computeElementHint(lm)).toBe("air");
  });

  it("no aspect ratio correction needed — same 3D coords always yield same result", () => {
    // worldLandmarks are in meters, no pixel aspect ratio distortion
    const lm1 = makeLandmarks3D(0.08, 0.08, 0.056); // earth at 1:1 frame
    const lm2 = makeLandmarks3D(0.08, 0.08, 0.056); // same coords — same result
    expect(computeElementHint(lm1)).toBe(computeElementHint(lm2));
  });
});

describe("validateLandmarks — angleDeg", () => {
  /**
   * Builds a minimal 21-landmark array (NormalizedLandmark) for testing angle.
   * Only WRIST (index 0) and MIDDLE_MCP (index 9) matter for angle computation.
   */
  function makeNormalizedLandmarks(
    wristX: number,
    wristY: number,
    middleMcpX: number,
    middleMcpY: number,
  ): NormalizedLandmark[] {
    const lm: NormalizedLandmark[] = Array.from({ length: 21 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0,
      visibility: 1,
    }));
    lm[0] = { x: wristX, y: wristY, z: 0, visibility: 1 }; // WRIST
    lm[9] = { x: middleMcpX, y: middleMcpY, z: 0, visibility: 1 }; // MIDDLE_MCP
    // THUMB_TIP (4) and PINKY_TIP (20) — place them so isOpen passes
    lm[4] = { x: 0.2, y: 0.4, z: 0, visibility: 1 };
    lm[20] = { x: 0.8, y: 0.4, z: 0, visibility: 1 };
    return lm;
  }

  it("angleDeg ~ 0 for vertical hand (WRIST directly below MIDDLE_MCP)", () => {
    // wrist at (0.5, 0.8), middleMcp at (0.5, 0.4) → dx=0, dy=-0.4 → atan2(|0|, |-0.4|) = 0
    const lm = makeNormalizedLandmarks(0.5, 0.8, 0.5, 0.4);
    const result = validateLandmarks(lm, 1280, 960);
    expect(result.angleDeg).toBeCloseTo(0, 1);
  });

  it("angleDeg ~ 45 for 45-degree tilt", () => {
    // wrist at (0.5, 0.8), middleMcp at (0.9, 0.4) → dx=0.4, dy=-0.4 → atan2(|0.4|,|0.4|) = 45
    const lm = makeNormalizedLandmarks(0.5, 0.8, 0.9, 0.4);
    const result = validateLandmarks(lm, 1280, 960);
    expect(result.angleDeg).toBeCloseTo(45, 1);
  });

  it("angleDeg ~ 90 for horizontal hand (MIDDLE_MCP directly to the side of WRIST)", () => {
    // wrist at (0.5, 0.5), middleMcp at (0.9, 0.5) → dx=0.4, dy=0 → atan2(|0.4|, |0|) = 90
    const lm = makeNormalizedLandmarks(0.5, 0.5, 0.9, 0.5);
    const result = validateLandmarks(lm, 1280, 960);
    expect(result.angleDeg).toBeCloseTo(90, 1);
  });

  it("angleDeg = 0 when no hand present (< 21 landmarks)", () => {
    const lm: NormalizedLandmark[] = Array.from({ length: 20 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0,
      visibility: 1,
    }));
    const result = validateLandmarks(lm, 1280, 960);
    expect(result.angleDeg).toBe(0);
    expect(result.isHandPresent).toBe(false);
  });
});
