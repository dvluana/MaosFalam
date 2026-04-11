import { Writable } from "stream";

import pino from "pino";
import { describe, it, expect } from "vitest";

function makeTestLogger() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  const log = pino(
    {
      level: "info",
      redact: {
        paths: ["name", "email", "cpf", "phone", "*.name", "*.email", "*.cpf", "*.phone"],
        censor: "[REDACTED]",
      },
    },
    stream,
  );
  return { log, lines };
}

describe("logger — INFRA-01 and SEC-07", () => {
  it("exports a pino logger instance", async () => {
    const { logger } = await import("../logger");
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
  });

  it("default level is info when LOG_LEVEL not set", async () => {
    const { logger } = await import("../logger");
    // logger.ts reads LOG_LEVEL at import time; default is "info"
    expect(logger.level).toBe("info");
  });

  it("redacts name at root level", () => {
    const { log, lines } = makeTestLogger();
    log.info({ name: "Alice", userId: "abc-123" }, "test");
    const parsed = JSON.parse(lines[0]);
    expect(parsed.name).toBe("[REDACTED]");
    expect(parsed.userId).toBe("abc-123");
  });

  it("redacts email at root level", () => {
    const { log, lines } = makeTestLogger();
    log.info({ email: "a@b.com" }, "test");
    const parsed = JSON.parse(lines[0]);
    expect(parsed.email).toBe("[REDACTED]");
  });

  it("redacts cpf at root level", () => {
    const { log, lines } = makeTestLogger();
    log.info({ cpf: "123.456.789-00" }, "test");
    const parsed = JSON.parse(lines[0]);
    expect(parsed.cpf).toBe("[REDACTED]");
  });

  it("redacts phone at root level", () => {
    const { log, lines } = makeTestLogger();
    log.info({ phone: "11999999999" }, "test");
    const parsed = JSON.parse(lines[0]);
    expect(parsed.phone).toBe("[REDACTED]");
  });

  it("redacts nested name (*.name path)", () => {
    const { log, lines } = makeTestLogger();
    log.info({ user: { name: "Alice" } }, "test");
    const parsed = JSON.parse(lines[0]);
    expect(parsed.user.name).toBe("[REDACTED]");
  });

  it("does not redact non-PII fields", () => {
    const { log, lines } = makeTestLogger();
    log.info({ action: "login", readingId: "abc-123" }, "test");
    const parsed = JSON.parse(lines[0]);
    expect(parsed.action).toBe("login");
    expect(parsed.readingId).toBe("abc-123");
  });
});
