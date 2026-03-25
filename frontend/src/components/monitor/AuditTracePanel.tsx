"use client";

import { Shield, Clock, CheckCircle, Hash, Database, Activity } from "lucide-react";

// ─── Audit Data ───────────────────────────────────────────────
interface AuditEntry {
  id: string;
  component: string;
  action: string;
  timestamp: string;
  sha256: string;
  status: "verified" | "pending" | "drift";
}

const AUDIT_LOG: AuditEntry[] = [
  {
    id: "AUD-001",
    component: "Signal Ingestion",
    action: "Oil price signal updated from Bloomberg feed",
    timestamp: "2026-03-25T08:30:00Z",
    sha256: "a3f2c8d1e9b4...7k2m",
    status: "verified",
  },
  {
    id: "AUD-002",
    component: "Graph Calibration",
    action: "Edge weights recalibrated — 4 edges updated",
    timestamp: "2026-03-25T08:15:00Z",
    sha256: "b7e4a1f3c9d2...8n5p",
    status: "verified",
  },
  {
    id: "AUD-003",
    component: "Risk Scoring",
    action: "Composite risk score recalculated: 64 (HIGH)",
    timestamp: "2026-03-25T08:00:00Z",
    sha256: "c1d9b3e7a4f6...2j8q",
    status: "verified",
  },
  {
    id: "AUD-004",
    component: "FRIN Analytics",
    action: "Fraud cluster scan completed — 3 active clusters",
    timestamp: "2026-03-24T22:00:00Z",
    sha256: "d4f2a8c1b7e3...9r4s",
    status: "verified",
  },
  {
    id: "AUD-005",
    component: "Calibration Engine",
    action: "Drift alert: fraud_clusters→fraud_exposure edge drifted 25%",
    timestamp: "2026-03-24T14:00:00Z",
    sha256: "e8b3d1a7c4f9...6t2u",
    status: "drift",
  },
];

const STATUS_STYLES: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  verified: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "rgba(16,185,129,0.08)",
  },
  pending: {
    icon: Clock,
    color: "text-amber-400",
    bg: "rgba(245,158,11,0.08)",
  },
  drift: {
    icon: Activity,
    color: "text-red-400",
    bg: "rgba(239,68,68,0.08)",
  },
};

export default function AuditTracePanel() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-neutral-500 rounded-full" />
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          Audit Trail & Data Provenance
        </h3>
        <span className="text-[9px] text-neutral-700 ml-auto">
          SHA-256 verified · IFRS 17 compliant
        </span>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: "var(--cortex-panel)", border: "1px solid var(--cortex-border)" }}
      >
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2" style={{ borderBottom: "1px solid var(--cortex-border)" }}>
          <span className="col-span-1 text-[8px] text-neutral-600 uppercase tracking-wider">Status</span>
          <span className="col-span-2 text-[8px] text-neutral-600 uppercase tracking-wider">Component</span>
          <span className="col-span-5 text-[8px] text-neutral-600 uppercase tracking-wider">Action</span>
          <span className="col-span-2 text-[8px] text-neutral-600 uppercase tracking-wider">SHA-256</span>
          <span className="col-span-2 text-[8px] text-neutral-600 uppercase tracking-wider">Time</span>
        </div>

        {/* Rows */}
        {AUDIT_LOG.map((entry) => {
          const style = STATUS_STYLES[entry.status] || STATUS_STYLES.pending;
          const StatusIcon = style.icon;
          const time = new Date(entry.timestamp);
          const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
          const dateStr = `${time.getDate()} Mar`;

          return (
            <div
              key={entry.id}
              className="grid grid-cols-12 gap-2 px-4 py-2 hover:bg-white/[0.01] transition-colors"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
            >
              <div className="col-span-1 flex items-center">
                <StatusIcon className={`w-3.5 h-3.5 ${style.color}`} />
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-neutral-300 font-medium">{entry.component}</span>
              </div>
              <div className="col-span-5">
                <span className="text-[10px] text-neutral-500">{entry.action}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <Hash className="w-2.5 h-2.5 text-neutral-700" />
                <span className="text-[9px] text-neutral-600 font-mono tabular-nums truncate">
                  {entry.sha256}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <span className="text-[9px] text-neutral-600 tabular-nums">
                  {dateStr} {timeStr}
                </span>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: "1px solid var(--cortex-border)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-neutral-600" />
              <span className="text-[8px] text-neutral-700">PostgreSQL</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-neutral-600" />
              <span className="text-[8px] text-neutral-700">PDPL Compliant</span>
            </div>
          </div>
          <span className="text-[8px] text-neutral-700">v3.0.0 · {AUDIT_LOG.length} entries</span>
        </div>
      </div>
    </section>
  );
}
