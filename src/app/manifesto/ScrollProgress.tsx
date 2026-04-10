"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const h = document.body.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? `${((window.scrollY / h) * 100).toFixed(1)}%` : "0%";
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 z-[100] h-px w-0"
      style={{
        background:
          "linear-gradient(90deg, rgba(201,162,74,0.4), rgba(201,162,74,0.9), rgba(201,162,74,0.4))",
        transition: "width 0.1s linear",
      }}
    />
  );
}
