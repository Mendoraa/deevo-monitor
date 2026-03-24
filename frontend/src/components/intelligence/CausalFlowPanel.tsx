"use client";

import { ChevronRight } from "lucide-react";

/**
 * Causal Flow Panel — Chinese-style structured reasoning visualization.
 * Shows event → economic → sector → insurance propagation chain.
 *
 * Two modes:
 * 1. Static: mock causal chain (default on load)
 * 2. Live: real causal_chain from API response
 */

interface CausalFlowPanelProps {
  chain?: string[]; // Live from API
}

// Default reasoning chain for static display
const STATIC_CHAIN = [
  {
    layer: "Event",
    label: "Oil Price Surge",
    detail: "Energy supply disruption in Middle East",
    color: "blue",
  },
  {
    layer: "Economic",
    label: "Inflation Pressure",
    detail: "Repair costs ↑7.2% YoY, consumer liquidity tightens",
    color: "cyan",
  },
  {
    layer: "Sector",
    label: "Motor Insurance",
    detail: "Claims severity ↑, frequency elevated, fraud clusters active",
    color: "amber",
  },
  {
    layer: "Insurance",
    label: "Risk Repricing",
    detail: "Underwriting drift 0.28, pricing adequacy gap at 62",
    color: "orange",
  },
  {
    layer: "Decision",
    label: "Executive Action",
    detail: "Tighten UW guidelines, escalate to C-suite, review reserves",
    color: "red",
  },
];

function FlowBlock({
  layer,
  label,
  detail,
  color,
  isLast,
}: {
  layer: string;
  label: string;
  detail: string;
  color: string;
  isLast: boolean;
}) {
  return (
    <div className="flex items-stretch gap-0">
      <div className={`causal-block causal-${color}`}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[9px] uppercase tracking-widest font-semibold causal-tag-${color}`}
          >
            {layer}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white mb-0.5">{label}</h4>
        <p className="text-[11px] text-neutral-400 leading-relaxed">{detail}</p>
      </div>
      {!isLast && (
        <div className="flex items-center px-1">
          <ChevronRight className="w-4 h-4 text-neutral-600" />
        </div>
      )}
    </div>
  );
}

function LiveChainView({ chain }: { chain: string[] }) {
  return (
    <div className="space-y-0">
      {chain.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          {/* Step number */}
          <div className="flex flex-col items-center">
            <div className="causal-step-number">
              <span className="text-[10px] font-bold text-blue-300">
                {(i + 1).toString().padStart(2, "0")}
              </span>
            </div>
            {i < chain.length - 1 && (
              <div className="w-px h-6 bg-neutral-700/50" />
            )}
          </div>
          {/* Step content */}
          <div className="pb-4">
            <p className="text-xs text-neutral-200 leading-relaxed">{step}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CausalFlowPanel({ chain }: CausalFlowPanelProps) {
  const hasLiveData = chain && chain.length > 0;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
        <h2 className="section-title">Causal Reasoning</h2>
        <span className="text-[10px] text-neutral-600 ml-2">
          {hasLiveData ? "LIVE" : "MODEL"}
        </span>
      </div>

      {hasLiveData ? (
        <div className="intel-panel p-4">
          <LiveChainView chain={chain} />
        </div>
      ) : (
        <>
          {/* Horizontal flow for desktop */}
          <div className="hidden lg:flex items-stretch gap-0 overflow-x-auto pb-2">
            {STATIC_CHAIN.map((block, i) => (
              <FlowBlock
                key={block.layer}
                {...block}
                isLast={i === STATIC_CHAIN.length - 1}
              />
            ))}
          </div>

          {/* Vertical flow for mobile */}
          <div className="lg:hidden space-y-3">
            {STATIC_CHAIN.map((block) => (
              <div key={block.layer} className={`causal-block causal-${block.color}`}>
                <span
                  className={`text-[9px] uppercase tracking-widest font-semibold causal-tag-${block.color}`}
                >
                  {block.layer}
                </span>
                <h4 className="text-sm font-semibold text-white mt-1 mb-0.5">
                  {block.label}
                </h4>
                <p className="text-[11px] text-neutral-400">{block.detail}</p>
              </div>
            ))}
          </div>

          {/* Influence legend */}
          <div className="flex items-center gap-4 mt-3 text-[10px] text-neutral-600">
            <span>Event → Economic → Sector → Insurance → Decision</span>
            <span className="text-neutral-700">|</span>
            <span>Strength: BFS graph propagation</span>
          </div>
        </>
      )}
    </section>
  );
}
