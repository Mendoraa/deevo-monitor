"use client";

import ScoreGauge from "@/components/ui/ScoreGauge";
import RiskBadge from "@/components/ui/RiskBadge";
import TrendArrow from "@/components/ui/TrendArrow";
import { MOCK_SCORES, MOCK_OVERALL_RISK, MOCK_SIGNALS } from "@/lib/mock-data";
import { BarChart3, Target, Layers } from "lucide-react";

// Score to driver mapping (matches backend SCORE_WEIGHTS)
const SCORE_DRIVERS: Record<string, string[]> = {
  market_stress: ["oil_price", "inflation_rate", "consumer_liquidity_pressure"],
  claims_pressure: ["motor_claims_frequency", "motor_claims_severity", "repair_cost_inflation"],
  fraud_exposure: ["fraud_cluster_density", "garage_network_risk"],
  underwriting_risk: ["underwriting_drift", "pricing_adequacy_gap"],
  portfolio_stability: ["market_stress", "claims_pressure", "fraud_exposure", "underwriting_risk"],
};

export default function KuwaitMotor() {
  const scores = MOCK_SCORES;
  const overall = MOCK_OVERALL_RISK;
  const signals = MOCK_SIGNALS;

  const signalMap = Object.fromEntries(signals.map((s) => [s.indicator, s]));

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-cortex-accent/15 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cortex-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kuwait Motor Retail Portfolio</h3>
              <p className="text-[11px] text-cortex-muted">
                Market: KWT | Portfolio: motor_retail | Composite Score: {overall.composite_score}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] text-cortex-muted">Confidence</div>
              <div className="text-sm font-bold text-white">{(overall.confidence * 100).toFixed(0)}%</div>
            </div>
            <RiskBadge level={overall.level} size="md" />
          </div>
        </div>
      </div>

      {/* Score Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scores.map((score) => {
          const drivers = SCORE_DRIVERS[score.key] || [];
          return (
            <div key={score.key} className={`panel panel-hover severity-${score.risk_level}`}>
              <div className="flex items-start gap-4">
                {/* Gauge */}
                <ScoreGauge
                  value={score.value}
                  label=""
                  risk_level={score.risk_level}
                  size="md"
                />

                {/* Detail */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">{score.label}</h4>
                    <div className="flex items-center gap-2">
                      <TrendArrow trend={score.trend} delta={score.delta} className="text-xs" />
                      <RiskBadge level={score.risk_level} />
                    </div>
                  </div>
                  <p className="text-[11px] text-cortex-muted mb-3">{score.description}</p>

                  {/* Driver signals */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <BarChart3 className="w-3 h-3 text-cortex-muted" />
                      <span className="text-[9px] text-cortex-muted uppercase tracking-wider font-medium">
                        Key Drivers
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {drivers.map((driverKey) => {
                        const sig = signalMap[driverKey];
                        return (
                          <div
                            key={driverKey}
                            className="flex items-center justify-between py-1 px-2 rounded bg-cortex-bg"
                          >
                            <span className="text-[11px] text-cortex-text">
                              {sig?.label || driverKey.replace(/_/g, " ")}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1 rounded-full bg-cortex-border overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${sig?.normalized || 50}%`,
                                    backgroundColor:
                                      (sig?.normalized || 50) > 70
                                        ? "#ef4444"
                                        : (sig?.normalized || 50) > 50
                                          ? "#f59e0b"
                                          : "#10b981",
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-cortex-muted w-8 text-right">
                                {sig?.normalized?.toFixed(0) || "—"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Score Comparison Bar */}
      <div className="panel">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-cortex-muted" />
          <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
            Score Comparison
          </h3>
        </div>
        <div className="space-y-3">
          {scores.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-xs text-cortex-muted w-36 truncate">{s.label}</span>
              <div className="flex-1 h-4 rounded bg-cortex-bg overflow-hidden relative">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${s.value}%`,
                    backgroundColor:
                      s.risk_level === "critical"
                        ? "#ef4444"
                        : s.risk_level === "high"
                          ? "#f97316"
                          : s.risk_level === "medium"
                            ? "#f59e0b"
                            : "#10b981",
                  }}
                />
                {/* Threshold markers */}
                <div className="absolute top-0 bottom-0 left-[30%] w-px bg-cortex-border/50" />
                <div className="absolute top-0 bottom-0 left-[60%] w-px bg-cortex-border/50" />
                <div className="absolute top-0 bottom-0 left-[80%] w-px bg-cortex-border/50" />
              </div>
              <span className="text-sm font-bold text-white w-8 text-right">{s.value}</span>
              <RiskBadge level={s.risk_level} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-cortex-muted px-40">
          <span>Low (30)</span>
          <span>Medium (60)</span>
          <span>High (80)</span>
        </div>
      </div>
    </div>
  );
}
