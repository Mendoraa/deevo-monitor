"use client";

import { Users, TrendingUp, TrendingDown, Minus, Brain, ShieldAlert, Briefcase, Building, User, Search } from "lucide-react";
import { useMonitorMode } from "@/lib/monitorMode";

// ─── Agent Personas ───────────────────────────────────────────
interface AgentReaction {
  agentId: string;
  persona: string;
  personaAr: string;
  icon: typeof Users;
  accentColor: string;
  reaction: string;
  riskImpact: "increase" | "decrease" | "neutral";
  riskDelta: string;
  behaviorChange: string;
  confidence: number;
}

// Simulated reactions to current state: "Oil at $89.5 + Claims pressure rising"
const AGENT_REACTIONS: AgentReaction[] = [
  {
    agentId: "AGT-INVESTOR",
    persona: "Investor",
    personaAr: "مستثمر",
    icon: TrendingUp,
    accentColor: "emerald",
    reaction: "Oil surge → rotate into energy stocks, reduce exposure to consumer discretionary. Insurance sector exposure under review due to rising claims trajectory.",
    riskImpact: "increase",
    riskDelta: "+8%",
    behaviorChange: "Portfolio rebalancing toward energy sector, hedging GCC insurance exposure",
    confidence: 0.82,
  },
  {
    agentId: "AGT-REGULATOR",
    persona: "Government Regulator",
    personaAr: "جهة رقابية",
    icon: Building,
    accentColor: "blue",
    reaction: "Subsidy pressure increasing. If oil stays above $88 for 30d, fiscal buffer draw-down triggers consumer support review. Regulatory response expected within 60 days.",
    riskImpact: "increase",
    riskDelta: "+5%",
    behaviorChange: "Monitoring subsidy thresholds, preparing consumer protection measures",
    confidence: 0.75,
  },
  {
    agentId: "AGT-RISK-MGR",
    persona: "Insurance Risk Manager",
    personaAr: "مدير المخاطر",
    icon: ShieldAlert,
    accentColor: "red",
    reaction: "Claims severity trending +11% QoQ. Repair cost inflation amplifying faster than pricing can respond. Reserve adequacy review triggered — IBNR likely understated.",
    riskImpact: "increase",
    riskDelta: "+12%",
    behaviorChange: "Triggering reserve review, tightening underwriting guidelines, escalating to C-suite",
    confidence: 0.91,
  },
  {
    agentId: "AGT-CONSUMER",
    persona: "Retail Consumer",
    personaAr: "مستهلك",
    icon: User,
    accentColor: "cyan",
    reaction: "Financial stress rising from fuel costs. Deferred vehicle maintenance increases accident probability. Policy renewal sensitivity heightened — price elasticity at 0.7.",
    riskImpact: "increase",
    riskDelta: "+6%",
    behaviorChange: "Deferring maintenance, shopping for cheaper coverage, increasing claims disputes",
    confidence: 0.78,
  },
  {
    agentId: "AGT-FRAUD",
    persona: "Fraud Actor",
    personaAr: "جهة احتيال",
    icon: Search,
    accentColor: "amber",
    reaction: "Economic stress creates opportunity. Staged collision probability rises 18% when consumer stress index > 60. Garage network exploitation window open.",
    riskImpact: "increase",
    riskDelta: "+18%",
    behaviorChange: "Increasing staged collision attempts, exploiting stressed garage networks",
    confidence: 0.72,
  },
];

const ACCENT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: "rgba(16,185,129,0.05)", border: "rgba(16,185,129,0.15)", text: "text-emerald-400" },
  blue: { bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.15)", text: "text-blue-400" },
  red: { bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.15)", text: "text-red-400" },
  cyan: { bg: "rgba(6,182,212,0.05)", border: "rgba(6,182,212,0.15)", text: "text-cyan-400" },
  amber: { bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.15)", text: "text-amber-400" },
};

function AgentCard({ agent }: { agent: AgentReaction }) {
  const styles = ACCENT_STYLES[agent.accentColor] || ACCENT_STYLES.blue;
  const Icon = agent.icon;
  const ImpactIcon = agent.riskImpact === "increase" ? TrendingUp : agent.riskImpact === "decrease" ? TrendingDown : Minus;
  const impactColor = agent.riskImpact === "increase" ? "text-red-400" : agent.riskImpact === "decrease" ? "text-emerald-400" : "text-neutral-500";

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200 hover:translate-y-[-1px]"
      style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
    >
      {/* Agent header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${styles.text}`} />
          <div>
            <span className="text-xs font-semibold text-white">{agent.persona}</span>
            <span className="text-[9px] text-neutral-600 ml-1.5" dir="rtl">{agent.personaAr}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ImpactIcon className={`w-3 h-3 ${impactColor}`} />
          <span className={`text-[10px] font-bold tabular-nums ${impactColor}`}>
            {agent.riskDelta}
          </span>
        </div>
      </div>

      {/* Reaction */}
      <p className="text-[10px] text-neutral-400 leading-relaxed mb-2">
        {agent.reaction}
      </p>

      {/* Behavior change */}
      <div className="flex items-start gap-1.5 mb-1.5">
        <Brain className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
        <span className="text-[9px] text-purple-300/70">
          {agent.behaviorChange}
        </span>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-1">
        <span className="text-[8px] text-neutral-600">Confidence</span>
        <div className="flex-1 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-neutral-500/50"
            style={{ width: `${agent.confidence * 100}%` }}
          />
        </div>
        <span className="text-[8px] text-neutral-500 tabular-nums">
          {(agent.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export default function ReactionIntelligencePanel() {
  const { mode } = useMonitorMode();

  // Show in intelligence and kuwait modes, partial in global
  if (mode === "economic") return null;

  const agents = mode === "global"
    ? AGENT_REACTIONS.slice(0, 3) // compact: top 3 in global
    : AGENT_REACTIONS;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-red-500 rounded-full" />
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          Reaction Intelligence Layer
        </h3>
        <span className="text-[9px] text-neutral-700">
          Multi-agent behavioral simulation
        </span>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-md"
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)" }}>
          <Brain className="w-3 h-3 text-purple-400" />
          <span className="text-[9px] text-purple-300 font-medium">AI Simulated</span>
        </div>
      </div>

      <div className={`grid gap-3 ${
        agents.length <= 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      }`}>
        {agents.map((agent) => (
          <AgentCard key={agent.agentId} agent={agent} />
        ))}
      </div>
    </section>
  );
}
