import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    reading: {
      create: vi.fn(),
    },
    lead: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/server/lib/openai", () => ({
  analyzeHand: vi.fn(),
}));

vi.mock("@/server/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(true),
}));

vi.mock("@/server/lib/resend", () => ({
  sendLeadReading: vi.fn(),
}));

vi.mock("@/server/lib/select-blocks", () => ({
  selectBlocks: vi.fn().mockReturnValue({ element: "fire", sections: [] }),
}));

vi.mock("@/server/lib/debit-credit", () => ({
  debitCreditFIFO: vi.fn().mockResolvedValue({ debited: false }),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
}));

import { debitCreditFIFO } from "@/server/lib/debit-credit";
import { analyzeHand } from "@/server/lib/openai";
import { prisma } from "@/server/lib/prisma";
import { rateLimit } from "@/server/lib/rate-limit";
import { sendLeadReading } from "@/server/lib/resend";
import { selectBlocks } from "@/server/lib/select-blocks";
import type { HandAttributes } from "@/types/hand-attributes";

import { POST } from "./route";

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/reading/capture", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
  });
}

const validAttributes: HandAttributes = {
  primary_type: "C",
  secondary_type: "none",
  type_reasoning: "C:4 A:1 B:1 D:1",
  element: "fire",
  heart: { variation: "long_straight", modifiers: [] },
  head: { variation: "medium_curved", modifiers: [] },
  life: { variation: "long_deep" },
  fate: { variation: "absent" },
  venus: { mount: "pronounced", cinturao: false },
  mounts: {
    jupiter: "normal",
    saturn: "flat",
    apollo: "pronounced",
    mercury: "normal",
    mars: "flat",
    moon: "normal",
  },
  rare_signs: {
    star_jupiter: false,
    mystic_cross: false,
    ring_solomon: false,
    sun_line: false,
    intuition_line: false,
    protection_marks: false,
  },
  confidence: 0.85,
};

const LEAD_UUID = "24771be2-3e5c-4267-b3a1-40353d9dbd66";
const READING_UUID = "c3090e5a-3316-4ad7-8798-2eceb23a2ed0";

const validLead = {
  id: LEAD_UUID,
  name: "Ana",
  email: "ana@test.com",
  gender: "female",
  sessionId: "sess_1234567890",
  emailOptIn: false,
  clerkUserId: null,
  source: "organic",
  converted: false,
  createdAt: new Date(),
};

const validReading = {
  id: READING_UUID,
  leadId: LEAD_UUID,
  sessionId: "sess_1234567890",
  targetName: "Ana",
  targetGender: "female",
  isSelf: true,
  attributes: {},
  report: { element: "fire", sections: [] },
  tier: "free",
  confidence: 0.85,
  isActive: true,
  clerkUserId: null,
  createdAt: new Date(),
};

const validBody = {
  photo_base64: "a".repeat(200), // min 100 chars
  session_id: "sess_1234567890",
  lead_id: LEAD_UUID,
  target_name: "Ana",
  target_gender: "female",
  is_self: true,
};

describe("POST /api/reading/capture", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(rateLimit).mockReturnValue(true);
    vi.mocked(analyzeHand).mockResolvedValue(validAttributes);
    vi.mocked(selectBlocks).mockReturnValue({ element: "fire", sections: [] } as never);
    vi.mocked(prisma.reading.create).mockResolvedValue(validReading as never);
    vi.mocked(prisma.lead.findUnique).mockResolvedValue(validLead as never);
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    vi.mocked(debitCreditFIFO).mockResolvedValue({ debited: false });
  });

  it("API-02: valid body with confident GPT-4o response returns 200 with reading_id and report", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.reading_id).toBeDefined();
    expect(json.report).toBeDefined();
  });

  it("API-03: analyzeHand confidence < 0.3 returns 422 with LOW_CONFIDENCE code", async () => {
    vi.mocked(analyzeHand).mockResolvedValue({ ...validAttributes, confidence: 0.25 });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.code).toBe("LOW_CONFIDENCE");
    expect(typeof json.error).toBe("string");
  });

  it("SEC-06: missing photo_base64 returns 400", async () => {
    const { photo_base64: _p, ...bodyWithout } = validBody;
    const res = await POST(makeRequest(bodyWithout));

    expect(res.status).toBe(400);
  });

  it("SEC-06: invalid UUID lead_id returns 400", async () => {
    const res = await POST(makeRequest({ ...validBody, lead_id: "not-a-uuid" }));

    expect(res.status).toBe(400);
  });

  it("SEC-01: rateLimit returning false yields 429", async () => {
    vi.mocked(rateLimit).mockReturnValue(false);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(429);
  });

  it("SEC-05: body with tier:'premium' still saves reading with tier:'free'", async () => {
    const bodyWithTier = { ...validBody, tier: "premium" };
    await POST(makeRequest(bodyWithTier));

    const createCall = vi.mocked(prisma.reading.create).mock.calls[0];
    expect(createCall).toBeDefined();
    const createData = createCall[0].data;
    expect(createData.tier).toBe("free");
  });

  it("returns 500 when analyzeHand throws", async () => {
    vi.mocked(analyzeHand).mockRejectedValue(new Error("OpenAI error"));

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(500);
  });

  it("analyzeHand is called with photo_base64 and dominant_hand only", async () => {
    await POST(makeRequest(validBody));
    expect(analyzeHand).toHaveBeenCalledWith(validBody.photo_base64, "right");
  });

  // New atomic debit tests

  it("CREDIT-01: unauthenticated request creates reading with tier='free', debitCreditFIFO NOT called", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);

    await POST(makeRequest(validBody));

    expect(debitCreditFIFO).not.toHaveBeenCalled();
    const createCall = vi.mocked(prisma.reading.create).mock.calls[0];
    expect(createCall[0].data.tier).toBe("free");
  });

  it("CREDIT-02: authenticated user with credits creates reading with tier='premium'", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_abc123" } as never);
    vi.mocked(debitCreditFIFO).mockResolvedValue({ debited: true, packId: "pack_xyz" });
    vi.mocked(prisma.reading.create).mockResolvedValue({
      ...validReading,
      tier: "premium",
    } as never);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(debitCreditFIFO).toHaveBeenCalledWith("user_abc123");
    const createCall = vi.mocked(prisma.reading.create).mock.calls[0];
    expect(createCall[0].data.tier).toBe("premium");
    expect(json.tier).toBe("premium");
  });

  it("CREDIT-03: authenticated user with zero credits creates reading with tier='free'", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_abc123" } as never);
    vi.mocked(debitCreditFIFO).mockResolvedValue({ debited: false });

    await POST(makeRequest(validBody));

    expect(debitCreditFIFO).toHaveBeenCalledWith("user_abc123");
    const createCall = vi.mocked(prisma.reading.create).mock.calls[0];
    expect(createCall[0].data.tier).toBe("free");
  });

  it("CREDIT-04: body with credit_used field is ignored — does not affect tier", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    // Sending credit_used: true should be irrelevant — unauthenticated = free
    const bodyWithCreditUsed = { ...validBody, credit_used: true };

    await POST(makeRequest(bodyWithCreditUsed));

    expect(debitCreditFIFO).not.toHaveBeenCalled();
    const createCall = vi.mocked(prisma.reading.create).mock.calls[0];
    expect(createCall[0].data.tier).toBe("free");
  });

  it("CREDIT-05: response includes tier field", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(json.tier).toBeDefined();
    expect(["free", "premium"]).toContain(json.tier);
  });

  // Email opt-in tests (EMAIL-03)

  it("EMAIL-03: sendLeadReading NOT called when lead.emailOptIn is false", async () => {
    vi.mocked(prisma.lead.findUnique).mockResolvedValue({
      ...validLead,
      emailOptIn: false,
    } as never);

    await POST(makeRequest(validBody));

    expect(sendLeadReading).not.toHaveBeenCalled();
  });

  it("EMAIL-03: sendLeadReading called when lead.emailOptIn is true", async () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://maosfalam.com";
    vi.mocked(prisma.lead.findUnique).mockResolvedValue({
      ...validLead,
      emailOptIn: true,
    } as never);

    await POST(makeRequest(validBody));

    expect(sendLeadReading).toHaveBeenCalledWith(
      "ana@test.com",
      "Ana",
      `https://maosfalam.com/ler/resultado/${READING_UUID}`,
    );
  });

  it("EMAIL-03: sendLeadReading NOT called when lead.emailOptIn is null", async () => {
    vi.mocked(prisma.lead.findUnique).mockResolvedValue({
      ...validLead,
      emailOptIn: null,
    } as never);

    await POST(makeRequest(validBody));

    expect(sendLeadReading).not.toHaveBeenCalled();
  });
});
