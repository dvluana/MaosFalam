import { describe, expect, it } from "vitest";

import { formatCPF, isValidCPF } from "@/lib/cpf";

describe("isValidCPF", () => {
  it("accepts valid CPF with correct check digits (raw)", () => {
    expect(isValidCPF("52998224725")).toBe(true);
  });

  it("accepts valid CPF with formatting", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });

  it("accepts another valid CPF", () => {
    expect(isValidCPF("12345678909")).toBe(true);
  });

  it("rejects all same digits", () => {
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("00000000000")).toBe(false);
    expect(isValidCPF("99999999999")).toBe(false);
  });

  it("rejects wrong check digits", () => {
    expect(isValidCPF("12345678900")).toBe(false);
  });

  it("rejects too short", () => {
    expect(isValidCPF("123")).toBe(false);
  });

  it("rejects too long", () => {
    expect(isValidCPF("123456789091")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidCPF("")).toBe(false);
  });
});

describe("formatCPF", () => {
  it("formats full 11-digit CPF", () => {
    expect(formatCPF("12345678909")).toBe("123.456.789-09");
  });

  it("returns short input as-is", () => {
    expect(formatCPF("123")).toBe("123");
  });

  it("progressively formats 4 digits", () => {
    expect(formatCPF("1234")).toBe("123.4");
  });

  it("progressively formats 7 digits", () => {
    expect(formatCPF("1234567")).toBe("123.456.7");
  });

  it("progressively formats 10 digits", () => {
    expect(formatCPF("1234567890")).toBe("123.456.789-0");
  });

  it("strips non-digits before formatting", () => {
    expect(formatCPF("123.456")).toBe("123.456");
  });

  it("limits to 11 digits max", () => {
    expect(formatCPF("123456789012345")).toBe("123.456.789-01");
  });
});
