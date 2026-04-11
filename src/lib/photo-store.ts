// Ephemeral in-memory store for the captured palm photo.
// Lives for the duration of a single reading attempt (camera → scan).
// Cleared on camera page mount and after scan reads it.
// Survives Next.js App Router soft navigation (client-side route changes do not re-evaluate modules).

type HandElement = "fire" | "water" | "earth" | "air";

let _photo: string | null = null;
let _elementHint: HandElement | null = null;

export function setPhoto(base64: string): void {
  _photo = base64;
}

export function getPhoto(): string {
  return _photo ?? "";
}

export function setElementHint(hint: HandElement): void {
  _elementHint = hint;
}

export function getElementHint(): HandElement | undefined {
  return _elementHint ?? undefined;
}

export function clearPhotoStore(): void {
  _photo = null;
  _elementHint = null;
}
