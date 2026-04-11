"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface WrongHandFeedbackProps {
  expectedHand: "right" | "left";
  visible: boolean;
}

export default function WrongHandFeedback({ expectedHand, visible }: WrongHandFeedbackProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible]);

  const handLabel = expectedHand === "right" ? "direita" : "esquerda";
  const text = `Essa e a outra mao. Me mostra a ${handLabel}.`;

  return (
    <div aria-live="assertive" className="pointer-events-none">
      <AnimatePresence>
        {show && (
          <motion.div
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
