import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    creditPack: {
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

const PACK_UUID_1 = "b1b2c3d4-e5f6-4789-abcd-000000000001";
const PACK_UUID_2 = "b1b2c3d4-e5f6-4789-abcd-000000000002";

describe("GET /api/user/credits", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getClerkUserId).mockResolvedValue("user_test_123");
  });

  it("API-06: 2 packs (remaining=3, remaining=2) returns balance=5 and packs array length=2", async () => {
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([
      {
        id: PACK_UUID_1,
        clerkUserId: "user_test_123",
        packType: "roda",
        total: 5,
        remaining: 3,
        createdAt: new Date(),
      },
      {
        id: PACK_UUID_2,
        clerkUserId: "user_test_123",
        packType: "avulsa",
        total: 1,
        remaining: 2,
        createdAt: new Date(),
      },
    ] as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.balance).toBe(5);
    expect(json.packs).toHaveLength(2);
  });

  it("API-06: packs response uses snake_case keys (pack_type, created_at)", async () => {
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([
      {
        id: PACK_UUID_1,
        clerkUserId: "user_test_123",
        packType: "roda",
        total: 5,
        remaining: 3,
        createdAt: new Date("2026-01-01"),
      },
    ] as never);

    const res = await GET();
    const json = await res.json();

    expect(json.packs[0]).toMatchObject({
      id: PACK_UUID_1,
      pack_type: "roda",
      total: 5,
      remaining: 3,
    });
    expect(json.packs[0].pack_type).toBeDefined();
    expect(json.packs[0].created_at).toBeDefined();
  });

  it("API-06: no packs returns balance=0 and empty packs array", async () => {
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([] as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.balance).toBe(0);
    expect(json.packs).toEqual([]);
  });

  it("API-06: pack with remaining=0 contributes 0 to balance (Math.max guard)", async () => {
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([
      {
        id: PACK_UUID_1,
        clerkUserId: "user_test_123",
        packType: "avulsa",
        total: 1,
        remaining: 0,
        createdAt: new Date(),
      },
    ] as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.balance).toBe(0);
    expect(json.packs).toHaveLength(1);
  });

  it("API-06: unauthenticated request returns 401", async () => {
    vi.mocked(getClerkUserId).mockRejectedValue(new Error("Not authenticated"));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Nao autenticado");
  });
});
