"use client";

import { Lightbulb, ChevronRight } from "lucide-react";

/**
 * InsightPromptCard — Proactive intelligence nudge.
 * System tells the user what to look at next.
 * Reduces cognitive load by guiding attention.
 */
interface InsightPromptCardProps {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  type?: "info" | "warning" | "critical";
}

const TYPE_CONFIG = {
  info: {
    bg: "bg-blue-500/6",
    border: "border-blue-500/15",
    icon: "text-blue-400",
  },
  warning: {
    bg: "bg-amber-500/6",
    border: "border-amber-500/15",
    icon: "text-amber-400",
  },
  critical: {
    bg: "bg-red-500/6",
    border: "border-red-500/15",
    icon: "text-red-400",
  },
};

export default function InsightPromptCard({
  title,
  description,
  action,
  onAction,
  type = "info",
}: InsightPromptCardProps) {
  const cfg = TYPE_CONFIG[type];

  return (
    <div className={`insight-prompt ${cfg.bg} border ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <Lightbulb className={`w-4 h-4 ${cfg.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-neutral-200">{title}</h4>
          <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
            {description}
          </p>
          {action && onAction && (
            <button
              onClick={onAction}
              className="flex items-center gap-1 mt-2 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>{action}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
