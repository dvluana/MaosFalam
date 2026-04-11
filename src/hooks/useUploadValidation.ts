import { useCallback, useRef, useState } from "react";

import { detectHandedness, validateLandmarks } from "@/lib/mediapipe";
import { normalizeImage } from "@/lib/normalize-image";

import type { Category, NormalizedLandmark } from "@mediapipe/tasks-vision";

// ============================================================
// Types
// ============================================================

export type CheckStatus = "pending" | "running" | "pass" | "fail" | "skip";

export interface ValidationCheck {
  id: "format" | "size" | "hand_detected" | "handedness" | "palm_open";
  label: string;
  status: CheckStatus;
  detail?: string;
}

export interface ValidationResult {
  phase: "idle" | "validating" | "done";
  checks: ValidationCheck[];
  previewUrl: string | null;
  file: File | null;
  handOk: boolean;
  qualityOk: boolean;
  canProceed: boolean;
  error: string | null;
}

// ============================================================
// Constants
// ============================================================

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_SIZE_BYTES = 15 * 1024 * 1024;

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";

const INITIAL_CHECKS: ValidationCheck[] = [
  { id: "format", label: "Formato aceito", status: "pending" },
  { id: "size", label: "Tamanho ok", status: "pending" },
  { id: "hand_detected", label: "Mão na foto", status: "pending" },
  { id: "handedness", label: "Mão correta", status: "pending" },
  { id: "palm_open", label: "Palma aberta", status: "pending" },
];

const INITIAL: ValidationResult = {
  phase: "idle",
  checks: INITIAL_CHECKS,
  previewUrl: null,
  file: null,
  handOk: false,
  qualityOk: false,
  canProceed: false,
  error: null,
};

// ============================================================
// Screenshot detection (local helper, not exported)
// ============================================================

// Known iPhone/Android screenshot widths (logical pixels, common 2022+ models)
const SCREENSHOT_WIDTHS = new Set([1170, 1179, 1284, 1290, 1080, 828, 750, 1242]);

/**
 * Returns true if the file looks like a phone screenshot:
 * exact match to a known device pixel width AND tall aspect ratio (h/w > 1.8).
 */
async function checkIfScreenshot(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const aspectRatio = h / w;
      resolve(SCREENSHOT_WIDTHS.has(w) && aspectRatio > 1.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

// ============================================================
// Hook
// ============================================================

/**
 * Validates an uploaded hand photo through 5 progressive checks:
 * 1. Format (JPEG/PNG/WebP/HEIC accepted; GIF/SVG/BMP/PDF rejected)
 *    + screenshot detection (after format pass)
 * 2. Size (max 15MB)
 * 3. Hand detected (MediaPipe, skipped if unavailable)
 * 4. Correct hand (matches dominantHand param)
 * 5. Palm open (quality check, non-fatal)
 */
export function useUploadValidation(dominantHand: "right" | "left"): {
  result: ValidationResult;
  validate: (file: File) => Promise<void>;
  reset: () => void;
} {
  const [result, setResult] = useState<ValidationResult>(INITIAL);
  const previewUrlRef = useRef<string | null>(null);

  // ============================================================
  // updateCheck helper — patches a single check by id
  // ============================================================
  const updateCheck = useCallback(
    (id: ValidationCheck["id"], patch: Partial<Omit<ValidationCheck, "id">>) => {
      setResult((prev) => ({
        ...prev,
        checks: prev.checks.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    },
    [],
  );

  // ============================================================
  // validate
  // ============================================================
  const validate = useCallback(
    async (file: File) => {
      // Normalize: HEIC→JPEG, EXIF correction, compress to max 1280px
      const normalizedFile = await normalizeImage(file);

      // Reset to validating state
      const previewUrl = URL.createObjectURL(normalizedFile);
      previewUrlRef.current = previewUrl;

      setResult({
        phase: "validating",
        checks: INITIAL_CHECKS.map((c) => ({ ...c })),
        previewUrl,
        file: normalizedFile,
        handOk: false,
        qualityOk: false,
        canProceed: false,
        error: null,
      });

      // ----------------------------------------------------------
      // CHECK 1 — Format
      // ----------------------------------------------------------
      updateCheck("format", { status: "running" });

      const typeLabel = normalizedFile.type.split("/")[1]?.toUpperCase() ?? "UNKNOWN";

      if (!ACCEPTED_TYPES.has(normalizedFile.type)) {
        updateCheck("format", { status: "fail" });
        setResult((prev) => ({
          ...prev,
          phase: "done",
          error: "Preciso de uma foto. JPG, PNG, WebP ou HEIC.",
        }));
        return;
      }

      updateCheck("format", { status: "pass", detail: typeLabel });

      // ----------------------------------------------------------
      // Screenshot detection — after format pass, before size check
      // Common phone screenshots have exact device pixel widths + tall aspect ratio
      // ----------------------------------------------------------
      const screenshotDetected = await checkIfScreenshot(normalizedFile);
      if (screenshotDetected) {
        updateCheck("format", { status: "fail" });
        setResult((prev) => ({
          ...prev,
          phase: "done",
          error: "Isso parece um print, não uma foto. Preciso ver sua mão de verdade.",
        }));
        return;
      }

      // ----------------------------------------------------------
      // CHECK 2 — Size
      // ----------------------------------------------------------
      updateCheck("size", { status: "running" });

      if (normalizedFile.size > MAX_SIZE_BYTES) {
        updateCheck("size", { status: "fail" });
        setResult((prev) => ({
          ...prev,
          phase: "done",
          error: "A foto é muito grande. Use uma menor que 15MB.",
        }));
        return;
      }

      const sizeMb = (normalizedFile.size / (1024 * 1024)).toFixed(1);
      updateCheck("size", { status: "pass", detail: `${sizeMb} MB` });

      // ----------------------------------------------------------
      // CHECK 3 — Hand detected (MediaPipe, IMAGE mode)
      // ----------------------------------------------------------
      updateCheck("hand_detected", { status: "running" });

      let landmarks: NormalizedLandmark[] = [];
      let handednessCategories: Category[] = [];
      let mediapipeLoaded = false;

      try {
        // Dynamic import to avoid SSR issues
        const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");

        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Load image element
        const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = previewUrl;
        });

        const detection = landmarker.detect(imgEl);
        landmarks = detection.landmarks[0] ?? [];
        handednessCategories = detection.handedness[0] ?? [];
        mediapipeLoaded = true;

        landmarker.close();
      } catch {
        // MediaPipe failed to load — skip checks 3, 4, 5
        updateCheck("hand_detected", { status: "skip" });
        updateCheck("handedness", { status: "skip" });
        updateCheck("palm_open", { status: "skip" });

        // canProceed=true so user can still proceed without MediaPipe
        setResult((prev) => ({
          ...prev,
          phase: "done",
          handOk: true,
          qualityOk: false,
          canProceed: true,
        }));
        return;
      }

      if (!mediapipeLoaded || landmarks.length === 0) {
        updateCheck("hand_detected", { status: "fail" });
        updateCheck("handedness", { status: "skip" });
        updateCheck("palm_open", { status: "skip" });
        setResult((prev) => ({
          ...prev,
          phase: "done",
          error: "Não encontrei uma mão na foto. Tente de novo.",
        }));
        return;
      }

      updateCheck("hand_detected", { status: "pass" });

      // ----------------------------------------------------------
      // CHECK 4 — Handedness (correct hand)
      // Only executes if check 3 passed
      // ----------------------------------------------------------
      updateCheck("handedness", { status: "running" });

      // For uploads (NOT mirrored): MediaPipe "Right" = real right, "Left" = real left
      const detectedLabel = detectHandedness(handednessCategories);
      const detectedSide = detectedLabel === "Right" ? "right" : "left";
      let handOk = false;

      if (detectedSide !== dominantHand) {
        const wrongName = dominantHand === "right" ? "esquerda" : "direita";
        const rightName = dominantHand === "right" ? "direita" : "esquerda";
        updateCheck("handedness", { status: "fail" });
        // Still run palm_open check
        updateCheck("palm_open", { status: "running" });

        const loadedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = previewUrl;
        });

        const { isOpen } = validateLandmarks(
          landmarks,
          loadedImg.naturalWidth,
          loadedImg.naturalHeight,
        );
        updateCheck("palm_open", { status: isOpen ? "pass" : "fail" });

        setResult((prev) => ({
          ...prev,
          phase: "done",
          handOk: false,
          qualityOk: isOpen,
          canProceed: false,
          error: `Essa é a mão ${wrongName}. Me manda a ${rightName}.`,
        }));
        return;
      }

      updateCheck("handedness", { status: "pass" });
      handOk = true;

      // ----------------------------------------------------------
      // CHECK 5 — Palm open (quality, non-fatal)
      // Executes even if check 4 would have failed — but since we
      // return early above on handedness fail, this only runs when
      // hand is correct.
      // ----------------------------------------------------------
      updateCheck("palm_open", { status: "running" });

      const imgForPalmCheck = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = previewUrl;
      });

      const { isOpen } = validateLandmarks(
        landmarks,
        imgForPalmCheck.naturalWidth,
        imgForPalmCheck.naturalHeight,
      );

      updateCheck("palm_open", { status: isOpen ? "pass" : "fail" });

      const qualityOk = isOpen;

      setResult((prev) => ({
        ...prev,
        phase: "done",
        handOk,
        qualityOk,
        canProceed: handOk,
        error: null,
      }));
    },
    [dominantHand, updateCheck],
  );

  // ============================================================
  // reset
  // ============================================================
  const reset = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setResult(INITIAL);
  }, []);

  return { result, validate, reset };
}
