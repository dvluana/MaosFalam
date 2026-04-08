/**
 * Prefixa uma frase de impacto com o nome da pessoa em vocativo.
 * Se a frase já contém o nome, retorna sem mudança.
 * Se não há nome, retorna a frase original.
 */
export function personalize(phrase: string, name: string | null): string {
  if (!name) return phrase;
  const trimmed = name.trim();
  if (!trimmed) return phrase;
  if (phrase.toLowerCase().includes(trimmed.toLowerCase())) return phrase;
  return `${trimmed}. ${phrase}`;
}

export function readStoredName(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("maosfalam_name");
}
