"use client";

// ============================================================
// normalizeImage — HEIC→JPEG + EXIF correction + compression
//
// Runs 3 steps in sequence before any validation or upload:
//   1. HEIC/HEIF → JPEG via heic2any (Edge-01)
//   2. EXIF rotation correction via createImageBitmap (Edge-02)
//   3. Resize to max 1280px + JPEG 0.85 compression (Edge-03)
// ============================================================

function isHeic(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  );
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(result) ? result[0] : (result as Blob);
  const outputName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([blob], outputName, { type: "image/jpeg" });
}

async function correctExifAndCompress(file: File): Promise<File> {
  // createImageBitmap applies EXIF orientation automatically in modern browsers
  if (typeof createImageBitmap === "undefined") {
    // SSR or very old browser — return file unchanged
    return file;
  }

  const bitmap = await createImageBitmap(file);

  const maxWidth = 1280;
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const blob = await (await fetch(dataUrl)).blob();

  const outputName = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], outputName, { type: "image/jpeg" });
}

/**
 * Normalizes a hand photo before validation and upload:
 * - Converts HEIC/HEIF to JPEG (iPhone photos)
 * - Corrects EXIF rotation via createImageBitmap
 * - Resizes to max 1280px wide at JPEG 0.85 quality
 *
 * Returns a new File ready for validation checks.
 */
export async function normalizeImage(file: File): Promise<File> {
  // Step 1: HEIC → JPEG
  const afterHeic = isHeic(file) ? await convertHeicToJpeg(file) : file;

  // Steps 2 + 3: EXIF correction + compress/resize (combined in one canvas pass)
  return correctExifAndCompress(afterHeic);
}
