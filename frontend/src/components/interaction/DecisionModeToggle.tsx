"use client";

import { Eye, Brain, Crosshair } from "lucide-react";

/**
 * DecisionModeToggle — 3 interaction modes.
 *
 * Monitor Mode:  passive observation, global view
 * Analysis Mode: reasoning visible, causal chains active
 * Decision Mode: actions prioritized, recommendations highlighted
 */
export type InteractionMode = "monitor" | "analysis" | "decision";

interface DecisionModeToggleProps {
  mode: InteractionMode;
  onChange: (mode: InteractionMode) => void;
}

const MODES: { key: InteractionMode; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "monitor", label: "Monitor", icon: Eye, desc: "Observe" },
  { key: "analysis", label: "Analysis", icon: Brain, desc: "Reason" },
  { key: "decision", label: "Decision", icon: Crosshair, desc: "Act" },
];

export default function DecisionModeToggle({ mode, onChange }: DecisionModeToggleProps) {
  return (
    <div className="decision-mode-toggle">
      <span className="text-[9px] uppercase tracking-widest text-neutral-600 font-semibold mr-3">
        Mode
      </span>
      <div className="flex items-center gap-1">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onChange(m.key)}
              className={`mode-btn ${isActive ? "mode-btn-active" : ""}`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-[10px]">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
