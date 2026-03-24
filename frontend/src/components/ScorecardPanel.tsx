"use client";

import type { GCCScorecard, InsuranceScore } from "@/types/cortex";

interface Props {
  scorecards: GCCScorecard[];
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-400", bar: "bg-red-500" },
  high: { bg: "bg-red-500/10", text: "text-red-300", bar: "bg-red-400" },
  "medium-high": { bg: "bg-amber-500/10", text: "text-amber-300", bar: "bg-amber-400" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-300", bar: "bg-amber-500" },
  "low-medium": { bg: "bg-blue-500/10", text: "text-blue-300", bar: "bg-blue-400" },
  low: { bg: "bg-green-500/10", text: "text-green-300", bar: "bg-green-400" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  saudi: "🇸🇦",
  uae: "🇦🇪",
  kuwait: "🇰🇼",
  qatar: "🇶🇦",
  bahrain: "🇧🇭",
  oman: "🇴🇲",
};

const TREND_ICONS: Record<string, string> = {
  improving: "↗",
  stable: "→",
  deteriorating: "↘",
};

function ScoreBar({ score }: { score: InsuranceScore }) {
  const style = LEVEL_COLORS[score.level] || LEVEL_COLORS.low;
  const trend = TREND_ICONS[score.trend] || "→";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-cortex-muted">{score.name}</span>
        <span className={`text-xs font-bold ${style.text}`}>
          {score.score}/100 {trend}
        </span>
      </div>
      <div className="h-1.5 bg-cortex-border rounded-full overflow-hidden">
        <div
          className={`h-full ${style.bar} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, score.score)}%` }}
        />
      </div>
    </div>
  );
}

function CountryCard({ card }: { card: GCCScorecard }) {
  const overall = LEVEL_COLORS[card.overall_risk] || LEVEL_COLORS.low;
  const flag = COUNTRY_FLAGS[card.country] || "🌍";

  return (
    <div className="p-3 bg-cortex-bg rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <span className="text-sm text-white font-medium capitalize">
            {card.country}
          </span>
        </div>
        <span className={`px-2 py-0.5 text-xs font-bold rounded ${overall.bg} ${overall.text}`}>
          {card.overall_risk.toUpperCase()}
        </span>
      </div>

      {/* 4 Score Bars */}
      <div className="space-y-2">
        <ScoreBar score={card.market_stress} />
        <ScoreBar score={card.claims_pressure} />
        <ScoreBar score={card.fraud_exposure} />
        <ScoreBar score={card.underwriting_risk} />
      </div>

      {/* Actions */}
      {card.recommended_actions.length > 0 && (
        <div className="pt-2 border-t border-cortex-border">
          {card.recommended_actions.slice(0, 2).map((action, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs mt-1">
              <span className="text-cortex-accent shrink-0 mt-0.5">▸</span>
              <span className="text-cortex-text">{action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScorecardPanel({ scorecards }: Props) {
  if (!scorecards || scorecards.length === 0) return null;

  // Summary stats
  const maxScore = Math.max(
    ...scorecards.flatMap((s) => [
      s.market_stress.score,
      s.claims_pressure.score,
      s.fraud_exposure.score,
      s.underwriting_risk.score,
    ])
  );
  const criticalCount = scorecards.filter(
    (s) => s.overall_risk === "critical" || s.overall_risk === "high"
  ).length;

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
          GCC Insurance Scorecards
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-cortex-muted">Peak Score:</span>
          <span className={`font-bold ${maxScore > 60 ? "text-red-400" : maxScore > 35 ? "text-amber-400" : "text-green-400"}`}>
            {maxScore}/100
          </span>
          {criticalCount > 0 && (
            <span className="text-red-400 font-bold">
              {criticalCount} elevated
            </span>
          )}
        </div>
      </div>

      {/* Score Legend */}
      <div className="flex gap-3 text-xs text-cortex-muted">
        <span>MS = Market Stress</span>
        <span>CP = Claims Pressure</span>
        <span>FE = Fraud Exposure</span>
        <span>UR = Underwriting Risk</span>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scorecards.map((card) => (
          <CountryCard key={card.country} card={card} />
        ))}
      </div>
    </div>
  );
}
