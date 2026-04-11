"use client";

import { useEffect, useState } from "react";

import { readStoredName } from "@/lib/personalize";

export default function useStoredName(fallbackName: string | null = null): string | null {
  const [name, setName] = useState<string | null>(fallbackName);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedName = readStoredName();
      if (storedName) {
        setName(storedName);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return name;
}
