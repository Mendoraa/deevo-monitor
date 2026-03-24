"use client";

/**
 * StatusDot — System status indicator.
 */
interface StatusDotProps {
  status: "operational" | "degraded" | "offline" | "processing";
  pulse?: boolean;
  size?: "sm" | "md";
}

const COLOR_MAP = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  offline: "bg-red-500",
  processing: "bg-blue-500",
};

export default function StatusDot({ status, pulse = false, size = "sm" }: StatusDotProps) {
  const sizeClass = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const pulseClass = pulse ? "pulse-dot" : "";

  return (
    <span className={`${sizeClass} rounded-full ${COLOR_MAP[status]} ${pulseClass} inline-block`} />
  );
}
