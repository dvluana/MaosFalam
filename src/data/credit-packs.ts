export const CREDIT_PACKS = {
  avulsa: { credits: 1, price_cents: 1490, label: "Avulsa" },
  dupla: {
    credits: 2,
    price_cents: 2490,
    label: "Dupla",
    discount: "16% off",
  },
  roda: {
    credits: 5,
    price_cents: 4990,
    label: "Roda",
    discount: "33% off",
    popular: true,
  },
  tsara: {
    credits: 10,
    price_cents: 7990,
    label: "Tsara",
    discount: "46% off",
  },
} as const;

export type PackType = keyof typeof CREDIT_PACKS;

export function isValidPackType(value: string): value is PackType {
  return value in CREDIT_PACKS;
}

export const ABACATEPAY_EXTERNAL_IDS: Record<PackType, string> = {
  avulsa: "mf_avulsa",
  dupla: "mf_dupla",
  roda: "mf_roda",
  tsara: "mf_tsara",
} as const;
