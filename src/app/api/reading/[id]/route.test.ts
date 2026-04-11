import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    reading: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/server/lib/prisma";

import { GET } from "./route";

const VALID_UUID = "24771be2-3e5c-4267-b3a1-40353d9dbd66";

function makeGetRequest(id: string) {
  return new NextRequest(`http://localhost/api/reading/${id}`);
}

const activeReading = {
  id: VALID_UUID,
  targetName: "Ana",
  targetGender: "female",
  tier: "free",
  report: { element: "fire", sections: [] },
  isActive: true,
  createdAt: new Date(),
};

describe("GET /api/reading/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("API-04: valid UUID, reading found, isActive true returns 200 with reading", async () => {
    vi.mocked(prisma.reading.findUnique).mockResolvedValue(activeReading as never);

    const res = await GET(makeGetRequest(VALID_UUID), {
      params: Promise.resolve({ id: VALID_UUID }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.reading).toBeDefined();
    expect(json.reading.id).toBe(VALID_UUID);
  });

  it("API-04: valid UUID, reading found, isActive false returns 410", async () => {
    vi.mocked(prisma.reading.findUnique).mockResolvedValue({
      ...activeReading,
      isActive: false,
    } as never);

    const res = await GET(makeGetRequest(VALID_UUID), {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(res.status).toBe(410);
  });

  it("API-04: valid UUID, reading not found returns 404", async () => {
    vi.mocked(prisma.reading.findUnique).mockResolvedValue(null);

    const res = await GET(makeGetRequest(VALID_UUID), {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(res.status).toBe(404);
  });

  it("non-UUID id returns 404 (UUID validation, no DB leak)", async () => {
    const res = await GET(makeGetRequest("not-a-uuid"), {
      params: Promise.resolve({ id: "not-a-uuid" }),
    });

    expect(res.status).toBe(404);
    // Must NOT call DB with invalid id
    expect(prisma.reading.findUnique).not.toHaveBeenCalled();
  });
});
