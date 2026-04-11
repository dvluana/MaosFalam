import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    creditPack: {
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/lib/auth", () => ({
  getClerkUserId: vi.fn(),
}));

import { getClerkUserId } from "@/server/lib/auth";
import { prisma } from "@/server/lib/prisma";

import { POST } from "./route";

function makeRequest(body?: unknown) {
  return new NextRequest("http://localhost/api/reading/new", {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

const PACK_UUID_1 = "a1b2c3d4-e5f6-4789-abcd-000000000001";
const PACK_UUID_2 = "a1b2c3d4-e5f6-4789-abcd-000000000002";

const validBody = {
  target_name: "Ana",
  target_gender: "female",
  is_self: true,
};

describe("POST /api/reading/new", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getClerkUserId).mockResolvedValue("user_test_123");

    // Default: $transaction calls the callback with prisma as tx
    vi.mocked(prisma.$transaction).mockImplementation(
      async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma as typeof prisma),
    );
  });

  it("API-05: authenticated user with 1 pack (remaining=1) returns 200 with credits_remaining=0", async () => {
    const mockPack = {
      id: PACK_UUID_1,
      clerkUserId: "user_test_123",
      packType: "avulsa",
      total: 1,
      remaining: 1,
      createdAt: new Date(),
    };

    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue(mockPack as never);
    vi.mocked(prisma.creditPack.update).mockResolvedValue({
      ...mockPack,
      remaining: 0,
    } as never);
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([] as never);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.credits_remaining).toBe(0);
    expect(vi.mocked(prisma.$transaction)).toHaveBeenCalledOnce();
  });

  it("API-05: authenticated user with 2 packs returns 200 with correct credits_remaining after FIFO debit", async () => {
    const oldPack = {
      id: PACK_UUID_1,
      clerkUserId: "user_test_123",
      packType: "avulsa",
      total: 2,
      remaining: 2,
      createdAt: new Date("2026-01-01"),
    };
    const newPack = {
      id: PACK_UUID_2,
      clerkUserId: "user_test_123",
      packType: "roda",
      total: 5,
      remaining: 1,
      createdAt: new Date("2026-02-01"),
    };

    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue(oldPack as never);
    vi.mocked(prisma.creditPack.update).mockResolvedValue({
      ...oldPack,
      remaining: 1,
    } as never);
    // After debit: oldPack has 1 remaining, newPack has 1 remaining → total 2
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([
      { ...oldPack, remaining: 1 },
      newPack,
    ] as never);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.credits_remaining).toBe(2);
  });

  it("API-05: FIFO order — findFirst called with orderBy: { createdAt: 'asc' }", async () => {
    const mockPack = {
      id: PACK_UUID_1,
      clerkUserId: "user_test_123",
      packType: "avulsa",
      total: 1,
      remaining: 1,
      createdAt: new Date(),
    };

    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue(mockPack as never);
    vi.mocked(prisma.creditPack.update).mockResolvedValue({
      ...mockPack,
      remaining: 0,
    } as never);
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([] as never);

    await POST(makeRequest(validBody));

    expect(vi.mocked(prisma.creditPack.findFirst)).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "asc" } }),
    );
  });

  it("API-05: credit debit updates remaining to pack.remaining - 1", async () => {
    const mockPack = {
      id: PACK_UUID_1,
      clerkUserId: "user_test_123",
      packType: "roda",
      total: 5,
      remaining: 3,
      createdAt: new Date(),
    };

    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue(mockPack as never);
    vi.mocked(prisma.creditPack.update).mockResolvedValue({
      ...mockPack,
      remaining: 2,
    } as never);
    vi.mocked(prisma.creditPack.findMany).mockResolvedValue([
      { ...mockPack, remaining: 2 },
    ] as never);

    await POST(makeRequest(validBody));

    expect(vi.mocked(prisma.creditPack.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { remaining: 2 } }),
    );
  });

  it("API-05: user with no packs returns 402 with error 'Sem creditos'", async () => {
    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(402);
    expect(json.error).toBe("Sem creditos");
  });

  it("API-05: unauthenticated request returns 401", async () => {
    vi.mocked(getClerkUserId).mockRejectedValue(new Error("Not authenticated"));

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Nao autenticado");
  });

  it("API-05: invalid body (missing target_name) returns 400", async () => {
    const { target_name: _t, ...bodyWithout } = validBody;

    const res = await POST(makeRequest(bodyWithout));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Dados invalidos");
  });
});
