"use client";

import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

import type { Category, NormalizedLandmark } from "@mediapipe/tasks-vision";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";

/**
 * Loads the MediaPipe Hand Landmarker model.
 * Call once per camera session; store result in a ref.
 */
export async function loadHandLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  const landmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  return landmarker;
}

/**
 * Result of landmark validation for a single detected hand.
 */
export interface ValidLandmarkResult {
  isHandPresent: boolean;
  isOpen: boolean;
  isCentered: boolean;
  detectedHandedness: "Left" | "Right";
}

// Landmark indices (MediaPipe 21-point hand model)
const WRIST = 0;
const THUMB_TIP = 4;
const MIDDLE_MCP = 9;
const PINKY_TIP = 20;

/**
 * Euclidean distance between two normalized landmarks (x, y only).
 */
function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Validates hand landmarks for quality/positioning checks.
 * detectedHandedness is passed separately from the HandLandmarker handedness result.
 */
export function validateLandmarks(
  landmarks: NormalizedLandmark[],
  _frameWidth: number,
  _frameHeight: number,
): Omit<ValidLandmarkResult, "detectedHandedness"> {
  const isHandPresent = landmarks.length >= 21;

  if (!isHandPresent) {
    return { isHandPresent: false, isOpen: false, isCentered: false };
  }

  // isOpen: spread between THUMB_TIP and PINKY_TIP must be > 0.35 * palm height
  const palmHeight = dist(landmarks[WRIST], landmarks[MIDDLE_MCP]);
  const fingerSpread = dist(landmarks[THUMB_TIP], landmarks[PINKY_TIP]);
  const isOpen = fingerSpread > 0.35 * palmHeight;

  // isCentered: both WRIST and MIDDLE_MCP within normalized bounds
  const wrist = landmarks[WRIST];
  const middleMcp = landmarks[MIDDLE_MCP];
  const isCentered =
    wrist.x >= 0.15 &&
    wrist.x <= 0.85 &&
    wrist.y >= 0.1 &&
    wrist.y <= 0.9 &&
    middleMcp.x >= 0.15 &&
    middleMcp.x <= 0.85 &&
    middleMcp.y >= 0.1 &&
    middleMcp.y <= 0.9;

  return { isHandPresent, isOpen, isCentered };
}

/**
 * Extracts handedness label from MediaPipe Category array.
 *
 * IMPORTANT: MediaPipe assumes MIRRORED input (front/selfie camera).
 * - Front camera (mirrored): "Right" from MediaPipe = user's RIGHT hand
 * - Back camera (not mirrored): "Right" from MediaPipe = user's LEFT hand
 *
 * The caller (useCameraPipeline) is responsible for mapping based on camera mode.
 */
export function detectHandedness(handedness: Category[]): "Left" | "Right" {
  const label = handedness[0]?.categoryName;
  return label === "Left" ? "Left" : "Right";
}

/**
 * Captures a video frame to a canvas and returns raw base64 JPEG.
 * If mirrored (front camera), the canvas is un-mirrored so GPT-4o sees the natural orientation.
 */
export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  mirrored: boolean,
): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();
  if (mirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0);
  ctx.restore();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  // Strip data URI prefix, return raw base64
  return dataUrl.replace(/^data:image\/jpeg;base64,/, "");
}
