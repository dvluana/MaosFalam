"use client";

import { useEffect, useState } from "react";

/**
 * Detects landscape orientation and listens for changes.
 * Returns true when window.innerWidth > window.innerHeight.
 * Also attempts to lock orientation to portrait (silently ignored if unsupported).
 */
export function useLandscapeGuard(): boolean {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    function isMobile() {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    function check() {
      setIsLandscape(isMobile() && window.innerWidth > window.innerHeight);
    }

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    // Attempt to lock orientation — silently ignored if unsupported
    // screen.orientation.lock is experimental; cast to avoid TS error
    (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })
      ?.lock?.("portrait")
      .catch(() => {});

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return isLandscape;
}
