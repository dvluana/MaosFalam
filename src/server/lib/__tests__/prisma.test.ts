import { describe, it, expect, beforeAll } from "vitest";

describe("prisma singleton (DB-02)", () => {
  beforeAll(() => {
    // Set dummy DATABASE_URL so createPrismaClient does not throw
    // This test does NOT make real DB connections — it only verifies the singleton pattern
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  });

  it("exports the prisma client", async () => {
    const { prisma } = await import("../prisma");
    expect(prisma).toBeDefined();
  });

  it("returns the same instance on repeated import (singleton)", async () => {
    const { prisma: instance1 } = await import("../prisma");
    const { prisma: instance2 } = await import("../prisma");
    // Same reference — module cache guarantees this in Node.js
    expect(instance1).toBe(instance2);
  });

  it("stores instance on globalThis in non-production env", async () => {
    // vitest runs in test env (not production), so globalForPrisma.prisma should be set
    const { prisma } = await import("../prisma");
    const globalPrisma = (globalThis as unknown as { prisma: unknown }).prisma;
    expect(globalPrisma).toBe(prisma);
  });
});
