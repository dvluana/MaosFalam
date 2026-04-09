"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  active: boolean;
}

function CaptureFlash({ active }: Props) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(232,223,208,0.9), transparent 70%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default CaptureFlash;
