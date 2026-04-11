"use client";

import { motion } from "framer-motion";

import { isFrameActive } from "@/types/camera";
import type { CamState } from "@/types/camera";

import HandExpectedBadge from "./HandExpectedBadge";

import type React from "react";

interface Props {
  state: CamState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  landmarkCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  mirrored: boolean;
  dominantHand: "right" | "left";
  targetName?: string;
  onSwitchCamera?: () => void;
}

type CornerVertical = "top" | "bottom";
type CornerHorizontal = "left" | "right";
const CORNERS: ReadonlyArray<readonly [CornerVertical, CornerHorizontal]> = [
  ["top", "left"],
  ["top", "right"],
  ["bottom", "left"],
  ["bottom", "right"],
];

function CameraViewport({
  state,
  videoRef,
  canvasRef,
  landmarkCanvasRef,
  mirrored,
  dominantHand,
  targetName,
  onSwitchCamera,
}: Props) {
  const frameActive = isFrameActive(state);
  const showBadge = state !== "loading_mediapipe" && state !== "camera_capturing";

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="relative overflow-hidden"
        animate={{ scale: state === "camera_capturing" ? 0.98 : 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{
          width: "min(280px, 75vw)",
          aspectRatio: "3 / 4",
          background: "linear-gradient(180deg, rgba(14,10,24,0.3), rgba(14,10,24,0.55))",
          border: frameActive
            ? "1px solid rgba(201,162,74,0.55)"
            : "1px solid rgba(201,162,74,0.18)",
          transition: "border-color 0.5s",
          boxShadow: frameActive
            ? "0 0 60px rgba(201,162,74,0.22), 0 28px 56px -16px rgba(0,0,0,0.9)"
            : "0 28px 56px -16px rgba(0,0,0,0.85)",
        }}
      >
        {/* Live camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: mirrored ? "scaleX(-1)" : "none",
            opacity: state === "loading_mediapipe" ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* Landmark overlay canvas — draws skeleton in real-time */}
        <canvas
          ref={landmarkCanvasRef}
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            transform: mirrored ? "scaleX(-1)" : "none",
          }}
        />

        {/* Hidden canvas used only for frame capture */}
        <canvas ref={canvasRef} aria-hidden className="hidden" />

        {/* HandExpectedBadge — top-left inside viewport */}
        {showBadge && (
          <div className="absolute top-3 left-3 z-10">
            <HandExpectedBadge dominantHand={dominantHand} targetName={targetName} />
          </div>
        )}

        {/* Corner brackets */}
        {CORNERS.map(([v, h]) => (
          <motion.span
            key={`${v}-${h}`}
            aria-hidden
            className="absolute"
            animate={{
              width: frameActive ? 22 : 16,
              height: frameActive ? 22 : 16,
              opacity: frameActive ? 1 : 0.6,
            }}
            transition={{ duration: 0.5 }}
            style={{
              [v]: -1,
              [h]: -1,
              borderColor: frameActive ? "rgba(201,162,74,0.85)" : "rgba(201,162,74,0.4)",
              borderStyle: "solid",
              borderWidth: `${v === "top" ? "2px" : "0"} ${h === "right" ? "2px" : "0"} ${v === "bottom" ? "2px" : "0"} ${h === "left" ? "2px" : "0"}`,
            }}
          />
        ))}

        {/* Scan line when stable */}
        {state === "camera_stable" && (
          <motion.div
            className="absolute inset-x-0 h-px pointer-events-none"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.8), transparent)",
              boxShadow: "0 0 12px rgba(201,162,74,0.7)",
            }}
          />
        )}

        {/* Camera switch button — bottom-right of viewport */}
        {onSwitchCamera && (
          <button
            type="button"
            onClick={onSwitchCamera}
            aria-label="Alternar entre câmera frontal e traseira"
            className="absolute bottom-3 right-3 z-10 flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              border: "1px solid rgba(201,162,74,0.08)",
              borderRadius: "0 4px 0 4px",
              background: "rgba(0,0,0,0.4)",
              color: "var(--color-bone, #E8DFD0)",
              cursor: "pointer",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20 7H4" />
              <path d="M4 7l4-4" />
              <path d="M4 7l4 4" />
              <path d="M4 17h16" />
              <path d="M20 17l-4-4" />
              <path d="M20 17l-4 4" />
            </svg>
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default CameraViewport;
