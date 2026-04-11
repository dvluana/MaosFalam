import { useEffect } from "react";

import type { CamState } from "@/types/camera";

interface Params {
  state: CamState;
  forced: boolean;
  setState: (s: CamState) => void;
  onCaptured: (photoBase64: string) => void;
}

/**
 * Simulação do pipeline da câmera. Transição entre estados baseada em timers.
 * Phase 3 (MP-02): substituir por MediaPipe Hand Landmarker real com detecção de landmarks.
 */
export default function useCameraPipeline({ state, forced, setState, onCaptured }: Params): void {
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
    // Dev placeholder: minimal valid JPEG base64 (1x1 white pixel, ~600 bytes)
    // In production, this will be replaced by real MediaPipe canvas capture
    const DEV_PHOTO =
      "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYI4Q/SFhSRFJiMzNkg6JjggQyHhMSD/9oADAMBAAIRAxEAPwC1RRRQAf/Z";
    timers.push(setTimeout(() => onCaptured(DEV_PHOTO), 7500));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forced]);
}
