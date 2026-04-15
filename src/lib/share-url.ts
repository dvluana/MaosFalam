export function buildShareUrl(readingId: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/compartilhar/${readingId}`;
}
