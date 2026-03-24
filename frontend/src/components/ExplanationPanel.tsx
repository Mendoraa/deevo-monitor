"use client";

import type { ExplanationBundle } from "@/types/cortex";

interface Props {
  data: ExplanationBundle;
}

export default function ExplanationPanel({ data }: Props) {
  const isElevated = data.systemic_risk_summary.includes("ELEVATED");

  return (
    <div className="panel space-y-4">
      <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
        Decision Intelligence Brief
      </h3>

      {/* What Happened */}
      <div className={`p-3 bg-cortex-bg rounded-lg border-l-2 ${isElevated ? "border-red-500" : "border-blue-500"}`}>
        <p className="text-xs text-cortex-muted mb-1 font-semibold">What Happened</p>
        <p className="text-sm text-white leading-relaxed">{data.what_happened}</p>
      </div>

      {/* Why It Matters */}
      <div className="p-3 bg-cortex-bg rounded-lg border-l-2 border-amber-500">
        <p className="text-xs text-cortex-muted mb-1 font-semibold">Why It Matters</p>
        <p className="text-sm text-cortex-text leading-relaxed">{data.why_it_matters}</p>
      </div>

      {/* How It Propagates */}
      <div className="p-3 bg-cortex-bg rounded-lg">
        <p className="text-xs text-cortex-muted mb-2 font-semibold">How It Propagates</p>
        <div className="space-y-1">
          {data.how_it_propagates.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs text-cortex-accent font-mono w-4 shrink-0 mt-0.5">{i + 1}.</span>
              <p className="text-xs text-cortex-text">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Economic + Insurance Narratives */}
      <div className="grid grid-cols-1 gap-3">
        <div className="p-3 bg-cortex-bg rounded-lg border-l-2 border-cyan-500">
          <p className="text-xs text-cortex-muted mb-1 font-semibold">Economic Analysis</p>
          <p className="text-xs text-cortex-text leading-relaxed">{data.economic_narrative}</p>
        </div>
        <div className="p-3 bg-cortex-bg rounded-lg border-l-2 border-purple-500">
          <p className="text-xs text-cortex-muted mb-1 font-semibold">Insurance Analysis</p>
          <p className="text-xs text-cortex-text leading-relaxed">{data.insurance_narrative}</p>
        </div>
      </div>

      {/* Systemic Risk */}
      <div className={`p-3 rounded-lg border ${isElevated ? "border-red-500/30 bg-red-500/5" : "border-cortex-border bg-cortex-bg"}`}>
        <p className="text-xs text-cortex-muted mb-1 font-semibold">Systemic Risk</p>
        <p className={`text-sm leading-relaxed ${isElevated ? "text-red-300" : "text-cortex-text"}`}>
          {data.systemic_risk_summary}
        </p>
      </div>

      {/* What To Do */}
      <div className="p-3 bg-cortex-accent/10 rounded-lg border border-cortex-accent/30">
        <p className="text-xs text-cortex-accent mb-1 font-semibold">Recommended Action</p>
        <p className="text-sm text-white leading-relaxed">{data.what_to_do}</p>
      </div>

      {/* Confidence */}
      <div className="text-xs text-cortex-muted">
        {data.confidence_assessment}
      </div>
    </div>
  );
}
