"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendArrowProps {
  trend: "up" | "down" | "stable";
  delta?: number;
  className?: string;
}

export default function TrendArrow({ trend, delta, className = "" }: TrendArrowProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 trend-${trend} ${className}`}>
      {trend === "up" && <TrendingUp className="w-3 h-3" />}
      {trend === "down" && <TrendingDown className="w-3 h-3" />}
      {trend === "stable" && <Minus className="w-3 h-3" />}
      {delta !== undefined && (
        <span className="text-xs">{delta > 0 ? "+" : ""}{delta.toFixed(1)}</span>
      )}
    </span>
  );
}
