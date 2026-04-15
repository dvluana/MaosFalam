"use client";

import { AnimatePresence, motion } from "framer-motion";

interface LandscapeWarningProps {
  visible: boolean;
}

export default function LandscapeWarning({ visible }: LandscapeWarningProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="landscape-warning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-8"
        >
          <p className="font-cormorant italic text-[28px] text-bone text-center leading-snug mb-3">
            Vira o celular pra vertical.
          </p>
          <p className="font-raleway text-[13px] text-bone-dim text-center">
            Preciso ver sua mão com clareza.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
