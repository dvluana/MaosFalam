"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CameraFeedbackProps {
  text: string;
}

export default function CameraFeedback({ text }: CameraFeedbackProps) {
  return (
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
  );
}
