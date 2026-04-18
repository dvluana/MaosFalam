"use client";

import { useEffect, useRef } from "react";

import {
  captureFrame,
  clearLandmarkCanvas,
  detectHandedness,
  drawHandLandmarks,
  loadHandLandmarker,
  validateLandmarks,
} from "@/lib/mediapipe";
import { loadReadingContext } from "@/lib/reading-context";
import type { CamState } from "@/types/camera";

import type { HandLandmarker } from "@mediapipe/tasks-vision";
import type React from "react";

// States where the detection rAF loop should run
const DETECTION_STATES: ReadonlySet<CamState> = new Set([
  "camera_active_no_hand",
  "camera_hand_detected",
  "camera_adjusting",
  "camera_wrong_hand",
  "camera_stable",
]);

// Stability duration before auto-capture (ms)
const STABILITY_MS = 1500;
// Delay after entering camera_stable before capturing (ms)
const STABLE_TO_CAPTURE_DELAY_MS = 500;
// Max frame-to-frame movement (normalized coords) to be considered "still"
const JITTER_THRESHOLD = 0.025;
// Number of consecutive frames that must be still to confirm stability
const STABLE_FRAMES_REQUIRED = 5;
// Max hand tilt angle (degrees) — above this triggers camera_adjusting
const MAX_ANGLE_DEG = 45;

interface Params {
  state: CamState;
  forced: boolean;
  setState: (s: CamState) => void;
  onCaptured: (photoBase64: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Canvas for drawing landmark overlay in real-time */
  landmarkCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Called when the camera stream is established with whether the video is mirrored (front camera). */
  onMirroredChange?: (mirrored: boolean) => void;
  /** Preferred facing mode. Defaults to "environment" (back camera). */
  preferredFacing?: "environment" | "user";
  /** Increment to force camera re-initialization (e.g., on camera switch). */
  cameraKey?: number;
}

/**
 * Real camera pipeline using MediaPipe Hand Landmarker.
 *
 * Lifecycle:
 *   loading_mediapipe → getUserMedia + loadHandLandmarker
 *     → camera_active_no_hand
 *     → (detect loop) → camera_hand_detected / camera_adjusting / camera_wrong_hand
 *     → camera_stable (1.5s of valid + still frames, element samples collected)
 *     → camera_capturing → onCaptured(base64)
 *
 * forced=true skips all logic (dev preview mode).
 */
export default function useCameraPipeline({
  state,
  forced,
  setState,
  onCaptured,
  videoRef,
  canvasRef,
  landmarkCanvasRef,
  onMirroredChange,
  preferredFacing,
  cameraKey,
}: Params): void {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const mirroredRef = useRef<boolean>(false);
  const dominantHandRef = useRef<"left" | "right">("right");
  const stabilityStartRef = useRef<number | null>(null);
  const capturedRef = useRef<boolean>(false);
  const stateRef = useRef<CamState>(state);

  // Jitter detection: tracks WRIST and MIDDLE_MCP positions across frames
  const landmarkHistoryRef = useRef<
    Array<{ wristX: number; wristY: number; middleX: number; middleY: number }>
  >([]);
  // Keep stateRef in sync so the rAF callback reads fresh state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ============================================================
  // Phase: loading_mediapipe — open camera + load model
  // ============================================================
  useEffect(() => {
    if (forced) return;
    if (state !== "loading_mediapipe") return;

    let cancelled = false;

    async function init() {
      // Load ReadingContext to get dominant_hand
      const ctx = loadReadingContext();
      dominantHandRef.current = ctx?.dominant_hand ?? "right";

      // Request camera — prefer back camera (environment) unless overridden
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: preferredFacing ?? "environment",
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setState("camera_permission_denied");
        } else {
          setState("camera_error_generic");
        }
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      // Detect whether the camera is front-facing (mirrored)
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings();
      mirroredRef.current = settings?.facingMode === "user";
      onMirroredChange?.(mirroredRef.current);

      // Attach stream to video element
      const video = videoRef.current;
      if (!video) {
        setState("camera_error_generic");
        return;
      }
      video.srcObject = stream;

      // Wait for video to be ready to play
      await new Promise<void>((resolve, reject) => {
        if (!video) {
          reject(new Error("no video"));
          return;
        }
        video.oncanplay = () => resolve();
        video.onerror = () => reject(new Error("video error"));
      }).catch(() => null);

      if (cancelled) return;

      try {
        video.play().catch(() => null);
      } catch {
        // ignore
      }

      // Load HandLandmarker in parallel (already started streaming)
      let landmarker: HandLandmarker;
      try {
        landmarker = await loadHandLandmarker();
      } catch {
        if (cancelled) return;
        setState("camera_error_generic");
        return;
      }

      if (cancelled) {
        landmarker.close();
        return;
      }

      landmarkerRef.current = landmarker;
      setState("camera_active_no_hand");
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [forced, cameraKey, state, preferredFacing, setState, onMirroredChange, videoRef]);

  // ============================================================
  // Detection loop — runs while in detection states
  // ============================================================
  useEffect(() => {
    if (forced) return;
    if (!DETECTION_STATES.has(state)) return;

    const landmarker = landmarkerRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!landmarker || !video || !canvas) return;

    /**
     * Returns true if the landmark history shows the hand is not jittering.
     * Requires >= STABLE_FRAMES_REQUIRED entries and all frame-to-frame deltas
     * below JITTER_THRESHOLD.
     */
    function isHandStill(): boolean {
      const history = landmarkHistoryRef.current;
      if (history.length < STABLE_FRAMES_REQUIRED) return false;
      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1];
        const curr = history[i];
        const maxDelta = Math.max(
          Math.abs(curr.wristX - prev.wristX),
          Math.abs(curr.wristY - prev.wristY),
          Math.abs(curr.middleX - prev.middleX),
          Math.abs(curr.middleY - prev.middleY),
        );
        if (maxDelta > JITTER_THRESHOLD) return false;
      }
      return true;
    }

    /** Resets all stability and jitter buffers. */
    function resetBuffers() {
      stabilityStartRef.current = null;
      landmarkHistoryRef.current = [];
    }

    function loop() {
      const currentState = stateRef.current;
      if (!DETECTION_STATES.has(currentState)) return;

      const vid = videoRef.current;
      const can = canvasRef.current;
      const lm = landmarkerRef.current;

      if (!vid || !can || !lm || vid.readyState < 2) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const result = lm.detectForVideo(vid, performance.now());
      const hasHand = result.landmarks.length > 0 && result.handednesses.length > 0;

      // Draw landmarks overlay in real-time
      const lmCanvas = landmarkCanvasRef.current;
      if (lmCanvas) {
        if (hasHand) {
          drawHandLandmarks(lmCanvas, result.landmarks[0], vid.videoWidth, vid.videoHeight);
        } else {
          clearLandmarkCanvas(lmCanvas);
        }
      }

      if (!hasHand) {
        // No hand visible — reset all buffers and go to no_hand
        resetBuffers();
        if (currentState !== "camera_active_no_hand") {
          setState("camera_active_no_hand");
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      // ---- Handedness check ----
      // MediaPipe assumes mirrored (selfie/front camera) input by default.
      // Front camera (mirrored=true): labels map directly to user's hand.
      // Back camera (mirrored=false): labels are inverted — MediaPipe "Left" = user's right hand.
      // (Upload/photo path inverts separately — see useUploadValidation.)
      const rawHandedness = detectHandedness(result.handednesses[0]);
      // Handedness inversion temporarily disabled for debugging
      const userHandedness: "left" | "right" = rawHandedness === "Left" ? "left" : "right";

      const expectedHand = dominantHandRef.current;
      if (userHandedness !== expectedHand) {
        resetBuffers();
        if (currentState !== "camera_wrong_hand") {
          setState("camera_wrong_hand");
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      // ---- Landmark validation (screen-space checks) ----
      const { isOpen, isCentered, angleDeg } = validateLandmarks(
        result.landmarks[0],
        vid.videoWidth,
        vid.videoHeight,
      );

      // ---- Angle check ----
      if (angleDeg > MAX_ANGLE_DEG) {
        resetBuffers();
        if (currentState !== "camera_adjusting") {
          setState("camera_adjusting");
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      if (!isOpen || !isCentered) {
        resetBuffers();
        if (currentState !== "camera_adjusting") {
          setState("camera_adjusting");
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      // ---- Valid frame: update landmark history for jitter detection ----
      const wrist = result.landmarks[0][0];
      const middleMcp = result.landmarks[0][9];
      const history = landmarkHistoryRef.current;
      history.push({
        wristX: wrist.x,
        wristY: wrist.y,
        middleX: middleMcp.x,
        middleY: middleMcp.y,
      });
      if (history.length > STABLE_FRAMES_REQUIRED) {
        history.splice(0, history.length - STABLE_FRAMES_REQUIRED);
      }

      // ---- Jitter check ----
      if (!isHandStill()) {
        // Hand is moving — reset stability timer but keep jitter history accumulating
        stabilityStartRef.current = null;
        if (currentState !== "camera_hand_detected") {
          setState("camera_hand_detected");
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      // ---- Stability accumulation ----
      const now = Date.now();

      if (stabilityStartRef.current === null) {
        stabilityStartRef.current = now;
        if (currentState !== "camera_hand_detected") {
          setState("camera_hand_detected");
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const elapsed = now - stabilityStartRef.current;

      if (elapsed < STABILITY_MS) {
        if (currentState !== "camera_hand_detected") {
          setState("camera_hand_detected");
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      // ---- Stable — enter camera_stable then capture ----
      if (capturedRef.current) return; // prevent duplicate captures

      if (currentState !== "camera_stable") {
        setState("camera_stable");
      }

      // Wait a short delay after stable, then capture
      setTimeout(() => {
        if (capturedRef.current) return;
        capturedRef.current = true;

        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c) return;

        setState("camera_capturing");

        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(120);
        }

        const base64 = captureFrame(v, c, mirroredRef.current);
        onCaptured(base64);
      }, STABLE_TO_CAPTURE_DELAY_MS);
    }

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, forced]);

  // ============================================================
  // Cleanup on unmount
  // ============================================================
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);
}
