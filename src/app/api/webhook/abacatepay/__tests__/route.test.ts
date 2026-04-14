import crypto from "node:crypto";

import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "../route";

import type { NextRequest } from "next/server";

// ============================================================
// Mocks
// ============================================================

vi.mock("@/server/lib/abacatepay", () => ({
  verifyWebhookSignature: vi.fn(),
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    payment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/server/lib/resend", () => ({
  sendPaymentConfirmed: vi.fn(),
}));

vi.mock("@/server/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { verifyWebhookSignature } = vi.mocked(await import("@/server/lib/abacatepay"));
const { prisma } = vi.mocked(await import("@/server/lib/prisma"));
const { sendPaymentConfirmed } = vi.mocked(await import("@/server/lib/resend"));

// ============================================================
// Fixed public key (same as in abacatepay.ts)
// ============================================================

const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

// ============================================================
// Helpers
// ============================================================

function makeSignature(body: string): string {
  return crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(Buffer.from(body, "utf8"))
    .digest("base64");
}

function makeWebhookPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "log_test123",
    event: "checkout.completed",
    apiVersion: 2,
    devMode: false,
    data: {
      id: "chk_test456",
      externalId: "payment-uuid-123",
      amount: 1490,
      status: "PAID",
      customerId: "cus_test789",
      payerInformation: {
        method: "PIX",
      },
    },
    ...overrides,
  };
}

function makeWebhookRequest(body: string, signature?: string): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature !== undefined) {
    headers.set("x-webhook-signature", signature);
  }
  return new Request("https://maosfalam.com/api/webhook/abacatepay", {
    method: "POST",
    headers,
    body,
  });
}

const MOCK_PAYMENT = {
  id: "payment-uuid-123",
  clerkUserId: "user_abc",
  readingId: null,
  abacatepayCheckoutId: "chk_test456",
  packType: "avulsa",
  amountCents: 1490,
  method: null,
  status: "pending",
  paidAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ============================================================
// Tests
// ============================================================

describe("POST /api/webhook/abacatepay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (verifyWebhookSignature as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (prisma.userProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  });

  it("returns 401 for invalid signature", async () => {
    (verifyWebhookSignature as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const payload = JSON.stringify(makeWebhookPayload());
    const req = makeWebhookRequest(payload, "invalid-signature");

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(401);
    expect(verifyWebhookSignature).toHaveBeenCalledWith(payload, "invalid-signature");
  });

  it("returns 200 and ignores non-checkout.completed events", async () => {
    const payload = JSON.stringify(makeWebhookPayload({ event: "billing.paid" }));
    const sig = makeSignature(payload);
    const req = makeWebhookRequest(payload, sig);

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);

    // Should NOT look up any payment
    expect(prisma.payment.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when payment not found by externalId or checkoutId", async () => {
    (prisma.payment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.payment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const payload = JSON.stringify(makeWebhookPayload());
    const sig = makeSignature(payload);
    const req = makeWebhookRequest(payload, sig);

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(404);
  });

  it("returns 200 without reprocessing for duplicate webhook (already paid)", async () => {
    (prisma.payment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...MOCK_PAYMENT,
      status: "paid",
    });
    const payload = JSON.stringify(makeWebhookPayload());
    const sig = makeSignature(payload);
    const req = makeWebhookRequest(payload, sig);

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);

    // Should NOT run transaction
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("processes valid checkout.completed: marks paid + creates credit pack", async () => {
    (prisma.payment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_PAYMENT);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => {
        await fn({
          payment: { update: vi.fn() },
          creditPack: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
          reading: { update: vi.fn(), findUnique: vi.fn().mockResolvedValue(null) },
          lead: { update: vi.fn() },
        });
      },
    );

    const payload = JSON.stringify(makeWebhookPayload());
    const sig = makeSignature(payload);
    const req = makeWebhookRequest(payload, sig);

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("extracts payment method from payerInformation.method", async () => {
    const cardPayload = makeWebhookPayload();
    (cardPayload.data as Record<string, unknown>).payerInformation = { method: "CARD" };

    (prisma.payment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_PAYMENT);

    let capturedMethodUpdate: string | undefined;
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => {
        await fn({
          payment: {
            update: vi.fn().mockImplementation((args: { data: { method: string } }) => {
              capturedMethodUpdate = args.data.method;
            }),
          },
          creditPack: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
          reading: { update: vi.fn(), findUnique: vi.fn().mockResolvedValue(null) },
          lead: { update: vi.fn() },
        });
      },
    );

    const payload = JSON.stringify(cardPayload);
    const sig = makeSignature(payload);
    const req = makeWebhookRequest(payload, sig);

    await POST(req as unknown as NextRequest);
    expect(capturedMethodUpdate).toBe("CARD");
  });

  // EMAIL-03: Payment email is transactional — no opt-in gate required
  it("sends payment confirmation email after processing (no opt-in check)", async () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://maosfalam.com";

    (prisma.payment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_PAYMENT);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => {
        await fn({
          payment: { update: vi.fn() },
          creditPack: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
          reading: { update: vi.fn(), findUnique: vi.fn().mockResolvedValue(null) },
          lead: { update: vi.fn() },
        });
      },
    );
    (prisma.userProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      clerkUserId: "user_abc",
      lead: { email: "ana@test.com", name: "Ana" },
    });

    const payload = JSON.stringify(makeWebhookPayload());
    const sig = makeSignature(payload);
    const req = makeWebhookRequest(payload, sig);

    await POST(req as unknown as NextRequest);

    expect(sendPaymentConfirmed).toHaveBeenCalledWith(
      "ana@test.com",
      "Ana",
      "https://maosfalam.com/conta/leituras",
    );
  });
});
