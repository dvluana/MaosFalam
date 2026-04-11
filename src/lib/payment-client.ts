export async function purchaseCredits(
  packType: string,
  cpf?: string,
  readingId?: string,
): Promise<string> {
  const res = await fetch("/api/credits/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pack_type: packType,
      cpf,
      reading_id: readingId,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      (err as { error?: string }).error || "Erro no pagamento",
    );
  }

  const data = (await res.json()) as { checkout_url: string };
  return data.checkout_url;
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
