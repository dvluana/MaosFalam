import { MOCK_ATTRIBUTES } from "@/mocks/hand-attributes";
import { selectBlocks } from "@/server/lib/select-blocks";
import type { HandElement, Reading, ReportJSON } from "@/types/report";

export async function getReading(
  name: string,
  gender: "female" | "male",
  element?: HandElement,
): Promise<Reading> {
  const key: HandElement = element ?? "fire";
  const attributes = MOCK_ATTRIBUTES[key];
  const report: ReportJSON = selectBlocks(attributes, name, gender);

  return {
    id: `mock-${key}-001`,
    tier: "premium",
    share_token: `${key}-mock-token`,
    share_expires_at: "2026-12-31T00:00:00.000Z",
    report,
    created_at: new Date().toISOString(),
  };
}

// When backend exists, replace with:
// export async function getReading(...) {
//   const res = await fetch('/api/reading/capture', { ... });
//   return res.json();
// }
