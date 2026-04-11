"use client";

import { useCallback, useState } from "react";

export interface FailureCounterResult {
  failureCount: number;
  /** true when failureCount >= 3 — suggests switching input method */
  suggestMethodSwitch: boolean;
  recordFailure: () => void;
  resetFailures: () => void;
}

/**
 * Counts validation/capture failures across both camera and upload flows.
 * When failureCount reaches 3, suggestMethodSwitch flips to true so the UI
 * can nudge the user to try the other input method.
 */
export function useFailureCounter(): FailureCounterResult {
  const [failureCount, setFailureCount] = useState(0);

  const recordFailure = useCallback(() => setFailureCount((n) => n + 1), []);
  const resetFailures = useCallback(() => setFailureCount(0), []);

  return {
    failureCount,
    suggestMethodSwitch: failureCount >= 3,
    recordFailure,
    resetFailures,
  };
}
