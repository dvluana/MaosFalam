export async function getUserProfile(): Promise<{
  clerk_user_id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
}> {
  const res = await fetch("/api/user/profile");
  if (!res.ok) throw new Error("Erro ao buscar perfil");
  return res.json() as Promise<{
    clerk_user_id: string;
    name: string;
    email: string;
    cpf: string | null;
    phone: string | null;
  }>;
}

export async function updateProfile(data: {
  cpf?: string;
  phone?: string;
}): Promise<void> {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar perfil");
}

export async function getUserReadings(): Promise<{
  readings: Array<{
    id: string;
    target_name: string;
    tier: string;
    report: unknown;
    created_at: string;
  }>;
}> {
  const res = await fetch("/api/user/readings");
  if (!res.ok) throw new Error("Erro ao buscar leituras");
  return res.json() as Promise<{
    readings: Array<{
      id: string;
      target_name: string;
      tier: string;
      report: unknown;
      created_at: string;
    }>;
  }>;
}

export async function deleteAccount(): Promise<void> {
  const res = await fetch("/api/user/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: "EXCLUIR" }),
  });
  if (!res.ok) throw new Error("Erro ao excluir conta");
}
