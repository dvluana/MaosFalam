"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
}

function CameraEyebrow({ label }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative flex items-center gap-3"
    >
      <span
        className="h-px w-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
        }}
      />
      <span
        className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
        style={{ fontWeight: 500 }}
      >
        {label}
      </span>
      <span
        className="h-px w-10"
        style={{
          background:
            "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
        }}
      />
    </motion.div>
  );
}

export default CameraEyebrow;
