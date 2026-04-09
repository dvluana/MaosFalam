import { useEffect } from "react";
import type { CamState } from "@/types/camera";

interface Params {
  state: CamState;
  forced: boolean;
  setState: (s: CamState) => void;
  onCaptured: () => void;
}

/**
 * Simulação do pipeline da câmera. Enquanto o backend de visão não existe,
 * a transição entre estados é baseada em timers. TODO: substituir por
 * MediaPipe real + detecção de landmarks quando integrar com o backend.
 */
export default function useCameraPipeline({
  state,
  forced,
  setState,
  onCaptured,
}: Params): void {
  useEffect(() => {
    if (forced) return;
    if (state !== "loading_mediapipe") return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setState("camera_active_no_hand"), 1500));
    timers.push(setTimeout(() => setState("camera_hand_detected"), 3500));
    timers.push(setTimeout(() => setState("camera_stable"), 5500));
    timers.push(
      setTimeout(() => {
        setState("camera_capturing");
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(120);
        }
      }, 7000),
    );
    timers.push(setTimeout(onCaptured, 7500));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forced]);
}
