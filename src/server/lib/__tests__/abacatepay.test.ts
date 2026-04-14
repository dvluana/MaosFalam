import crypto from "node:crypto";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ============================================================
// Fixed public key (same as in abacatepay.ts)
// ============================================================

const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

// ============================================================
// Mock logger (abacatepay.ts imports it)
// ============================================================

vi.mock("@/server/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// ============================================================
// verifyWebhookSignature tests (pure crypto, no mocks needed)
// ============================================================

describe("verifyWebhookSignature", () => {
  // Dynamic import to get fresh module per describe
  let verifyWebhookSignature: (rawBody: string, signatureFromHeader: string) => boolean;

  beforeEach(async () => {
    const mod = await import("../abacatepay");
    verifyWebhookSignature = mod.verifyWebhookSignature;
  });

  it("returns true for valid HMAC-SHA256 base64 signature", () => {
    const body = JSON.stringify({ event: "checkout.completed", data: { id: "chk_test" } });
    const validSig = crypto
      .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
      .update(Buffer.from(body, "utf8"))
      .digest("base64");

    expect(verifyWebhookSignature(body, validSig)).toBe(true);
  });

  it("returns false for invalid signature", () => {
    const body = JSON.stringify({ event: "checkout.completed" });
    expect(verifyWebhookSignature(body, "invalidsig")).toBe(false);
  });

  it("returns false for empty signature", () => {
    const body = JSON.stringify({ event: "checkout.completed" });
    expect(verifyWebhookSignature(body, "")).toBe(false);
  });

  it("returns false for hex digest (confirms base64 is required)", () => {
    const body = JSON.stringify({ event: "checkout.completed", data: { id: "chk_test" } });
    const hexSig = crypto
      .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
      .update(Buffer.from(body, "utf8"))
      .digest("hex");

    // hex digest should NOT match (v2 requires base64)
    expect(verifyWebhookSignature(body, hexSig)).toBe(false);
  });
});

// ============================================================
// createCustomer tests (mock fetch)
// ============================================================

describe("createCustomer", () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ABACATEPAY_API_KEY = "test_key";
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("calls /v2/customers/create with email only", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: "cus_test123" }, error: null, success: true }),
    });

    const { createCustomer } = await import("../abacatepay");
    const result = await createCustomer("ana@test.com");

    expect(result).toBe("cus_test123");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v2/customers/create");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body as string) as { email: string; name?: string };
    expect(body.email).toBe("ana@test.com");
    expect(body.name).toBeUndefined();
  });

  it("includes name when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: "cus_test456" }, error: null, success: true }),
    });

    const { createCustomer } = await import("../abacatepay");
    await createCustomer("ana@test.com", "Ana Silva");

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as { email: string; name: string };
    expect(body.name).toBe("Ana Silva");
  });
});

// ============================================================
// createCheckout tests (mock fetch)
// ============================================================

describe("createCheckout", () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ABACATEPAY_API_KEY = "test_key";
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("calls /v2/checkouts/create with items, methods PIX+CARD, and externalId", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { id: "chk_test789", url: "https://pay.abacatepay.com/chk_test789" },
          error: null,
          success: true,
        }),
    });

    const { createCheckout } = await import("../abacatepay");
    const result = await createCheckout({
      productId: "prod_abc",
      customerId: "cus_xyz",
      externalId: "payment-uuid-123",
      returnUrl: "https://maosfalam.com/creditos",
      completionUrl: "https://maosfalam.com/conta/leituras?purchased=1",
    });

    expect(result).toEqual({
      id: "chk_test789",
      url: "https://pay.abacatepay.com/chk_test789",
    });

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v2/checkouts/create");

    const body = JSON.parse(options.body as string) as {
      items: Array<{ id: string; quantity: number }>;
      methods: string[];
      externalId: string;
      customerId: string;
    };
    expect(body.items).toEqual([{ id: "prod_abc", quantity: 1 }]);
    expect(body.methods).toEqual(["PIX", "CARD"]);
    expect(body.externalId).toBe("payment-uuid-123");
    expect(body.customerId).toBe("cus_xyz");
  });
});

// ============================================================
// resolveProductId tests (mock fetch + cache)
// ============================================================

describe("resolveProductId", () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ABACATEPAY_API_KEY = "test_key";
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetches product by externalId on first call", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { id: "prod_avulsa_123", externalId: "mf_avulsa", name: "MaosFalam Avulsa" },
          error: null,
          success: true,
        }),
    });

    // Use dynamic import to get fresh module per test
    // Note: resolveProductId caches, so the second test depends on this one having run
    const { resolveProductId } = await import("../abacatepay");
    const result = await resolveProductId("avulsa");

    expect(result).toBe("prod_avulsa_123");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("/v2/products/get");
    expect(url).toContain("externalId=mf_avulsa");
  });

  it("returns cached product ID on second call without fetching", async () => {
    // First call was already made in previous test (module-level cache)
    // The cache persists across tests within same module import
    const { resolveProductId } = await import("../abacatepay");

    // This should use cached value, no fetch needed
    const result = await resolveProductId("avulsa");
    expect(result).toBe("prod_avulsa_123");

    // mockFetch should NOT have been called in THIS test
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
