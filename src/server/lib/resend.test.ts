import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock logger before importing anything
vi.mock("./logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const { logger } = vi.mocked(await import("./logger"));

describe("resend.ts", () => {
  const originalEnv = process.env.RESEND_API_KEY;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    global.fetch = fetchSpy as typeof global.fetch;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.RESEND_API_KEY = originalEnv;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  });

  describe("API key guard", () => {
    it("skips silently when RESEND_API_KEY is undefined", async () => {
      delete process.env.RESEND_API_KEY;
      const { sendPaymentConfirmed } = await import("./resend");

      await sendPaymentConfirmed("test@test.com", "Ana", "https://example.com/reading/1");

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.stringContaining("RESEND_API_KEY"),
      );
    });

    it("skips silently when RESEND_API_KEY is empty string", async () => {
      process.env.RESEND_API_KEY = "";
      const { sendPaymentConfirmed } = await import("./resend");

      await sendPaymentConfirmed("test@test.com", "Ana", "https://example.com/reading/1");

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("retry logic", () => {
    it("retries once on network error then logs and returns without throwing", async () => {
      fetchSpy
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const { sendLeadReading } = await import("./resend");
      await sendLeadReading("test@test.com", "Ana", "https://example.com/reading/1");

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("retries once on 5xx response then logs and returns without throwing", async () => {
      fetchSpy
        .mockResolvedValueOnce({ ok: false, status: 502 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const { sendLeadReading } = await import("./resend");
      await sendLeadReading("test@test.com", "Ana", "https://example.com/reading/1");

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("does NOT retry on 4xx response", async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false, status: 422 });

      const { sendLeadReading } = await import("./resend");
      await sendLeadReading("test@test.com", "Ana", "https://example.com/reading/1");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalled();
    });

    it("after two failed retries, logs error and returns without throwing", async () => {
      fetchSpy
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error again"));

      const { sendLeadReading } = await import("./resend");

      // Should NOT throw
      await expect(
        sendLeadReading("test@test.com", "Ana", "https://example.com/reading/1"),
      ).resolves.toBeUndefined();

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("sendPaymentConfirmed", () => {
    it("calls fetch with correct subject and HTML in brand voice", async () => {
      const { sendPaymentConfirmed } = await import("./resend");
      await sendPaymentConfirmed("ana@test.com", "Ana", "https://maosfalam.com/ler/resultado/abc");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const callBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(callBody.subject).toContain("Ana");
      expect(callBody.html).toContain("Ana");
      expect(callBody.html).toContain("https://maosfalam.com/ler/resultado/abc");
    });
  });

  describe("sendLeadReading", () => {
    it("calls fetch with correct subject and HTML in brand voice", async () => {
      const { sendLeadReading } = await import("./resend");
      await sendLeadReading("ana@test.com", "Ana", "https://maosfalam.com/ler/resultado/abc");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const callBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(callBody.subject).toContain("Ana");
      expect(callBody.html).toContain("Ana");
      expect(callBody.html).toContain("https://maosfalam.com/ler/resultado/abc");
    });
  });

  describe("sendWelcome", () => {
    it("calls fetch with correct subject and HTML in brand voice", async () => {
      const { sendWelcome } = await import("./resend");
      await sendWelcome("ana@test.com", "Ana");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const callBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(callBody.subject).toContain("Ana");
      expect(callBody.html).toContain("Ana");
      expect(callBody.html).toContain("/conta/leituras");
    });
  });
});
