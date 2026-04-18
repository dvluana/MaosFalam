"use client";

import { AnimatePresence, motion } from "framer-motion";

interface CameraFeedbackProps {
  text: string;
  /**
   * When provided (0.0–1.0), shows a countdown progress bar below the text.
   * Used during camera_stable to give visual feedback before capture.
   */
  stabilityProgress?: number;
}

export default function CameraFeedback({ text, stabilityProgress }: CameraFeedbackProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5 }}
          className="font-cormorant italic text-lg text-bone text-center max-w-xs"
        >
          {text}
        </motion.p>
      </AnimatePresence>

      {stabilityProgress !== undefined && (
        <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#C9A24A] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(stabilityProgress * 100)}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}
