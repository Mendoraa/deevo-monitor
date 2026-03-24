"use client";

import { MOCK_CALIBRATION } from "@/lib/mock-data";
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  RotateCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function Calibration() {
  const entries = MOCK_CALIBRATION;

  const correctCount = entries.filter((e) => e.direction === "correct").length;
  const wrongCount = entries.filter((e) => e.direction === "wrong").length;
  const avgMagnitudeError =
    entries.reduce((sum, e) => sum + e.magnitude_error, 0) / entries.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="panel">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">
            Edges Calibrated
          </div>
          <div className="text-2xl font-bold text-white">{entries.length}</div>
          <div className="text-[10px] text-cortex-muted">Last cycle</div>
        </div>
        <div className="panel">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">
            Direction Correct
          </div>
          <div className="text-2xl font-bold text-cortex-green">{correctCount}</div>
          <div className="text-[10px] text-cortex-muted">
            {((correctCount / entries.length) * 100).toFixed(0)}% accuracy
          </div>
        </div>
        <div className="panel">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">
            Direction Wrong
          </div>
          <div className="text-2xl font-bold text-red-400">{wrongCount}</div>
          <div className="text-[10px] text-cortex-muted">
            Weight reduced x0.90
          </div>
        </div>
        <div className="panel">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">
            Avg Magnitude Error
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {(avgMagnitudeError * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-cortex-muted">
            Target: &lt;20%
          </div>
        </div>
      </div>

      {/* Calibration Policy */}
      <div className="panel">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-cortex-muted" />
          <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
            Calibration Policy
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-cortex-bg border border-cortex-border">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium text-white">Wrong Direction</span>
            </div>
            <p className="text-[10px] text-cortex-muted">
              Weight x0.90, Confidence x0.85
            </p>
          </div>
          <div className="p-3 rounded-lg bg-cortex-bg border border-cortex-border">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-white">Magnitude Error &gt;20%</span>
            </div>
            <p className="text-[10px] text-cortex-muted">
              Weight x0.95, Confidence x0.90
            </p>
          </div>
          <div className="p-3 rounded-lg bg-cortex-bg border border-cortex-border">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-cortex-green" />
              <span className="text-xs font-medium text-white">Excellent (&lt;10%)</span>
            </div>
            <p className="text-[10px] text-cortex-muted">
              Weight x1.01, Confidence x1.02
            </p>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-cortex-muted">
          EMA smoothing: alpha = 0.3 | Weight clamp: [0.05, 1.50]
        </div>
      </div>

      {/* Calibration History Table */}
      <div className="panel">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-4">
          Calibration History — Last Cycle
        </h3>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border transition-colors ${
                entry.direction === "correct"
                  ? "border-cortex-border bg-cortex-bg hover:border-green-500/20"
                  : "border-red-500/20 bg-red-500/5 hover:border-red-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Edge info */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-cortex-muted bg-cortex-panel px-1.5 py-0.5 rounded">
                      {entry.id}
                    </span>
                    <span className="text-xs font-medium text-white">
                      {entry.source_label}
                    </span>
                    <ArrowRight className="w-3 h-3 text-cortex-muted" />
                    <span className="text-xs font-medium text-white">
                      {entry.target_label}
                    </span>
                  </div>

                  {/* Weight change */}
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-[9px] text-cortex-muted uppercase tracking-wider mb-1">
                        Weight Change
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-cortex-muted">
                          {entry.old_weight.toFixed(3)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-cortex-muted" />
                        <span className="text-sm font-mono font-bold text-white">
                          {entry.new_weight.toFixed(3)}
                        </span>
                        <span
                          className={`text-[10px] ${
                            entry.new_weight > entry.old_weight
                              ? "text-cortex-green"
                              : "text-red-400"
                          }`}
                        >
                          {entry.new_weight > entry.old_weight ? (
                            <TrendingUp className="w-3 h-3 inline" />
                          ) : (
                            <TrendingDown className="w-3 h-3 inline" />
                          )}
                          {" "}
                          {(
                            ((entry.new_weight - entry.old_weight) /
                              entry.old_weight) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-cortex-muted uppercase tracking-wider mb-1">
                        Confidence Change
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-cortex-muted">
                          {(entry.old_confidence * 100).toFixed(0)}%
                        </span>
                        <ArrowRight className="w-3 h-3 text-cortex-muted" />
                        <span className="text-sm font-mono font-bold text-white">
                          {(entry.new_confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direction + Error badge */}
                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                      entry.direction === "correct"
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {entry.direction === "correct" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs font-medium capitalize">
                      {entry.direction}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-cortex-muted">
                    Mag. Error:{" "}
                    <span
                      className={
                        entry.magnitude_error > 0.2
                          ? "text-red-400 font-medium"
                          : "text-cortex-text"
                      }
                    >
                      {(entry.magnitude_error * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Loop Diagram */}
      <div className="panel">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-4">
          Adaptive Feedback Loop
        </h3>
        <div className="flex items-center justify-center gap-3 py-4">
          {[
            { label: "Prediction", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
            { label: "Outcome", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
            { label: "Error Analysis", color: "bg-red-500/15 text-red-400 border-red-500/30" },
            { label: "Calibration", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
            { label: "Weight Update", color: "bg-green-500/15 text-green-400 border-green-500/30" },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`px-3 py-2 rounded-lg border text-xs font-medium ${step.color}`}
              >
                {step.label}
              </div>
              {i < 4 && (
                <ArrowRight className="w-4 h-4 text-cortex-border" />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-[10px] text-cortex-muted mt-2">
          Continuous loop — each scoring run feeds back into the next calibration cycle
        </div>
      </div>
    </div>
  );
}
