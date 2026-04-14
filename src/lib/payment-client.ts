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
