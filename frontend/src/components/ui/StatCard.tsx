"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  delta?: number;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, subtitle, trend, delta, icon }: StatCardProps) {
  return (
    <div className="panel panel-hover">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-medium text-cortex-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && <div className="text-cortex-muted">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && delta !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs mb-1 trend-${trend}`}>
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {trend === "stable" && <Minus className="w-3 h-3" />}
            <span>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-cortex-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}
