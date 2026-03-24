"use client";

interface ScoreGaugeProps {
  value: number;
  label: string;
  risk_level: "low" | "medium" | "high" | "critical";
  size?: "sm" | "md" | "lg";
}

const RISK_COLORS = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const SIZES = {
  sm: { svg: 64, stroke: 4, font: "text-sm", label: "text-[9px]" },
  md: { svg: 88, stroke: 5, font: "text-lg", label: "text-[10px]" },
  lg: { svg: 120, stroke: 6, font: "text-2xl", label: "text-xs" },
};

export default function ScoreGauge({
  value,
  label,
  risk_level,
  size = "md",
}: ScoreGaugeProps) {
  const s = SIZES[size];
  const radius = (s.svg - s.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const offset = circumference - (progress / 100) * circumference;
  const color = RISK_COLORS[risk_level];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s.svg, height: s.svg }}>
        <svg width={s.svg} height={s.svg} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={s.svg / 2}
            cy={s.svg / 2}
            r={radius}
            fill="none"
            stroke="rgba(31, 41, 55, 0.8)"
            strokeWidth={s.stroke}
          />
          {/* Progress ring */}
          <circle
            cx={s.svg / 2}
            cy={s.svg / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="gauge-ring"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${s.font} font-bold text-white`}>{value}</span>
        </div>
      </div>
      <span className={`${s.label} text-cortex-muted mt-1.5 text-center`}>
        {label}
      </span>
    </div>
  );
}
