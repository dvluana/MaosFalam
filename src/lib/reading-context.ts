import type { ReadingContext } from "@/types/reading-context";

const STORAGE_KEY = "maosfalam_reading_context";

export function saveReadingContext(ctx: ReadingContext): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
}

export function loadReadingContext(): ReadingContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReadingContext;
  } catch {
    return null;
  }
}

export function clearReadingContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
