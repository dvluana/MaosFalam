import type { Reading, ReportJSON } from "@/types/report";

export async function registerLead(data: {
  name: string;
  email: string;
  gender: "female" | "male";
  session_id: string;
  email_opt_in: boolean;
}): Promise<{ lead_id: string | null; existing_account?: boolean }> {
  const res = await fetch("/api/lead/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Erro ao registrar lead");
  }
  return res.json() as Promise<{ lead_id: string | null; existing_account?: boolean }>;
}

export async function captureReading(data: {
  photo_base64: string;
  session_id: string;
  lead_id?: string;
  target_name: string;
  target_gender: "female" | "male";
  is_self: boolean;
  dominant_hand?: "right" | "left";
  element_hint?: "fire" | "water" | "earth" | "air";
}): Promise<{ reading_id: string; report: ReportJSON; tier?: string }> {
  const res = await fetch("/api/reading/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    const msg = body.code
      ? `${body.code}: ${body.error ?? "Erro interno"}`
      : (body.error ?? "Erro interno");
    throw new Error(msg);
  }
  return res.json() as Promise<{ reading_id: string; report: ReportJSON; tier?: string }>;
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
    target_name: r.target_name,
    report: r.report,
    created_at: r.created_at,
  };
}
