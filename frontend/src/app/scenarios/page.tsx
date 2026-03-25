"use client";

import NavRail from "@/components/platform/NavRail";
import TopStatusBar from "@/components/platform/TopStatusBar";
import KPIBar from "@/components/platform/KPIBar";
import {
  SCENARIO_BRANCHES,
  evaluateScenarios,
  type ScenarioDef,
} from "@/lib/scenarioEngine";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  GitBranch,
  Target,
  Shield,
  Zap,
  ChevronRight,
  Clock,
} from "lucide-react";

const BRANCH_COLORS: Record<string, string> = {
  base: "#10b981",
  elevated: "#f59e0b",
  severe: "#ef4444",
};

const BRANCH_LABELS: Record<string, string> = {
  base: "BASE",
  elevated: "ELEVATED",
  severe: "SEVERE",
};

function TriggerRow({ trigger }: { trigger: { signal: string; condition: string; currentValue: string; threshold: string; triggered: boolean } }) {
  return (
    <div className="flex items-center gap-3 py-1.5" style={{ borderBottom: "1px solid var(--cx-border)" }}>
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: trigger.triggered ? "#10b981" : "#ef4444" }}
      />
      <span className="text-[10px] text-bright flex-1">{trigger.condition}</span>
      <span className="text-[9px] font-mono text-muted">{trigger.currentValue}</span>
      <span className="text-[8px] text-dim">→</span>
      <span className="text-[9px] font-mono text-muted">{trigger.threshold}</span>
    </div>
  );
}

function ImpactRow({ impact }: { impact: { dimension: string; direction: string; magnitude: string; confidence: number } }) {
  const Icon = impact.direction === "up" ? TrendingUp : impact.direction === "down" ? TrendingDown : Minus;
  const color = impact.direction === "up" ? "#fca5a5" : impact.direction === "down" ? "#6ee7b7" : "#4a5068";

  return (
    <div className="flex items-center gap-3 py-1.5" style={{ borderBottom: "1px solid var(--cx-border)" }}>
      <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
      <span className="text-[10px] text-bright flex-1">{impact.dimension}</span>
      <span className="text-[10px] font-bold font-mono" style={{ color }}>
        {impact.magnitude}
      </span>
      <div className="flex items-center gap-1">
        <div className="conf-bar" style={{ width: "40px" }}>
          <div
            className="conf-bar-fill"
            style={{ width: `${impact.confidence * 100}%`, background: "var(--cx-accent)" }}
          />
        </div>
        <span className="text-[8px] font-mono text-muted">{Math.round(impact.confidence * 100)}%</span>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: ScenarioDef }) {
  const color = BRANCH_COLORS[scenario.branch];
  const triggeredCount = scenario.triggers.filter((t) => t.triggered).length;

  return (
    <div
      className="flex flex-col"
      style={{
        background: "var(--cx-surface)",
        border: `1px solid var(--cx-border)`,
        borderTop: `2px solid ${color}`,
        borderRadius: "6px",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--cx-border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[8px] font-bold tracking-[0.1em] px-2 py-0.5 rounded"
            style={{ background: `${color}20`, color }}
          >
            {BRANCH_LABELS[scenario.branch]}
          </span>
          <span className="text-[9px] font-bold font-mono ml-auto" style={{ color }}>
            {Math.round(scenario.probability * 100)}%
          </span>
        </div>
        <h3 className="text-[12px] font-bold text-bright">{scenario.label}</h3>
        <p className="text-[9px] text-muted mt-1 leading-relaxed">{scenario.description}</p>
      </div>

      {/* Risk + Time */}
      <div className="px-4 py-2 flex items-center gap-4" style={{ background: "rgba(0,0,0,0.15)" }}>
        <div className="flex items-center gap-1.5">
          <Target className="w-3 h-3" style={{ color }} />
          <span className="text-[8px] text-muted">COMPOUND RISK</span>
          <span className="text-[11px] font-bold font-mono" style={{ color }}>{scenario.compoundRisk}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Clock className="w-3 h-3 text-muted" />
          <span className="text-[8px] text-muted">HORIZON</span>
          <span className="text-[10px] font-bold font-mono text-bright">{scenario.timeHorizon}</span>
        </div>
      </div>

      {/* Triggers */}
      <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--cx-border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-[8px] font-bold text-muted tracking-[0.1em] uppercase">
            Triggers
          </span>
          <span className="text-[8px] font-mono ml-auto" style={{ color: triggeredCount === scenario.triggers.length ? "#10b981" : "#f59e0b" }}>
            {triggeredCount}/{scenario.triggers.length} active
          </span>
        </div>
        {scenario.triggers.map((t, i) => (
          <TriggerRow key={i} trigger={t} />
        ))}
      </div>

      {/* Impacts */}
      <div className="px-4 py-2 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-[8px] font-bold text-muted tracking-[0.1em] uppercase">
            Impact Vectors
          </span>
        </div>
        {scenario.impacts.map((imp, i) => (
          <ImpactRow key={i} impact={imp} />
        ))}
      </div>
    </div>
  );
}

export default function ScenariosPage() {
  const scenarioResults = evaluateScenarios();

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "var(--cx-void)" }}>
      <NavRail />
      <TopStatusBar />
      <KPIBar />

      {/* Main content area */}
      <div
        className="absolute overflow-y-auto"
        style={{
          left: "54px",
          top: "38px",
          right: 0,
          bottom: "52px",
          background: "var(--cx-bg)",
        }}
      >
        {/* Page header */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--cx-border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <GitBranch className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-bright">Scenario Intelligence Engine</h1>
              <p className="text-[9px] text-muted">Branching analysis: what happens → why → what it affects → what to do</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-muted">BRANCHES</span>
                <span className="text-[11px] font-bold text-bright font-mono">{SCENARIO_BRANCHES.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-muted">AGENTS</span>
                <span className="text-[11px] font-bold text-bright font-mono">{scenarioResults.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Propagation Chain Summary */}
        <div className="px-6 py-3" style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--cx-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] font-bold text-muted tracking-[0.12em] uppercase">
              Propagation Chain
            </span>
          </div>
          <div className="flex items-center gap-2">
            {["Geopolitical Event", "Oil Price Shock", "Repair Cost Inflation", "Claims Severity Spike", "Reserve Pressure", "Pricing Inadequacy", "Portfolio Stress"].map(
              (step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-semibold px-2.5 py-1 rounded"
                    style={{
                      background: i < 3 ? "rgba(239,68,68,0.1)" : i < 5 ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                      color: i < 3 ? "#fca5a5" : i < 5 ? "#fcd34d" : "#93c5fd",
                      border: `1px solid ${i < 3 ? "rgba(239,68,68,0.15)" : i < 5 ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)"}`,
                    }}
                  >
                    {step}
                  </span>
                  {i < 6 && <ChevronRight className="w-3 h-3 text-dim" />}
                </div>
              )
            )}
          </div>
        </div>

        {/* Scenario Cards Grid */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {SCENARIO_BRANCHES.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>

        {/* Agent Reactions Summary */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3 h-3 text-purple-400" />
            <span className="text-[9px] font-bold text-muted tracking-[0.12em] uppercase">
              Agent Reactions Across Scenarios
            </span>
          </div>
          <div
            className="overflow-hidden"
            style={{
              background: "var(--cx-surface)",
              border: "1px solid var(--cx-border)",
              borderRadius: "6px",
            }}
          >
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                  <th className="text-left px-4 py-2 text-[8px] font-bold text-muted tracking-wider uppercase">Agent</th>
                  <th className="text-left px-4 py-2 text-[8px] font-bold tracking-wider uppercase" style={{ color: "#10b981" }}>Base</th>
                  <th className="text-left px-4 py-2 text-[8px] font-bold tracking-wider uppercase" style={{ color: "#f59e0b" }}>Elevated</th>
                  <th className="text-left px-4 py-2 text-[8px] font-bold tracking-wider uppercase" style={{ color: "#ef4444" }}>Severe</th>
                  <th className="text-center px-4 py-2 text-[8px] font-bold text-muted tracking-wider uppercase">Stress</th>
                </tr>
              </thead>
              <tbody>
                {scenarioResults.map((agent) => (
                  <tr key={agent.agentId} style={{ borderBottom: "1px solid var(--cx-border)" }}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              agent.stressState === "panic" ? "#ef4444" : agent.stressState === "stressed" ? "#f59e0b" : "#10b981",
                          }}
                        />
                        <span className="text-[10px] font-semibold text-bright capitalize">
                          {agent.agentId.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[9px] text-muted">{agent.scenarioReaction?.reaction || "Monitoring"}</td>
                    <td className="px-4 py-2 text-[9px] text-muted">{agent.scenarioReaction?.behaviorShift || "Adjusting"}</td>
                    <td className="px-4 py-2 text-[9px] text-muted">
                      {agent.stressState === "panic" ? "Emergency response" : agent.stressState === "stressed" ? "Elevated protocols" : "Standard ops"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className="text-[10px] font-bold font-mono"
                        style={{
                          color: agent.currentStress >= 80 ? "#ef4444" : agent.currentStress >= 50 ? "#f59e0b" : "#10b981",
                        }}
                      >
                        {agent.currentStress}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
