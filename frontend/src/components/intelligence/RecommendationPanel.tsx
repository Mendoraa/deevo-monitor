"use client";

import { AlertCircle, ArrowUpRight, Shield, Ban } from "lucide-react";
import { MOCK_RECOMMENDATIONS, type RecommendationData } from "@/lib/mock-data";

const PRIORITY_CONFIG = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: AlertCircle },
  high: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", icon: ArrowUpRight },
  medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: Shield },
  low: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", icon: Ban },
};

function RecCard({ rec }: { rec: RecommendationData }) {
  const cfg = PRIORITY_CONFIG[rec.priority];
  const Icon = cfg.icon;

  return (
    <div className={`rec-card ${cfg.bg} border ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-neutral-500">
              {rec.rule_id}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
              {rec.priority}
            </span>
            <span className="text-[10px] text-neutral-600">
              {rec.action_type.replace(/_/g, " ")}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white mb-1">{rec.title}</h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {rec.rationale}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {rec.affected_scores.map((s) => (
              <span
                key={s}
                className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500"
              >
                {s.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationPanel() {
  const recs = MOCK_RECOMMENDATIONS;
  const sorted = [...recs].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-orange-500 rounded-full" />
          <h2 className="section-title">Recommendations</h2>
          <span className="text-[10px] text-neutral-600 ml-2">
            {recs.length} active of 12 rules
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((rec) => (
          <RecCard key={rec.rule_id} rec={rec} />
        ))}
      </div>
    </section>
  );
}
