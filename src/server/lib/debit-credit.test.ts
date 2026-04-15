import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    creditPack: {
      findFirst: vi.fn(),
    },
    $queryRawUnsafe: vi.fn(),
  },
}));

import { prisma } from "@/server/lib/prisma";

import { debitCreditFIFO } from "./debit-credit";

const PACK_ID_1 = "aaaaaaaa-0000-4000-8000-000000000001";
const PACK_ID_2 = "aaaaaaaa-0000-4000-8000-000000000002";
const USER_ID = "user_clerk_test_001";

describe("debitCreditFIFO", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("CREDIT-03: returns { debited: true, packId } when user has a pack with remaining > 0", async () => {
    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue({
      id: PACK_ID_1,
      clerkUserId: USER_ID,
      packType: "avulsa",
      total: 1,
      remaining: 1,
      paymentId: null,
      createdAt: new Date(),
    });

    vi.mocked(prisma.$queryRawUnsafe).mockResolvedValue([{ id: PACK_ID_1 }] as never);

    const result = await debitCreditFIFO(USER_ID);

    expect(result.debited).toBe(true);
    expect(result.packId).toBe(PACK_ID_1);
  });

  it("CREDIT-03: returns { debited: false } when user has no packs", async () => {
    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue(null);

    const result = await debitCreditFIFO(USER_ID);

    expect(result.debited).toBe(false);
    expect(result.packId).toBeUndefined();
  });

  it("CREDIT-03: returns { debited: false } when all packs have remaining = 0", async () => {
    // findFirst with remaining > 0 returns null when all are 0
    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue(null);

    const result = await debitCreditFIFO(USER_ID);

    expect(result.debited).toBe(false);
  });

  it("CREDIT-03: raw SQL UPDATE uses WHERE remaining > 0 to prevent race condition", async () => {
    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue({
      id: PACK_ID_1,
      clerkUserId: USER_ID,
      packType: "avulsa",
      total: 1,
      remaining: 1,
      paymentId: null,
      createdAt: new Date(),
    });

    vi.mocked(prisma.$queryRawUnsafe).mockResolvedValue([{ id: PACK_ID_1 }] as never);

    await debitCreditFIFO(USER_ID);

    expect(prisma.$queryRawUnsafe).toHaveBeenCalledOnce();
    const [sql] = vi.mocked(prisma.$queryRawUnsafe).mock.calls[0] as [string, ...unknown[]];
    // Verify SQL contains atomic decrement guard
    expect(sql).toMatch(/remaining\s*>\s*0/i);
    // Verify it's an UPDATE statement
    expect(sql).toMatch(/UPDATE/i);
    // Verify it uses parameterized query (not string concatenation)
    expect(sql).toMatch(/\$1/);
  });

  it("CREDIT-03: picks the oldest pack first (FIFO - orderBy createdAt asc)", async () => {
    const olderDate = new Date("2026-01-01");
    const newerDate = new Date("2026-06-01");

    // findFirst is called with orderBy createdAt asc — verify it's called correctly
    vi.mocked(prisma.creditPack.findFirst).mockResolvedValue({
      id: PACK_ID_1, // oldest pack
      clerkUserId: USER_ID,
      packType: "roda",
      total: 5,
      remaining: 3,
      paymentId: null,
      createdAt: olderDate,
    });

    vi.mocked(prisma.$queryRawUnsafe).mockResolvedValue([{ id: PACK_ID_1 }] as never);

    // Simulate a second pack exists but the older one is returned
    const result = await debitCreditFIFO(USER_ID);

    // Verify findFirst was called with FIFO ordering
    expect(prisma.creditPack.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "asc" },
      }),
    );

    expect(result.packId).toBe(PACK_ID_1);
    // Ensure newerDate pack was not selected
    expect(result.packId).not.toBe(PACK_ID_2);

    // suppress unused variable warning
    void newerDate;
  });

  it("CREDIT-03: retries once when race condition detected (0 rows affected)", async () => {
    // First findFirst: returns pack
    // Second findFirst (retry): returns null (no more credits)
    vi.mocked(prisma.creditPack.findFirst)
      .mockResolvedValueOnce({
        id: PACK_ID_1,
        clerkUserId: USER_ID,
        packType: "avulsa",
        total: 1,
        remaining: 1,
        paymentId: null,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce(null); // retry finds nothing

    // First UPDATE: 0 rows affected (another request took the credit)
    vi.mocked(prisma.$queryRawUnsafe).mockResolvedValue([] as never);

    const result = await debitCreditFIFO(USER_ID);

    // Should have called findFirst twice (original + retry)
    expect(prisma.creditPack.findFirst).toHaveBeenCalledTimes(2);
    // Final result: debited: false (no credits left after retry)
    expect(result.debited).toBe(false);
  });
});
