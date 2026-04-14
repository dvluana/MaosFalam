import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Mocks
// ============================================================

const mockVerify = vi.fn();

vi.mock("svix", () => ({
  Webhook: class MockWebhook {
    verify = mockVerify;
  },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    lead: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/server/lib/resend", () => ({
  sendWelcome: vi.fn(),
}));

vi.mock("@/server/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { prisma } = vi.mocked(await import("@/server/lib/prisma"));
const { sendWelcome } = vi.mocked(await import("@/server/lib/resend"));

import { POST } from "../route";

// ============================================================
// Helpers
// ============================================================

const CLERK_WEBHOOK_SECRET = "whsec_test_secret";

function makeClerkPayload(event: string, overrides: Record<string, unknown> = {}) {
  return {
    type: event,
    data: {
      id: "user_abc123",
      first_name: "Ana",
      last_name: "Silva",
      email_addresses: [{ email_address: "ana@test.com", id: "idn_test", verification: null }],
      ...overrides,
    },
  };
}

function makeRequest(body: string, headers: Record<string, string> = {}) {
  const defaultHeaders: Record<string, string> = {
    "content-type": "application/json",
    "svix-id": "msg_test123",
    "svix-timestamp": String(Math.floor(Date.now() / 1000)),
    "svix-signature": "v1,K5oZfzN95Z3mnHMEudKlafYXIk2TUr3PYqKGPqlfrZ0=",
    ...headers,
  };

  return new Request("https://maosfalam.com/api/webhook/clerk", {
    method: "POST",
    headers: new Headers(defaultHeaders),
    body,
  });
}

// ============================================================
// Tests
// ============================================================

describe("POST /api/webhook/clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = CLERK_WEBHOOK_SECRET;
  });

  it("returns 400 with invalid/missing svix headers", async () => {
    mockVerify.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const payload = JSON.stringify(makeClerkPayload("user.created"));
    const req = makeRequest(payload);

    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 200 without processing non-user.created events", async () => {
    const payload = makeClerkPayload("user.updated");
    const payloadStr = JSON.stringify(payload);
    mockVerify.mockReturnValue(payload);

    const req = makeRequest(payloadStr);
    const res = await POST(req as never);

    expect(res.status).toBe(200);
    expect(prisma.lead.findFirst).not.toHaveBeenCalled();
    expect(sendWelcome).not.toHaveBeenCalled();
  });

  it("sends welcome email when user.created and lead.emailOptIn === true", async () => {
    const payload = makeClerkPayload("user.created");
    const payloadStr = JSON.stringify(payload);
    mockVerify.mockReturnValue(payload);

    (prisma.lead.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "lead_1",
      email: "ana@test.com",
      emailOptIn: true,
    });

    const req = makeRequest(payloadStr);
    const res = await POST(req as never);

    expect(res.status).toBe(200);
    expect(sendWelcome).toHaveBeenCalledWith("ana@test.com", "Ana");
  });

  it("skips email when user.created but lead.emailOptIn === false", async () => {
    const payload = makeClerkPayload("user.created");
    const payloadStr = JSON.stringify(payload);
    mockVerify.mockReturnValue(payload);

    (prisma.lead.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "lead_1",
      email: "ana@test.com",
      emailOptIn: false,
    });

    const req = makeRequest(payloadStr);
    const res = await POST(req as never);

    expect(res.status).toBe(200);
    expect(sendWelcome).not.toHaveBeenCalled();
  });

  it("skips email when user.created but no matching lead found", async () => {
    const payload = makeClerkPayload("user.created");
    const payloadStr = JSON.stringify(payload);
    mockVerify.mockReturnValue(payload);

    (prisma.lead.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = makeRequest(payloadStr);
    const res = await POST(req as never);

    expect(res.status).toBe(200);
    expect(sendWelcome).not.toHaveBeenCalled();
  });
});
