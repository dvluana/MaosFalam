import type { Reading, ReportJSON } from "@/types/report";

export async function registerLead(data: {
  name: string;
  email: string;
  gender: "female" | "male";
  session_id: string;
  email_opt_in: boolean;
}): Promise<{ lead_id: string }> {
  const res = await fetch("/api/lead/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Erro ao registrar lead");
  }
  return res.json() as Promise<{ lead_id: string }>;
}

export async function captureReading(data: {
  photo_base64: string;
  session_id: string;
  lead_id: string;
  target_name: string;
  target_gender: "female" | "male";
  is_self: boolean;
}): Promise<{ reading_id: string; report: ReportJSON }> {
  const res = await fetch("/api/reading/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Erro interno");
  }
  return res.json() as Promise<{ reading_id: string; report: ReportJSON }>;
}

export async function getReading(id: string): Promise<Reading | null> {
  const res = await fetch(`/api/reading/${id}`, {
    method: "GET",
  });
  if (res.status === 404 || res.status === 410) {
    return null;
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Erro ao buscar leitura");
  }
  const data = (await res.json()) as {
    reading: {
      id: string;
      target_name: string;
      target_gender: string;
      tier: string;
      report: ReportJSON;
      created_at: string;
    };
  };
  const r = data.reading;
  return {
    id: r.id,
    tier: r.tier as Reading["tier"],
    share_token: r.id,
    share_expires_at: "2099-12-31T00:00:00.000Z",
    report: r.report,
    created_at: r.created_at,
  };
}
