"use client";

import { AlertTriangle, ArrowRight, Brain, Shield } from "lucide-react";
import type { ExplanationBundle } from "@/types/cortex";

interface DecisionPanelProps {
  insight?: string;
  explanation?: ExplanationBundle;
}

export default function DecisionPanel({
  insight,
  explanation,
}: DecisionPanelProps) {
  const hasData = insight || explanation;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-red-500 rounded-full" />
        <h2 className="section-title">Decision Intelligence</h2>
      </div>

      {!hasData ? (
        <div className="intel-panel p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Run an analysis to generate decision insights
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                The decision engine synthesizes economic reasoning, insurance
                risk scoring, and scenario analysis into actionable executive
                guidance.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Primary insight */}
          {insight && (
            <div className="intel-panel decision-highlight p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400/70 font-semibold">
                    Decision Insight
                  </span>
                  <p className="text-sm text-neutral-200 leading-relaxed mt-1">
                    {insight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Explanation breakdown */}
          {explanation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* What happened */}
              <div className="intel-panel p-4">
                <span className="text-[10px] uppercase tracking-widest text-blue-400/70 font-semibold">
                  What Happened
                </span>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {explanation.what_happened}
                </p>
              </div>

              {/* Why it matters */}
              <div className="intel-panel p-4">
                <span className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-semibold">
                  Why It Matters
                </span>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {explanation.why_it_matters}
                </p>
              </div>

              {/* What to do */}
              <div className="intel-panel p-4 md:col-span-2">
                <span className="text-[10px] uppercase tracking-widest text-red-400/70 font-semibold">
                  What To Do
                </span>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {explanation.what_to_do}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
