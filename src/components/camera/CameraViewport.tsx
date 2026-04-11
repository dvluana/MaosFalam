"use client";

import { motion } from "framer-motion";
import type React from "react";

import type { CamState } from "@/types/camera";
import { isFrameActive } from "@/types/camera";

interface Props {
  state: CamState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mirrored: boolean;
}

type CornerVertical = "top" | "bottom";
type CornerHorizontal = "left" | "right";
const CORNERS: ReadonlyArray<readonly [CornerVertical, CornerHorizontal]> = [
  ["top", "left"],
  ["top", "right"],
  ["bottom", "left"],
  ["bottom", "right"],
];

// States where the hand is in frame — hide the center crosshair target indicator
const HAND_IN_FRAME_STATES: ReadonlySet<CamState> = new Set([
  "camera_hand_detected",
  "camera_adjusting",
  "camera_wrong_hand",
  "camera_stable",
]);

function CameraViewport({ state, videoRef, canvasRef, mirrored }: Props) {
  const frameActive = isFrameActive(state);
  const showCrosshair = !HAND_IN_FRAME_STATES.has(state);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="relative"
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
          className="absolute inset-0 w-full h-full object-cover rounded-[inherit]"
          style={{
            transform: mirrored ? "scaleX(-1)" : "none",
            opacity: state === "loading_mediapipe" ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* Hidden canvas used only for frame capture */}
        <canvas ref={canvasRef} aria-hidden className="hidden" />

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

        {showCrosshair && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="relative"
              animate={{ opacity: state === "loading_mediapipe" ? 0.3 : 0.6 }}
              transition={{ duration: 0.8 }}
            >
              <span
                className="absolute left-1/2 top-0 w-px h-16 -translate-x-1/2 -translate-y-full"
                style={{
                  background: "linear-gradient(180deg, transparent, rgba(201,162,74,0.45))",
                }}
              />
              <span
                className="absolute left-1/2 bottom-0 w-px h-16 -translate-x-1/2 translate-y-full"
                style={{
                  background: "linear-gradient(0deg, transparent, rgba(201,162,74,0.45))",
                }}
              />
              <span
                className="absolute top-1/2 left-0 h-px w-16 -translate-y-1/2 -translate-x-full"
                style={{
                  background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.45))",
                }}
              />
              <span
                className="absolute top-1/2 right-0 h-px w-16 -translate-y-1/2 translate-x-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.45))",
                }}
              />
              <motion.span
                className="block w-2 h-2 rotate-45 bg-gold"
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: frameActive ? [1, 1.3, 1] : [1, 1.1, 1],
                }}
                transition={{
                  duration: frameActive ? 1.2 : 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ boxShadow: "0 0 10px rgba(201,162,74,0.6)" }}
              />
            </motion.div>
          </div>
        )}

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
      </motion.div>
    </div>
  );
}

export default CameraViewport;
