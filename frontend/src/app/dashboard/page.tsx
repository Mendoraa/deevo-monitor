"use client";

import { useState, useEffect } from "react";
import {
  healthV1,
  ingestSignals,
  runScoring,
  getGraphImpact,
  getLatestSignals,
  submitOutcome,
  runCalibration,
  getRecommendations,
  getCalibrationHistory,
  listPredictions,
} from "@/lib/api-v1";

// ─── Types ────────────────────────────────────────────────────

interface Scores {
  market_stress_score: number;
  claims_pressure_score: number;
  fraud_exposure_score: number;
  underwriting_risk_score: number;
  portfolio_stability_score: number;
}

interface ScoringResult {
  assessment_id: string;
  scores: Scores;
  risk_level: string;
  top_drivers: string[];
  confidence_score: number;
  recommendations?: any[];
  explainability?: any;
}

type Screen = "command" | "market" | "calibration" | "portfolio";

// ─── Color helpers ────────────────────────────────────────────

function scoreColor(val: number): string {
  if (val >= 80) return "bg-red-500";
  if (val >= 65) return "bg-orange-500";
  if (val >= 45) return "bg-yellow-500";
  if (val >= 25) return "bg-blue-400";
  return "bg-green-500";
}

function riskBadge(level: string): string {
  const map: Record<string, string> = {
    Critical: "bg-red-600 text-white",
    High: "bg-orange-500 text-white",
    Medium: "bg-yellow-500 text-gray-900",
    Low: "bg-green-500 text-white",
  };
  return map[level] || "bg-gray-400 text-white";
}

// ─── Score Bar Component ──────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono font-bold text-white">{value}</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────

export default function DashboardPage() {
  const [screen, setScreen] = useState<Screen>("command");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [impacts, setImpacts] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [calibrationResult, setCalibrationResult] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [healthy, setHealthy] = useState(false);

  // Health check on mount
  useEffect(() => {
    healthV1().then(() => setHealthy(true)).catch(() => setHealthy(false));
  }, []);

  // ─── Actions ────────────────────────────────────────────────

  async function handleIngestAndScore() {
    setLoading(true);
    setError("");
    try {
      // Ingest default Kuwait motor signals
      await ingestSignals("KWT", [
        { signal_key: "oil_price", signal_value: 78.5, signal_category: "macro", source_name: "bloomberg", source_type: "api", observed_at: new Date().toISOString() },
        { signal_key: "inflation_rate", signal_value: 3.8, signal_category: "macro", source_name: "cbk", source_type: "manual", observed_at: new Date().toISOString() },
        { signal_key: "interest_rate", signal_value: 4.25, signal_category: "macro", source_name: "cbk", source_type: "manual", observed_at: new Date().toISOString() },
        { signal_key: "repair_cost_inflation", signal_value: 12.5, signal_category: "insurance", source_name: "garage", source_type: "manual", observed_at: new Date().toISOString() },
        { signal_key: "claims_frequency", signal_value: 1.45, signal_category: "insurance", source_name: "claims", source_type: "api", observed_at: new Date().toISOString() },
        { signal_key: "claims_severity", signal_value: 7.8, signal_category: "insurance", source_name: "claims", source_type: "api", observed_at: new Date().toISOString() },
        { signal_key: "reinsurance_pressure", signal_value: 42.0, signal_category: "insurance", source_name: "reinsurer", source_type: "manual", observed_at: new Date().toISOString() },
        { signal_key: "premium_adequacy", signal_value: 65.0, signal_category: "insurance", source_name: "actuarial", source_type: "manual", observed_at: new Date().toISOString() },
        { signal_key: "loss_ratio", signal_value: 72.5, signal_category: "portfolio", source_name: "finance", source_type: "api", observed_at: new Date().toISOString() },
        { signal_key: "credit_growth", signal_value: 5.2, signal_category: "macro", source_name: "cbk", source_type: "manual", observed_at: new Date().toISOString() },
      ]);

      // Run scoring
      const scoring = await runScoring("KWT", "motor_retail");
      setResult(scoring);

      // Fetch graph impacts
      const imp = await getGraphImpact("KWT");
      setImpacts(imp.impacts || []);

      // Fetch latest signals
      const sig = await getLatestSignals("KWT");
      setSignals(sig.signals || []);

      // Fetch predictions
      const preds = await listPredictions("KWT");
      setPredictions(preds.predictions || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCalibrate() {
    if (!result) return;
    setLoading(true);
    try {
      // Submit mock outcome first
      await submitOutcome({
        prediction_id: result.assessment_id,
        actual_loss_ratio: 71.2,
        actual_claims_frequency: 1.18,
        actual_claims_severity: 6.9,
        actual_fraud_findings: 14,
        actual_lapse_rate: 0.04,
        observed_start_date: "2026-03-24",
        observed_end_date: "2026-04-24",
      });

      // Run calibration
      const cal = await runCalibration("KWT", result.assessment_id, "semi_auto");
      setCalibrationResult(cal);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Screen: Executive Command Center ──────────────────────

  function CommandCenter() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Executive Command Center</h2>
          <button
            onClick={handleIngestAndScore}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold text-white transition-colors"
          >
            {loading ? "Processing..." : "Run Scoring Pipeline"}
          </button>
        </div>

        {error && <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-200">{error}</div>}

        {result && (
          <>
            {/* Risk Level Banner */}
            <div className={`p-4 rounded-xl text-center ${riskBadge(result.risk_level)}`}>
              <div className="text-lg font-bold">Overall Risk: {result.risk_level}</div>
              <div className="text-sm opacity-80">
                Confidence: {(result.confidence_score * 100).toFixed(1)}% | ID: {result.assessment_id}
              </div>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Scores</h3>
                <ScoreBar label="Market Stress" value={result.scores.market_stress_score} />
                <ScoreBar label="Claims Pressure" value={result.scores.claims_pressure_score} />
                <ScoreBar label="Fraud Exposure" value={result.scores.fraud_exposure_score} />
                <ScoreBar label="Underwriting Risk" value={result.scores.underwriting_risk_score} />
                <ScoreBar label="Portfolio Stability" value={result.scores.portfolio_stability_score} />
              </div>

              {/* Top Drivers */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Top Risk Drivers</h3>
                {result.top_drivers.slice(0, 8).map((d, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0">
                    <span className="text-blue-400 font-mono text-sm w-6">{i + 1}.</span>
                    <span className="text-gray-200">{d.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Executive Recommendations</h3>
                {result.recommendations.slice(0, 6).map((r: any, i: number) => (
                  <div key={i} className="p-3 mb-2 bg-gray-900 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        r.priority === "critical" ? "bg-red-600 text-white" :
                        r.priority === "high" ? "bg-orange-500 text-white" :
                        "bg-yellow-500 text-gray-900"
                      }`}>{r.priority?.toUpperCase()}</span>
                      <span className="text-white font-medium">{r.title}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{r.rationale}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl">Click "Run Scoring Pipeline" to begin</p>
            <p className="text-sm mt-2">Ingests Kuwait motor signals → Runs graph reasoning → Generates scores + recommendations</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Screen: Market View ───────────────────────────────────

  function MarketView() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Market View — Kuwait</h2>

        {/* Market Profile */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Market Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              ["Country", "Kuwait 🇰🇼"],
              ["Currency", "KWD"],
              ["Oil Dependency", "85%"],
              ["Regulator", "IRU"],
              ["Insurance Penetration", "1.2%"],
              ["Primary Lines", "Motor, Medical, Marine"],
              ["Fiscal Buffer", "80%"],
              ["Trade Openness", "40%"],
            ].map(([label, val]) => (
              <div key={label} className="bg-gray-900 rounded-lg p-3">
                <div className="text-gray-400 text-xs">{label}</div>
                <div className="text-white font-semibold">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Signals */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Live Signals</h3>
          {signals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {signals.map((s: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 px-3 bg-gray-900 rounded">
                  <span className="text-gray-300 text-sm">{s.signal_key?.replace(/_/g, " ")}</span>
                  <div className="text-right">
                    <span className="text-white font-mono">{s.signal_value}</span>
                    <span className="text-gray-500 text-xs ml-2">norm: {s.normalized_value?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Run scoring pipeline first to see signals</p>
          )}
        </div>

        {/* Graph Impacts */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Strongest Graph Edges</h3>
          {impacts.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2">Source</th>
                  <th className="text-left py-2">Target</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {impacts.slice(0, 10).map((imp: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 text-blue-300">{imp.source}</td>
                    <td className="py-2 text-green-300">{imp.target}</td>
                    <td className="py-2 text-gray-400">{imp.relationship_type}</td>
                    <td className="py-2 text-white font-mono text-right">{imp.effective_weight?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">Run scoring pipeline first to see impacts</p>
          )}
        </div>
      </div>
    );
  }

  // ─── Screen: Calibration Console ───────────────────────────

  function CalibrationConsole() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Calibration Console</h2>
          <button
            onClick={handleCalibrate}
            disabled={loading || !result}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold text-white transition-colors"
          >
            {loading ? "Calibrating..." : "Run Calibration"}
          </button>
        </div>

        {!result && (
          <div className="text-center py-10 text-gray-500">
            <p>Run the scoring pipeline first to generate a prediction for calibration.</p>
          </div>
        )}

        {calibrationResult && (
          <>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Calibration Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">{calibrationResult.edges_calibrated}</div>
                  <div className="text-gray-400 text-sm">Edges Updated</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400">{calibrationResult.drift_alerts?.length || 0}</div>
                  <div className="text-gray-400 text-sm">Drift Alerts</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">{calibrationResult.mode}</div>
                  <div className="text-gray-400 text-sm">Mode</div>
                </div>
              </div>
            </div>

            {/* Edge Changes */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Edge Weight Changes</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {calibrationResult.calibrations?.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-900 rounded text-sm">
                    <span className="text-gray-300 font-mono flex-1">{c.edge_key}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">{c.previous_weight?.toFixed(4)}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-white font-bold">{c.new_weight?.toFixed(4)}</span>
                      <span className={`text-xs font-mono ${c.drift_pct > 0 ? "text-green-400" : "text-red-400"}`}>
                        {c.drift_pct > 0 ? "+" : ""}{c.drift_pct?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── Screen: Portfolio Decision View ───────────────────────

  function PortfolioView() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Portfolio Decision View</h2>

        {result ? (
          <>
            {/* Portfolio Scores */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Motor Retail — Kuwait</h3>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(result.scores).map(([key, val]) => (
                  <div key={key} className="bg-gray-900 rounded-lg p-4 text-center">
                    <div className={`text-3xl font-bold ${val >= 65 ? "text-red-400" : val >= 45 ? "text-yellow-400" : "text-green-400"}`}>
                      {val}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {key.replace(/_score$/, "").replace(/_/g, " ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Action Recommendations</h3>
              {result.recommendations && result.recommendations.length > 0 ? (
                result.recommendations.map((r: any, i: number) => (
                  <div key={i} className="mb-3 p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        r.priority === "critical" ? "bg-red-600 text-white" :
                        r.priority === "high" ? "bg-orange-500 text-white" :
                        r.priority === "medium" ? "bg-yellow-500 text-gray-900" :
                        "bg-gray-600 text-white"
                      }`}>{r.priority}</span>
                      <span className="text-xs text-gray-500 uppercase">{r.action_type?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="text-white font-medium">{r.title}</div>
                    <div className="text-gray-400 text-sm mt-1">{r.rationale}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No critical recommendations at current risk levels</p>
              )}
            </div>

            {/* Explainability */}
            {result.explainability && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Explainability</h3>
                <p className="text-gray-300 mb-4">{result.explainability.narrative_summary}</p>
                {result.explainability.market_profile_notes?.map((n: string, i: number) => (
                  <div key={i} className="py-1 text-sm text-gray-400">• {n}</div>
                ))}
              </div>
            )}

            {/* Prediction History */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Prediction History</h3>
              {predictions.length > 0 ? (
                <div className="space-y-2">
                  {predictions.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-900 rounded text-sm">
                      <span className="text-blue-300 font-mono">{p.assessment_id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${riskBadge(p.risk_level)}`}>{p.risk_level}</span>
                      <span className="text-gray-400">{p.prediction_date?.slice(0, 19)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No predictions yet</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Run the scoring pipeline first to see portfolio view</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Layout ─────────────────────────────────────────────────

  const screens: { key: Screen; label: string; icon: string }[] = [
    { key: "command", label: "Command Center", icon: "🎯" },
    { key: "market", label: "Market View", icon: "🌍" },
    { key: "calibration", label: "Calibration", icon: "⚖️" },
    { key: "portfolio", label: "Portfolio", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Deevo Cortex</h1>
            <p className="text-gray-400 text-sm">Kuwait Motor Adaptive Risk Engine v3.0</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${healthy ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-gray-400 text-sm">{healthy ? "Connected" : "Offline"}</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-900/50 border-b border-gray-800 px-6">
        <div className="flex gap-1 max-w-7xl mx-auto">
          {screens.map((s) => (
            <button
              key={s.key}
              onClick={() => setScreen(s.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                screen === s.key
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {screen === "command" && <CommandCenter />}
        {screen === "market" && <MarketView />}
        {screen === "calibration" && <CalibrationConsole />}
        {screen === "portfolio" && <PortfolioView />}
      </main>
    </div>
  );
}
