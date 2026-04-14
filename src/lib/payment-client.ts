export async function initiatePurchase(
  packType: string,
  cpf?: string,
  readingId?: string,
): Promise<{ checkout_url: string }> {
  const body: Record<string, string> = { pack_type: packType };
  if (cpf) body.cpf = cpf;
  if (readingId) body.reading_id = readingId;

  const res = await fetch("/api/credits/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const parsed = (await res.json().catch(() => ({}))) as {
      error?: string;
      detail?: string;
      step?: string;
    };
    const parts = [String(res.status)];
    if (parsed.error) parts.push(parsed.error);
    if (parsed.step) parts.push(`[${parsed.step}]`);
    if (parsed.detail) parts.push(parsed.detail);
    if (parts.length === 1) parts.push("Erro ao iniciar pagamento");
    throw new Error(parts.join(": "));
  }

  return res.json() as Promise<{ checkout_url: string }>;
}

export async function getCredits(): Promise<{
  balance: number;
  packs: Array<{
    id: string;
    pack_type: string;
    total: number;
    remaining: number;
    created_at: string;
  }>;
}> {
  const res = await fetch("/api/user/credits");
  if (!res.ok) throw new Error("Erro ao buscar creditos");
  return res.json() as Promise<{
    balance: number;
    packs: Array<{
      id: string;
      pack_type: string;
      total: number;
      remaining: number;
      created_at: string;
    }>;
  }>;
}
