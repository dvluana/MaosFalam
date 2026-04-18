import { beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.resetModules() + dynamic import to get fresh module state per test
describe("photo-store", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("getPhoto returns empty string when nothing stored", async () => {
    const { getPhoto } = await import("@/lib/photo-store");
    expect(getPhoto()).toBe("");
  });

  it("setPhoto stores a base64 string; getPhoto returns it", async () => {
    const { setPhoto, getPhoto } = await import("@/lib/photo-store");
    setPhoto("abc123base64==");
    expect(getPhoto()).toBe("abc123base64==");
  });

  it("getElementHint returns undefined when nothing stored", async () => {
    const { getElementHint } = await import("@/lib/photo-store");
    expect(getElementHint()).toBeUndefined();
  });

  it("setElementHint stores element; getElementHint returns it", async () => {
    const { setElementHint, getElementHint } = await import("@/lib/photo-store");
    setElementHint("fire");
    expect(getElementHint()).toBe("fire");
  });

  it("clearPhotoStore resets both photo and elementHint to null", async () => {
    const { setPhoto, setElementHint, clearPhotoStore, getPhoto, getElementHint } =
      await import("@/lib/photo-store");
    setPhoto("some-photo-data");
    setElementHint("water");
    clearPhotoStore();
    expect(getPhoto()).toBe("");
    expect(getElementHint()).toBeUndefined();
  });

  it("after clearPhotoStore, getPhoto returns empty string", async () => {
    const { setPhoto, clearPhotoStore, getPhoto } = await import("@/lib/photo-store");
    setPhoto("test-data");
    clearPhotoStore();
    expect(getPhoto()).toBe("");
  });
});
