import crypto from "crypto";

import { logger } from "./logger";

const BASE_URL = "https://api.abacatepay.com/v1";

async function abacateRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    logger.error({ status: res.status, path }, "AbacatePay error");
    throw new Error(`AbacatePay error: ${res.status} - ${err}`);
  }

  return res.json() as Promise<T>;
}

interface AbacateCustomer {
  id: string;
}

interface AbacateBilling {
  url: string;
  id: string;
}

export async function createCustomer(
  name: string,
  email: string,
  cpf: string,
): Promise<AbacateCustomer> {
  return abacateRequest<AbacateCustomer>("/customers", {
    name,
    email,
    cellphone: "",
    taxId: cpf,
  });
}

export async function createBilling(
  customerId: string,
  packType: string,
  pack: { label: string; price_cents: number; credits: number },
  readingId?: string,
): Promise<AbacateBilling> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return abacateRequest<AbacateBilling>("/billing/create", {
    frequency: "ONE_TIME",
    methods: ["PIX"],
    products: [
      {
        externalId: `pack_${packType}_${Date.now()}`,
        name: `MaosFalam · ${pack.label}`,
        description: `${pack.credits} credito(s)`,
        quantity: 1,
        price: pack.price_cents,
      },
    ],
    returnUrl: `${baseUrl}/creditos`,
    completionUrl: readingId
      ? `${baseUrl}/ler/resultado/${readingId}?paid=1`
      : `${baseUrl}/creditos?purchased=1`,
    customerId,
  });
}

export function validateWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("ABACATEPAY_WEBHOOK_SECRET not set, rejecting webhook");
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}
