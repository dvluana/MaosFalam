import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initiatePurchase } from "@/lib/payment-client";

describe("initiatePurchase", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns checkout_url on success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ checkout_url: "https://abacatepay.com/checkout/abc" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await initiatePurchase("roda");
    expect(result.checkout_url).toBe("https://abacatepay.com/checkout/abc");
  });

  it("sends pack_type in request body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ checkout_url: "https://example.com" }), { status: 200 }),
    );

    await initiatePurchase("roda");

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/credits/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack_type: "roda" }),
    });
  });

  it("includes reading_id when provided", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ checkout_url: "https://example.com" }), { status: 200 }),
    );

    await initiatePurchase("roda", "uuid-123");

    const callBody = JSON.parse(
      (vi.mocked(globalThis.fetch).mock.calls[0]![1] as RequestInit).body as string,
    ) as Record<string, unknown>;
    expect(callBody.reading_id).toBe("uuid-123");
    expect(callBody.pack_type).toBe("roda");
  });

  it("throws error with status prefix on failure", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Nao autenticado" }), { status: 401 }),
    );

    await expect(initiatePurchase("roda")).rejects.toThrow("401: Nao autenticado");
  });

  it("throws fallback message when error body is unparseable", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response("not json", { status: 500 }));

    await expect(initiatePurchase("roda")).rejects.toThrow("500: Erro ao iniciar pagamento");
  });
});
