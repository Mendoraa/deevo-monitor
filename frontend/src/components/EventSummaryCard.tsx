"use client";

import type { NormalizedEvent } from "@/types/economic-layer";

interface Props {
  event: NormalizedEvent;
}

function severityColor(severity: number): string {
  if (severity >= 0.85) return "text-red-400";
  if (severity >= 0.65) return "text-amber-400";
  return "text-green-400";
}

function severityLabel(severity: number): string {
  if (severity >= 0.85) return "CRITICAL";
  if (severity >= 0.65) return "HIGH";
  if (severity >= 0.4) return "MODERATE";
  return "LOW";
}

export default function EventSummaryCard({ event }: Props) {
  return (
    <div className="panel severity-high">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
          Event Summary
        </h3>
        <span className={`text-xs font-bold ${severityColor(event.severity)}`}>
          {severityLabel(event.severity)}
        </span>
      </div>
      <p className="text-white font-medium text-sm leading-relaxed mb-3">
        {event.title}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-0.5 text-xs rounded bg-cortex-border text-cortex-muted">
          {event.category.replace(/_/g, " ")}
        </span>
        <span className="px-2 py-0.5 text-xs rounded bg-cortex-border text-cortex-muted">
          {event.region}
        </span>
        <span className="px-2 py-0.5 text-xs rounded bg-cortex-border text-cortex-muted">
          Confidence: {(event.source_confidence * 100).toFixed(0)}%
        </span>
        <span className="px-2 py-0.5 text-xs rounded bg-cortex-border text-cortex-muted">
          {event.subtype.replace(/_/g, " ")}
        </span>
      </div>
    </div>
  );
}
