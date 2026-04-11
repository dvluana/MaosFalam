import { describe, it, expect, vi, beforeEach } from "vitest";

import { getClerkUser, getClerkUserId } from "../auth";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

const { auth: mockAuth, currentUser: mockCurrentUser } = vi.mocked(
  await import("@clerk/nextjs/server"),
);

describe("getClerkUserId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns userId when authenticated", async () => {
    (mockAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "user_abc123" });
    const result = await getClerkUserId();
    expect(result).toBe("user_abc123");
  });

  it("throws Not authenticated when userId is null", async () => {
    (mockAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });
    await expect(getClerkUserId()).rejects.toThrow("Not authenticated");
  });
});

describe("getClerkUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns id, name, email when authenticated", async () => {
    (mockCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user_abc123",
      firstName: "Ana",
      lastName: "Silva",
      emailAddresses: [{ emailAddress: "ana@test.com" }],
    });
    const result = await getClerkUser();
    expect(result).toEqual({
      id: "user_abc123",
      name: "Ana Silva",
      email: "ana@test.com",
    });
  });

  it("trims name when lastName is empty", async () => {
    (mockCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user_abc123",
      firstName: "Ana",
      lastName: "",
      emailAddresses: [{ emailAddress: "ana@test.com" }],
    });
    const result = await getClerkUser();
    expect(result.name).toBe("Ana");
  });

  it("falls back to empty email when emailAddresses is empty", async () => {
    (mockCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user_abc123",
      firstName: "Ana",
      lastName: "",
      emailAddresses: [],
    });
    const result = await getClerkUser();
    expect(result.email).toBe("");
  });

  it("throws Not authenticated when currentUser returns null", async () => {
    (mockCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(getClerkUser()).rejects.toThrow("Not authenticated");
  });
});
