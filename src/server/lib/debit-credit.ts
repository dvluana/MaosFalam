import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

const MAX_RETRIES = 3;

interface DebitResult {
  debited: boolean;
  packId?: string;
}

/**
 * Debits 1 credit from the oldest pack with remaining > 0 (FIFO).
 *
 * Uses raw SQL UPDATE with WHERE remaining > 0 to eliminate the
 * read-then-write race condition that Prisma $transaction with
 * Read Committed isolation cannot prevent.
 *
 * The CHECK constraint on credit_packs.remaining >= 0 at DB level
 * provides a second safety layer.
 *
 * @param clerkUserId - The Clerk user ID to debit credits from
 * @param _retryCount - Internal: tracks recursion depth (max MAX_RETRIES)
 */
export async function debitCreditFIFO(clerkUserId: string, _retryCount = 0): Promise<DebitResult> {
  if (_retryCount >= MAX_RETRIES) {
    logger.warn({ clerkUserId, retries: _retryCount }, "Credit debit max retries reached");
    return { debited: false };
  }

  // Find oldest pack with remaining > 0 (FIFO ordering)
  const pack = await prisma.creditPack.findFirst({
    where: { clerkUserId, remaining: { gt: 0 } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!pack) {
    return { debited: false };
  }

  // Atomic decrement — WHERE remaining > 0 prevents going negative even under
  // concurrent requests. If another request already decremented this pack to 0
  // between our findFirst and this UPDATE, we get 0 rows back and retry.
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `UPDATE credit_packs SET remaining = remaining - 1 WHERE id = $1 AND remaining > 0 RETURNING id`,
    pack.id,
  );

  if (rows.length === 0) {
    // Race condition: pack was decremented by another request. Retry with next pack.
    logger.info(
      { clerkUserId, packId: pack.id, retry: _retryCount + 1 },
      "Credit debit race detected, retrying",
    );
    return debitCreditFIFO(clerkUserId, _retryCount + 1);
  }

  return { debited: true, packId: pack.id };
}
