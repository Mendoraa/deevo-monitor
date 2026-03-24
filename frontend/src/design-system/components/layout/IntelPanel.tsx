"use client";

import { ReactNode } from "react";

/**
 * IntelPanel — Standard intelligence panel.
 * The base container for all dashboard content blocks.
 */
interface IntelPanelProps {
  children: ReactNode;
  className?: string;
  severity?: "critical" | "high" | "medium" | "low";
  hover?: boolean;
  noPadding?: boolean;
}

export default function IntelPanel({
  children,
  className = "",
  severity,
  hover = false,
  noPadding = false,
}: IntelPanelProps) {
  const severityClass = severity ? `severity-${severity}` : "";
  const hoverClass = hover ? "panel-hover" : "";
  const paddingClass = noPadding ? "p-0" : "p-5";

  return (
    <div
      className={`intel-panel ${paddingClass} ${severityClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
