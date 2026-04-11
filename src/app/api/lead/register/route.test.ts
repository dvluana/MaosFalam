import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks must be declared before imports that use them (hoisted by vitest)
vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    lead: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(true),
}));

import { prisma } from "@/server/lib/prisma";
import { rateLimit } from "@/server/lib/rate-limit";

import { POST } from "./route";

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/lead/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
  });
}

const validBody = {
  name: "Ana",
  email: "ana@test.com",
  gender: "female",
  session_id: "sess_1234567890",
  email_opt_in: false,
};

describe("POST /api/lead/register", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(rateLimit).mockReturnValue(true);
    vi.mocked(prisma.lead.create).mockResolvedValue({
      id: "lead-uuid-1234",
      name: "Ana",
      email: "ana@test.com",
      gender: "female",
      sessionId: "sess_1234567890",
      emailOptIn: false,
      clerkUserId: null,
      source: "organic",
      converted: false,
      createdAt: new Date(),
    } as never);
  });

  it("API-01: valid body returns 201 with lead_id", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.lead_id).toBeDefined();
    expect(typeof json.lead_id).toBe("string");
  });

  it("SEC-06: missing name field returns 400", async () => {
    const { name: _name, ...bodyWithoutName } = validBody;
    const res = await POST(makeRequest(bodyWithoutName));

    expect(res.status).toBe(400);
  });

  it("SEC-06: invalid email format returns 400", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "notanemail" }));

    expect(res.status).toBe(400);
  });

  it("SEC-06: session_id shorter than 10 chars returns 400", async () => {
    const res = await POST(makeRequest({ ...validBody, session_id: "short" }));

    expect(res.status).toBe(400);
  });

  it("SEC-02: rateLimit returning false yields 429", async () => {
    vi.mocked(rateLimit).mockReturnValue(false);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(429);
  });

  it("returns 500 when Prisma throws an unexpected error", async () => {
    vi.mocked(prisma.lead.create).mockRejectedValue(new Error("DB connection lost"));

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(500);
  });
});
