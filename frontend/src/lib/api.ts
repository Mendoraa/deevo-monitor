/** API client for the Deevo Cortex backend. */

import type { EventInput, EconomicAnalysisResponse } from "@/types/economic-layer";
import type { FullCortexResponse } from "@/types/cortex";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/** Full Cortex analysis — economic + insurance + graph + explanation. */
export async function runFullCortex(
  event: EventInput
): Promise<FullCortexResponse> {
  const res = await fetch(`${API_BASE}/api/economic-layer/cortex`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Cortex analysis failed: ${res.status} — ${error}`);
  }

  return res.json();
}

/** Economic analysis only. */
export async function analyzeEvent(
  event: EventInput
): Promise<EconomicAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/economic-layer/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Analysis failed: ${res.status} — ${error}`);
  }

  return res.json();
}

export async function classifyEvent(event: EventInput) {
  const res = await fetch(`${API_BASE}/api/economic-layer/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) throw new Error("Classification failed");
  return res.json();
}

export async function getScenarios(event: EventInput) {
  const res = await fetch(`${API_BASE}/api/economic-layer/scenario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) throw new Error("Scenario scoring failed");
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/economic-layer/health`);
  return res.json();
}

/** Phase 3: GCC Insurance Scorecards. */
export async function getGCCScorecards(event: EventInput) {
  const res = await fetch(`${API_BASE}/api/economic-layer/scorecard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Scorecard failed: ${res.status} — ${error}`);
  }

  return res.json();
}

/** Phase 3: Full Cortex V3 (includes scorecards). */
export async function runFullCortexV3(event: EventInput) {
  const res = await fetch(`${API_BASE}/api/economic-layer/cortex-v3`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Cortex V3 failed: ${res.status} — ${error}`);
  }

  return res.json();
}
