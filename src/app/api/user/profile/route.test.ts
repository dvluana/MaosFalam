import { currentUser } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

import { GET, PUT } from "./route";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

const mockClerkUser = {
  id: "user_test_123",
  firstName: "Ana",
  lastName: "Lima",
  emailAddresses: [{ emailAddress: "ana@example.com" }],
} as Awaited<ReturnType<typeof currentUser>>;

describe("GET /api/user/profile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("API-08: authenticated with DB profile returns merged Clerk + DB data", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser);
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
      clerkUserId: "user_test_123",
      cpf: "12345678901",
      phone: "11999990000",
      createdAt: new Date(),
    } as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      clerk_user_id: "user_test_123",
      name: "Ana Lima",
      email: "ana@example.com",
      cpf: "12345678901",
      phone: "11999990000",
    });
  });

  it("API-08: authenticated with no DB profile returns cpf and phone as null", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser);
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.cpf).toBeNull();
    expect(json.phone).toBeNull();
    expect(json.name).toBe("Ana Lima");
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/user/profile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("API-09: valid body upserts profile and returns { ok: true }", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser);
    vi.mocked(prisma.userProfile.upsert).mockResolvedValue({} as never);

    const req = new Request("http://localhost/api/user/profile", {
      method: "PUT",
      body: JSON.stringify({ cpf: "12345678901", phone: "11999990000" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(vi.mocked(prisma.userProfile.upsert)).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkUserId: "user_test_123" } }),
    );
  });

  it("API-09: partial update with only cpf calls upsert without phone in update", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser);
    vi.mocked(prisma.userProfile.upsert).mockResolvedValue({} as never);

    const req = new Request("http://localhost/api/user/profile", {
      method: "PUT",
      body: JSON.stringify({ cpf: "12345678901" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req);

    expect(res.status).toBe(200);
    const upsertCall = vi.mocked(prisma.userProfile.upsert).mock.calls[0];
    expect(upsertCall).toBeDefined();
    const updateData = upsertCall[0].update;
    expect(updateData).not.toHaveProperty("phone");
    expect(updateData).toHaveProperty("cpf", "12345678901");
  });

  it("returns 400 for invalid body (cpf too short)", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser);

    const req = new Request("http://localhost/api/user/profile", {
      method: "PUT",
      body: JSON.stringify({ cpf: "123" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req);

    expect(res.status).toBe(400);
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);

    const req = new Request("http://localhost/api/user/profile", {
      method: "PUT",
      body: JSON.stringify({ cpf: "12345678901" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req);

    expect(res.status).toBe(401);
  });

  it("SEC-07: logger.info is not called with cpf or phone values", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser);
    vi.mocked(prisma.userProfile.upsert).mockResolvedValue({} as never);

    const req = new Request("http://localhost/api/user/profile", {
      method: "PUT",
      body: JSON.stringify({ cpf: "12345678901", phone: "11999990000" }),
      headers: { "Content-Type": "application/json" },
    });

    await PUT(req);

    expect(vi.mocked(logger.info)).not.toHaveBeenCalledWith(
      expect.objectContaining({ cpf: expect.anything() }),
      expect.anything(),
    );
    expect(vi.mocked(logger.info)).not.toHaveBeenCalledWith(
      expect.objectContaining({ phone: expect.anything() }),
      expect.anything(),
    );
  });
});
