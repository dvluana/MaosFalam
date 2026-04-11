import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    reading: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/lib/auth", () => ({
  getClerkUserId: vi.fn(),
}));

import { getClerkUserId } from "@/server/lib/auth";
import { prisma } from "@/server/lib/prisma";

import { GET } from "./route";

const READING_UUID_1 = "c1b2c3d4-e5f6-4789-abcd-000000000001";
const READING_UUID_2 = "c1b2c3d4-e5f6-4789-abcd-000000000002";

describe("GET /api/user/readings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getClerkUserId).mockResolvedValue("user_test_123");
  });

  it("API-07: 2 active readings returns both in response", async () => {
    vi.mocked(prisma.reading.findMany).mockResolvedValue([
      {
        id: READING_UUID_1,
        clerkUserId: "user_test_123",
        targetName: "Ana",
        tier: "premium",
        report: { element: "fire", sections: [] },
        isActive: true,
        createdAt: new Date("2026-02-01"),
      },
      {
        id: READING_UUID_2,
        clerkUserId: "user_test_123",
        targetName: "Maria",
        tier: "free",
        report: { element: "water", sections: [] },
        isActive: true,
        createdAt: new Date("2026-01-01"),
      },
    ] as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.readings).toHaveLength(2);
  });

  it("API-07: response uses snake_case keys (target_name, created_at)", async () => {
    vi.mocked(prisma.reading.findMany).mockResolvedValue([
      {
        id: READING_UUID_1,
        clerkUserId: "user_test_123",
        targetName: "Ana",
        tier: "free",
        report: { element: "fire", sections: [] },
        isActive: true,
        createdAt: new Date("2026-01-15"),
      },
    ] as never);

    const res = await GET();
    const json = await res.json();

    expect(json.readings[0]).toMatchObject({
      id: READING_UUID_1,
      target_name: "Ana",
      tier: "free",
    });
    expect(json.readings[0].target_name).toBeDefined();
    expect(json.readings[0].created_at).toBeDefined();
    expect(json.readings[0].targetName).toBeUndefined();
  });

  it("API-07: Prisma filtered by clerkUserId and isActive=true", async () => {
    vi.mocked(prisma.reading.findMany).mockResolvedValue([] as never);

    await GET();

    expect(vi.mocked(prisma.reading.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkUserId: "user_test_123", isActive: true },
      }),
    );
  });

  it("API-07: 0 readings returns empty array", async () => {
    vi.mocked(prisma.reading.findMany).mockResolvedValue([] as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.readings).toEqual([]);
  });

  it("API-07: unauthenticated request returns 401", async () => {
    vi.mocked(getClerkUserId).mockRejectedValue(new Error("Not authenticated"));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Nao autenticado");
  });
});
