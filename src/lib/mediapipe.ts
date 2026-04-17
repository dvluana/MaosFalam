"use client";

import { DrawingUtils, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

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
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;
const PINKY_MCP = 17;
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
type HandElement = "fire" | "water" | "earth" | "air";

/**
 * Computes hand element type from MediaPipe normalized landmarks.
 * Uses palm aspect ratio (palmHeight/palmWidth) and finger-to-palm length ratio.
 * Returns undefined if landmarks are insufficient or geometry is degenerate.
 *
 * AUTHORITATIVE source for element classification on the camera path.
 * GPT-4o element is only used as fallback for the upload path (no MediaPipe).
 */
export function computeElementHint(landmarks: NormalizedLandmark[]): HandElement | undefined {
  if (landmarks.length < 21) return undefined;

  const palmWidth = dist(landmarks[INDEX_MCP], landmarks[PINKY_MCP]); // INDEX_MCP → PINKY_MCP
  const palmHeight = dist(landmarks[WRIST], landmarks[MIDDLE_MCP]); // WRIST → MIDDLE_MCP
  const fingerLength = dist(landmarks[MIDDLE_MCP], landmarks[MIDDLE_TIP]); // MIDDLE_MCP → MIDDLE_TIP

  if (palmWidth < 0.01 || palmHeight < 0.01) return undefined;

  const isLongPalm = palmHeight / palmWidth > 1.1;
  const isLongFingers = fingerLength / palmHeight > 0.95;

  if (!isLongPalm && isLongFingers) return "air";
  if (!isLongPalm && !isLongFingers) return "earth";
  if (isLongPalm && !isLongFingers) return "fire";
  return "water";
}

export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  mirrored: boolean,
  quality = 0.82,
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

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  // Strip data URI prefix, return raw base64
  return dataUrl.replace(/^data:image\/jpeg;base64,/, "");
}

// Hand connections for DrawingUtils — { start, end } format
const HAND_CONNECTIONS = [
  // Thumb
  { start: 0, end: 1 },
  { start: 1, end: 2 },
  { start: 2, end: 3 },
  { start: 3, end: 4 },
  // Index
  { start: 0, end: 5 },
  { start: 5, end: 6 },
  { start: 6, end: 7 },
  { start: 7, end: 8 },
  // Middle
  { start: 5, end: 9 },
  { start: 9, end: 10 },
  { start: 10, end: 11 },
  { start: 11, end: 12 },
  // Ring
  { start: 9, end: 13 },
  { start: 13, end: 14 },
  { start: 14, end: 15 },
  { start: 15, end: 16 },
  // Pinky
  { start: 13, end: 17 },
  { start: 0, end: 17 },
  { start: 17, end: 18 },
  { start: 18, end: 19 },
  { start: 19, end: 20 },
];

/**
 * Draws hand landmarks and connections on a visible overlay canvas.
 * Called every frame in the detection loop for real-time feedback.
 */
export function drawHandLandmarks(
  canvas: HTMLCanvasElement,
  landmarks: NormalizedLandmark[],
  videoWidth: number,
  videoHeight: number,
): void {
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (landmarks.length < 21) return;

  const drawingUtils = new DrawingUtils(ctx);

  drawingUtils.drawConnectors(landmarks, HAND_CONNECTIONS, {
    color: "rgba(201, 162, 74, 0.7)",
    lineWidth: 2,
  });

  drawingUtils.drawLandmarks(landmarks, {
    color: "rgba(201, 162, 74, 0.9)",
    fillColor: "rgba(201, 162, 74, 0.4)",
    lineWidth: 1,
    radius: 3,
  });
}

/**
 * Clears the landmark overlay canvas.
 */
export function clearLandmarkCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
