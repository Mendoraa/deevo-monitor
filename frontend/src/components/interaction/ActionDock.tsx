"use client";

import { AlertCircle, ArrowUpRight, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { MOCK_RECOMMENDATIONS, type RecommendationData } from "@/lib/mock-data";

/**
 * ActionDock — Always-visible decision panel.
 * Pushes the user toward action. Shows top 3 priority actions.
 * Collapsible but never hidden in Decision mode.
 */
interface ActionDockProps {
  visible: boolean;
}

const URGENCY_MAP = {
  critical: { color: "text-red-400", bg: "bg-red-500/8", icon: AlertCircle },
  high: { color: "text-orange-400", bg: "bg-orange-500/8", icon: ArrowUpRight },
  medium: { color: "text-amber-400", bg: "bg-amber-500/8", icon: Shield },
  low: { color: "text-emerald-400", bg: "bg-emerald-500/8", icon: Shield },
};

export default function ActionDock({ visible }: ActionDockProps) {
  const [expanded, setExpanded] = useState(true);
  const recs = MOCK_RECOMMENDATIONS.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  }).slice(0, 3);

  if (!visible) return null;

  return (
    <div className="action-dock">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-2"
      >
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
            Priority Actions
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">
            {recs.length}
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-neutral-600" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {recs.map((rec) => {
            const u = URGENCY_MAP[rec.priority];
            const Icon = u.icon;
            return (
              <div key={rec.rule_id} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${u.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${u.color} flex-shrink-0 mt-0.5`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono text-neutral-500">{rec.rule_id}</span>
                    <span className={`text-[9px] ${u.color} uppercase font-medium`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    {rec.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Crosshair(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}
