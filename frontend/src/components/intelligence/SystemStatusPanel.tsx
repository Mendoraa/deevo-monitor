"use client";

import { Activity, Database, GitBranch, Cpu, Lock, BarChart3, Layers } from "lucide-react";

interface SystemLayer {
  name: string;
  status: "operational" | "degraded" | "offline";
  detail: string;
  icon: React.ElementType;
}

const LAYERS: SystemLayer[] = [
  { name: "Signal Ingestion", status: "operational", detail: "9 signals processed", icon: Database },
  { name: "Event Classification", status: "operational", detail: "NLP + rule engine", icon: Layers },
  { name: "Economic Agents", status: "operational", detail: "5 agents online", icon: Cpu },
  { name: "Graph Reasoning", status: "operational", detail: "15 nodes, 15 edges", icon: GitBranch },
  { name: "Scoring Engine", status: "operational", detail: "5 composite scores", icon: BarChart3 },
  { name: "Calibration", status: "operational", detail: "EMA α=0.3", icon: Activity },
  { name: "Audit Trail", status: "operational", detail: "SHA-256 verified", icon: Lock },
];

const STATUS_COLORS = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  offline: "bg-red-500",
};

export default function SystemStatusPanel() {
  const allOperational = LAYERS.every((l) => l.status === "operational");

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
        <h2 className="section-title">System Trust</h2>
        {allOperational && (
          <span className="text-[10px] text-emerald-400 ml-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            All layers operational
          </span>
        )}
      </div>

      <div className="intel-panel p-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">
              7-Layer Intelligence Stack
            </span>
            <span className="text-[10px] text-neutral-600 tabular-nums">v3.0.0</span>
          </div>
        </div>

        {/* Layers */}
        <div className="divide-y divide-neutral-800/30">
          {LAYERS.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.name}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/20 transition-colors"
              >
                <span className="text-[10px] text-neutral-700 w-4 tabular-nums">
                  {i + 1}
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    STATUS_COLORS[layer.status]
                  }`}
                />
                <Icon className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs text-neutral-300 flex-1">
                  {layer.name}
                </span>
                <span className="text-[10px] text-neutral-600">
                  {layer.detail}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-800/50 bg-neutral-900/30">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-neutral-600">
              Pipeline: Data → Features → Models → Agents → APIs → UI → Governance
            </span>
            <span className="text-neutral-500 tabular-nums">
              Confidence: 82%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
