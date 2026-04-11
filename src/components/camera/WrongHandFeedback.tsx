"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface WrongHandFeedbackProps {
  expectedHand: "right" | "left";
  visible: boolean;
}

/**
 * Non-blocking toast shown when the wrong hand is detected.
 * Auto-hides after 3s. Driven by AnimatePresence + internal counter.
 */
export default function WrongHandFeedback({ expectedHand, visible }: WrongHandFeedbackProps) {
  // showCount increments each time visible transitions to true.
  // This lets us key AnimatePresence entries so repeated wrong-hand detections
  // re-trigger the animation without calling setState in an effect.
  const [showCount, setShowCount] = useState(0);
  const [hidden, setHidden] = useState(true);
  const prevVisibleRef = useRef(false);

  // Detect rising edge of visible without calling setState inside an effect
  if (visible && !prevVisibleRef.current) {
    prevVisibleRef.current = true;
    // Increment outside of effect — this is a render-time update (allowed in React 18)
    setShowCount((c) => c + 1);
    setHidden(false);
  } else if (!visible) {
    prevVisibleRef.current = false;
  }

  useEffect(() => {
    if (hidden) return;

    const timer = setTimeout(() => {
      setHidden(true);
    }, 3000);

    return () => clearTimeout(timer);
    // Re-run when a new show is triggered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCount]);

  const handLabel = expectedHand === "right" ? "direita" : "esquerda";
  const text = `Essa e a outra mao. Me mostra a ${handLabel}.`;

  return (
    <div aria-live="assertive" className="pointer-events-none">
      <AnimatePresence>
        {!hidden && (
          <motion.div
            key={showCount}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-sm w-full px-6 py-4 z-50"
            style={{
              background: "rgba(17,12,26,0.9)",
              borderRadius: "0 6px 0 6px",
            }}
          >
            <p
              className="font-cormorant italic text-bone text-center"
              style={{ fontSize: "16px", letterSpacing: "0.02em", lineHeight: "1.4" }}
            >
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
