import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    reading: {
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// SEC-03: rate limit for credits/purchase (5/hour by userId) is deferred to v2
// When implemented, test pattern: rateLimit(`user:${userId}`, 5) returns false → 429

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";

import { DELETE } from "./route";

function makeDeleteRequest(body: unknown) {
  return new Request("http://localhost/api/user/account", {
    method: "DELETE",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("DELETE /api/user/account", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("API-10: correct confirmation 'EXCLUIR' soft-deletes all readings and returns { ok: true }", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_test_123" } as Awaited<
      ReturnType<typeof auth>
    >);
    vi.mocked(prisma.reading.updateMany).mockResolvedValue({ count: 3 } as never);

    const res = await DELETE(makeDeleteRequest({ confirm: "EXCLUIR" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(vi.mocked(prisma.reading.updateMany)).toHaveBeenCalledWith({
      where: { clerkUserId: "user_test_123" },
      data: { isActive: false },
    });
  });

  it("returns 400 when confirm is wrong case 'excluir'", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_test_123" } as Awaited<
      ReturnType<typeof auth>
    >);

    const res = await DELETE(makeDeleteRequest({ confirm: "excluir" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(JSON.stringify(json)).toContain("EXCLUIR");
  });

  it("returns 400 when confirm is 'delete'", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_test_123" } as Awaited<
      ReturnType<typeof auth>
    >);

    const res = await DELETE(makeDeleteRequest({ confirm: "delete" }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for empty body {}", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_test_123" } as Awaited<
      ReturnType<typeof auth>
    >);

    const res = await DELETE(makeDeleteRequest({}));

    expect(res.status).toBe(400);
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);

    const res = await DELETE(makeDeleteRequest({ confirm: "EXCLUIR" }));

    expect(res.status).toBe(401);
  });

  it("API-10: updateMany is called with the authenticated user's clerkUserId (user isolation)", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_abc" } as Awaited<
      ReturnType<typeof auth>
    >);
    vi.mocked(prisma.reading.updateMany).mockResolvedValue({ count: 1 } as never);

    await DELETE(makeDeleteRequest({ confirm: "EXCLUIR" }));

    expect(vi.mocked(prisma.reading.updateMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkUserId: "user_abc" } }),
    );
    expect(vi.mocked(prisma.reading.updateMany)).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkUserId: "user_test_123" } }),
    );
  });
});
