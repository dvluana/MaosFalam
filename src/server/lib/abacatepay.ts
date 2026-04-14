import crypto from "node:crypto";

import type { PackType } from "@/data/credit-packs";
import { ABACATEPAY_EXTERNAL_IDS } from "@/data/credit-packs";

import { logger } from "./logger";

// ============================================================
// AbacatePay v2 API wrapper
// Docs: docs/abacatepay-v2.md
// ============================================================

const BASE_URL = "https://api.abacatepay.com/v2";

// Fixed public key for webhook HMAC-SHA256 signature validation.
// This is the same for all AbacatePay merchants (not a per-store secret).
const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

// In-memory cache: externalId -> prod_xxx AbacatePay product ID
const productIdCache = new Map<string, string>();

// ============================================================
// Response wrapper (all v2 responses use this shape)
// ============================================================

interface AbacateResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
}

// ============================================================
// Internal HTTP helpers
// ============================================================

function requireApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) {
    throw new Error("ABACATEPAY_API_KEY is not configured");
  }
  return key;
}

async function abacatePost<T>(path: string, body: unknown): Promise<AbacateResponse<T>> {
  const apiKey = requireApiKey();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    logger.error({ status: res.status, path }, "AbacatePay POST error");
    throw new Error(`AbacatePay error: ${res.status} - ${err}`);
  }

  return res.json() as Promise<AbacateResponse<T>>;
}

async function abacateGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<AbacateResponse<T>> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const apiKey = requireApiKey();
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    logger.error({ status: res.status, path }, "AbacatePay GET error");
    throw new Error(`AbacatePay error: ${res.status} - ${err}`);
  }

  return res.json() as Promise<AbacateResponse<T>>;
}

// ============================================================
// Customer
// ============================================================

interface AbacateCustomer {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Creates an AbacatePay customer. Only email is required in v2.
 * Returns the customer ID (cus_xxx).
 */
export async function createCustomer(email: string, name?: string): Promise<string> {
  const res = await abacatePost<AbacateCustomer>("/customers/create", {
    email,
    ...(name && { name }),
  });
  return res.data.id;
}

// ============================================================
// Product ID resolution (lazy-fetch + cache)
// ============================================================

interface AbacateProduct {
  id: string;
  externalId: string;
  name: string;
  price: number;
}

/**
 * Resolves an AbacatePay product ID (prod_xxx) from a pack type.
 * Uses lazy-fetch: first call hits /products/get?externalId=mf_{pack},
 * subsequent calls return from in-memory cache.
 */
export async function resolveProductId(packType: PackType): Promise<string> {
  const externalId = ABACATEPAY_EXTERNAL_IDS[packType];
  const cached = productIdCache.get(externalId);
  if (cached) return cached;

  const res = await abacateGet<AbacateProduct>("/products/get", { externalId });
  const productId = res.data.id;
  productIdCache.set(externalId, productId);

  logger.info({ packType, externalId, productId }, "Product ID resolved and cached");
  return productId;
}

// ============================================================
// Checkout
// ============================================================

interface AbacateCheckout {
  id: string;
  url: string;
  amount: number;
  status: string;
}

interface CreateCheckoutParams {
  productId: string;
  customerId: string;
  externalId: string;
  returnUrl: string;
  completionUrl: string;
}

/**
 * Creates a hosted checkout on AbacatePay.
 * User is redirected to the returned URL to complete payment (PIX or CARD).
 * externalId should be our Payment UUID for webhook lookup.
 */
export async function createCheckout(
  params: CreateCheckoutParams,
): Promise<{ id: string; url: string }> {
  const res = await abacatePost<AbacateCheckout>("/checkouts/create", {
    items: [{ id: params.productId, quantity: 1 }],
    methods: ["PIX", "CARD"],
    returnUrl: params.returnUrl,
    completionUrl: params.completionUrl,
    customerId: params.customerId,
    externalId: params.externalId,
  });
  return { id: res.data.id, url: res.data.url };
}

// ============================================================
// Webhook signature verification
// ============================================================

/**
 * Verifies AbacatePay v2 webhook signature using HMAC-SHA256 with the
 * fixed public key and base64 digest.
 *
 * CRITICAL: v2 uses base64 (not hex). Using hex = all webhooks rejected.
 * Header name: X-Webhook-Signature (Next.js lowercases to x-webhook-signature).
 */
export function verifyWebhookSignature(rawBody: string, signatureFromHeader: string): boolean {
  const expected = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signatureFromHeader);

  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}
