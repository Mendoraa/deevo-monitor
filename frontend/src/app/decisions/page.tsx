"use client";

import NavRail from "@/components/platform/NavRail";
import TopStatusBar from "@/components/platform/TopStatusBar";
import KPIBar from "@/components/platform/KPIBar";
import {
  Target,
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Zap,
  FileText,
} from "lucide-react";

// ─── Decision Queue Data ──────────────────────────────────────
interface Decision {
  id: string;
  action: string;
  rationale: string;
  confidence: number;
  urgency: "critical" | "high" | "medium" | "low";
  targetUnit: string;
  expectedImpact: string;
  owner: string;
  evidence: string[];
  status: "pending" | "acknowledged" | "executed";
  timestamp: string;
}

const DECISIONS: Decision[] = [
  {
    id: "DEC-001",
    action: "Increase motor IBNR reserves by 12%",
    rationale: "Oil-driven repair cost inflation combined with fraud cluster expansion creates a dual pressure vector on motor claims severity. Current reserves are insufficient for projected 30-day trajectory.",
    confidence: 0.87,
    urgency: "critical",
    targetUnit: "Reserving / Actuarial",
    expectedImpact: "KWD 1.2M reserve increase; prevents adverse development",
    owner: "Chief Actuary",
    evidence: ["Oil at $89.5 → repair cost pass-through", "Fraud cluster: 23 flagged claims in Hawally", "Claims severity +12% MoM"],
    status: "pending",
    timestamp: "2m ago",
  },
  {
    id: "DEC-002",
    action: "Deploy SIU task force to Hawally/Salmiya workshop cluster",
    rationale: "Network analysis identifies coordinated billing patterns across 3 workshops. Estimated leakage KWD 185K. Early intervention before cluster expands to adjacent zones.",
    confidence: 0.82,
    urgency: "critical",
    targetUnit: "SIU / Fraud",
    expectedImpact: "Recover KWD 120-185K; disrupt fraud network",
    owner: "Head of SIU",
    evidence: ["3 workshop clusters identified", "23 claims with pattern anomaly", "Provider billing deviation: +34% above mean"],
    status: "pending",
    timestamp: "8m ago",
  },
  {
    id: "DEC-003",
    action: "Trigger reinsurance treaty review for marine exposure",
    rationale: "Hormuz tension index at 78/100 materially increases marine transit risk. Current treaty terms may be inadequate if Strait disruption escalates to elevated scenario.",
    confidence: 0.75,
    urgency: "high",
    targetUnit: "Reinsurance",
    expectedImpact: "Secure coverage adequacy; reduce net retention exposure",
    owner: "CRO",
    evidence: ["Hormuz tension: 78/100", "Marine premium exposure: KWD 8.4M", "Historical analog: 2019 tanker crisis"],
    status: "acknowledged",
    timestamp: "15m ago",
  },
  {
    id: "DEC-004",
    action: "Adjust motor pricing model: +6% technical rate for new policies",
    rationale: "Pricing adequacy gap widening to 0.62. If gap exceeds 0.65 threshold (elevated scenario trigger), portfolio enters loss territory. Proactive rate adjustment prevents adverse selection.",
    confidence: 0.70,
    urgency: "high",
    targetUnit: "Underwriting / Pricing",
    expectedImpact: "+6% rate adequacy; closes projected gap within 60 days",
    owner: "Chief Underwriter",
    evidence: ["Pricing gap: 0.62 → 0.65 threshold", "Loss ratio trend: +3.2pp QoQ", "Competitor benchmark: market adjusting +4-8%"],
    status: "pending",
    timestamp: "22m ago",
  },
  {
    id: "DEC-005",
    action: "Brief executive committee on scenario escalation risk",
    rationale: "Compound risk index at 64 with 35% probability of elevated scenario activation within 30 days. Executive awareness required for strategic positioning.",
    confidence: 0.91,
    urgency: "medium",
    targetUnit: "Executive / Strategy",
    expectedImpact: "Strategic alignment; pre-position for scenario escalation",
    owner: "CEO",
    evidence: ["DRI: 64 (HIGH)", "Elevated scenario probability: 35%", "2 of 3 elevated triggers approaching threshold"],
    status: "executed",
    timestamp: "45m ago",
  },
  {
    id: "DEC-006",
    action: "Monitor UAE marine portfolio — no action required",
    rationale: "UAE DRI at 38 (stable). Marine exposure within acceptable parameters. Continue monitoring; escalate if Hormuz tension crosses 85.",
    confidence: 0.88,
    urgency: "low",
    targetUnit: "Regional / UAE",
    expectedImpact: "Maintain current posture; reduce overhead",
    owner: "Regional Manager UAE",
    evidence: ["UAE DRI: 38 (stable)", "Marine portfolio healthy", "No anomalies detected"],
    status: "executed",
    timestamp: "1h ago",
  },
];

const URG_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  acknowledged: "#3b82f6",
  executed: "#10b981",
};

function DecisionCard({ decision }: { decision: Decision }) {
  const urgColor = URG_COLORS[decision.urgency];
  const statusColor = STATUS_COLORS[decision.status];

  return (
    <div
      style={{
        background: "var(--cx-surface)",
        border: "1px solid var(--cx-border)",
        borderLeft: `3px solid ${urgColor}`,
        borderRadius: "6px",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--cx-border)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-[7px] font-bold tracking-[0.1em] px-2 py-0.5 rounded uppercase"
            style={{ background: `${urgColor}15`, color: urgColor }}
          >
            {decision.urgency}
          </span>
          <span
            className="text-[7px] font-bold tracking-[0.1em] px-2 py-0.5 rounded uppercase"
            style={{ background: `${statusColor}15`, color: statusColor }}
          >
            {decision.status}
          </span>
          <span className="text-[7px] font-mono text-dim ml-auto">{decision.id}</span>
        </div>
        <h3 className="text-[11px] font-bold text-bright leading-tight">{decision.action}</h3>
      </div>

      {/* Rationale */}
      <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--cx-border)" }}>
        <p className="text-[9px] text-muted leading-relaxed">{decision.rationale}</p>
      </div>

      {/* Meta grid */}
      <div className="px-4 py-2 grid grid-cols-2 gap-3" style={{ borderBottom: "1px solid var(--cx-border)" }}>
        <div>
          <span className="text-[7px] text-dim tracking-wider uppercase">Target</span>
          <div className="text-[9px] font-semibold text-bright">{decision.targetUnit}</div>
        </div>
        <div>
          <span className="text-[7px] text-dim tracking-wider uppercase">Owner</span>
          <div className="text-[9px] font-semibold text-bright">{decision.owner}</div>
        </div>
        <div>
          <span className="text-[7px] text-dim tracking-wider uppercase">Confidence</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="conf-bar flex-1">
              <div className="conf-bar-fill" style={{ width: `${decision.confidence * 100}%`, background: urgColor }} />
            </div>
            <span className="text-[9px] font-bold font-mono" style={{ color: urgColor }}>
              {Math.round(decision.confidence * 100)}%
            </span>
          </div>
        </div>
        <div>
          <span className="text-[7px] text-dim tracking-wider uppercase">Expected Impact</span>
          <div className="text-[9px] font-semibold text-bright">{decision.expectedImpact}</div>
        </div>
      </div>

      {/* Evidence */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <FileText className="w-3 h-3 text-muted" />
          <span className="text-[7px] text-dim tracking-wider uppercase">Evidence</span>
        </div>
        {decision.evidence.map((ev, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <ChevronRight className="w-2.5 h-2.5 text-dim flex-shrink-0" />
            <span className="text-[8px] text-muted">{ev}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 flex items-center"
        style={{ background: "rgba(0,0,0,0.15)", borderTop: "1px solid var(--cx-border)" }}
      >
        <Clock className="w-3 h-3 text-dim mr-1" />
        <span className="text-[8px] text-dim font-mono">{decision.timestamp}</span>
      </div>
    </div>
  );
}

export default function DecisionsPage() {
  const pending = DECISIONS.filter((d) => d.status === "pending");
  const critical = DECISIONS.filter((d) => d.urgency === "critical");

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "var(--cx-void)" }}>
      <NavRail />
      <TopStatusBar />
      <KPIBar />

      <div
        className="absolute overflow-y-auto"
        style={{ left: "54px", top: "38px", right: 0, bottom: "52px", background: "var(--cx-bg)" }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--cx-border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-bright">Decision Console</h1>
              <p className="text-[9px] text-muted">Intelligence → Action · Confidence-scored recommendations with evidence chains</p>
            </div>
            <div className="ml-auto flex items-center gap-5">
              <div className="text-center">
                <div className="text-[18px] font-bold font-mono text-amber-400">{pending.length}</div>
                <div className="text-[7px] text-muted tracking-wider uppercase">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-[18px] font-bold font-mono text-red-400">{critical.length}</div>
                <div className="text-[7px] text-muted tracking-wider uppercase">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-[18px] font-bold font-mono text-bright">{DECISIONS.length}</div>
                <div className="text-[7px] text-muted tracking-wider uppercase">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Strip */}
        <div
          className="px-6 py-3 flex items-center gap-4"
          style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--cx-border)" }}
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-[10px] text-bright leading-relaxed">
            <span className="font-bold text-red-400">2 critical actions pending.</span>{" "}
            Motor IBNR reserves require immediate 12% increase. SIU deployment to Hawally fraud cluster recommended within 24h.
            Compound risk index at 64 with 35% probability of scenario escalation.
          </p>
        </div>

        {/* Decision Cards */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {DECISIONS.map((dec) => (
            <DecisionCard key={dec.id} decision={dec} />
          ))}
        </div>

        {/* Audit Footer */}
        <div
          className="mx-6 mb-6 px-4 py-2 flex items-center gap-3 rounded"
          style={{ background: "var(--cx-surface)", border: "1px solid var(--cx-border)" }}
        >
          <Shield className="w-3 h-3 text-emerald-500" />
          <span className="text-[8px] text-muted">
            All decisions SHA-256 audited · PDPL compliant · IFRS 17 traceable · Human-in-the-loop governance active
          </span>
          <span className="text-[8px] font-mono text-dim ml-auto">
            AUDIT: a3f8...c91d
          </span>
        </div>
      </div>
    </div>
  );
}
