/** API v1 Client — Kuwait Motor Adaptive Risk Engine. */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const V1 = `${API_BASE}/api/v1`;

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Health ────────────────────────────────────────────────
export async function healthV1() {
  return fetchJSON(`${V1}/health`);
}

// ─── Signals ───────────────────────────────────────────────
export async function ingestSignals(marketCode: string, signals: any[]) {
  return fetchJSON(`${V1}/signals/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ market_code: marketCode, signals }),
  });
}

export async function getLatestSignals(marketCode: string) {
  return fetchJSON(`${V1}/signals/latest?market_code=${marketCode}`);
}

// ─── Graph ─────────────────────────────────────────────────
export async function getGraphNodes(nodeType?: string) {
  const params = nodeType ? `?node_type=${nodeType}` : "";
  return fetchJSON(`${V1}/graph/nodes${params}`);
}

export async function getGraphEdges() {
  return fetchJSON(`${V1}/graph/edges`);
}

export async function getGraphImpact(marketCode: string, portfolioKey = "motor_retail") {
  return fetchJSON(`${V1}/graph/impact?market_code=${marketCode}&portfolio_key=${portfolioKey}`);
}

// ─── Scoring ───────────────────────────────────────────────
export async function runScoring(marketCode: string, portfolioKey = "motor_retail", runType = "on_demand") {
  return fetchJSON(`${V1}/scoring/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      market_code: marketCode,
      portfolio_key: portfolioKey,
      run_type: runType,
    }),
  });
}

// ─── Predictions ───────────────────────────────────────────
export async function getPrediction(assessmentId: string) {
  return fetchJSON(`${V1}/predictions/${assessmentId}`);
}

export async function listPredictions(marketCode?: string) {
  const params = marketCode ? `?market_code=${marketCode}` : "";
  return fetchJSON(`${V1}/predictions/${params}`);
}

// ─── Feedback ──────────────────────────────────────────────
export async function submitOutcome(data: {
  prediction_id: string;
  actual_loss_ratio?: number;
  actual_claims_frequency?: number;
  actual_claims_severity?: number;
  actual_fraud_findings?: number;
  actual_lapse_rate?: number;
  actual_underwriting_shift?: number;
  observed_start_date: string;
  observed_end_date: string;
}) {
  return fetchJSON(`${V1}/feedback/outcomes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ─── Calibration ───────────────────────────────────────────
export async function runCalibration(marketCode: string, predictionId: string, mode = "semi_auto") {
  return fetchJSON(`${V1}/calibration/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      market_code: marketCode,
      prediction_id: predictionId,
      mode,
    }),
  });
}

export async function getCalibrationHistory(edgeId?: string) {
  const params = edgeId ? `?edge_id=${edgeId}` : "";
  return fetchJSON(`${V1}/calibration/history${params}`);
}

// ─── Recommendations ───────────────────────────────────────
export async function getRecommendations(assessmentId: string) {
  return fetchJSON(`${V1}/recommendations/${assessmentId}`);
}
