"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "section";
}

export default function FadeUp({ children, className = "", style, as: Tag = "div" }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
            e.target.classList.remove("opacity-0", "translate-y-5");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`opacity-0 translate-y-5 transition-all duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
