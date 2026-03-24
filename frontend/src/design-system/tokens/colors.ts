/**
 * Deevo Cortex — Color System
 *
 * Sovereign-grade palette: navy-charcoal base, semantic accents only.
 * Every color encodes meaning, not decoration.
 *
 * Palette philosophy:
 *   Red    = Risk / Critical / Danger
 *   Orange = High severity / Warning escalation
 *   Amber  = Warning / Attention needed
 *   Green  = Stable / Healthy / Operational
 *   Blue   = Informational / Primary / System
 *   Cyan   = Reasoning / Causal chain / Flow
 *   Purple = Metric / Score / Analytical
 */

export const colors = {
  /* ─── Background Layers ─────────────────────────────── */
  bg: {
    base: "#08090e",          // Deepest background — app shell
    panel: "#0d0f16",         // Panel / card surface
    raised: "#111420",        // Elevated surface (modals, dropdowns)
    hover: "rgba(255,255,255,0.015)", // Subtle hover state
    active: "rgba(59,130,246,0.04)",  // Active/selected state
  },

  /* ─── Border System ─────────────────────────────────── */
  border: {
    base: "#1a1d2a",          // Default border
    subtle: "#14161f",        // Very subtle divider
    focus: "rgba(59,130,246,0.3)",   // Focus ring
    hover: "rgba(59,130,246,0.15)",  // Hover accent
  },

  /* ─── Text Hierarchy ────────────────────────────────── */
  text: {
    primary: "#e5e7eb",       // Main text
    secondary: "#9ca3af",     // Supporting text
    muted: "#6b7280",         // De-emphasized text
    dim: "#4b5563",           // Barely visible text
    inverse: "#08090e",       // Text on light surfaces
  },

  /* ─── Semantic: Severity ────────────────────────────── */
  severity: {
    critical: {
      base: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      text: "#fca5a5",
      border: "rgba(239,68,68,0.25)",
    },
    high: {
      base: "#f97316",
      bg: "rgba(249,115,22,0.12)",
      text: "#fdba74",
      border: "rgba(249,115,22,0.25)",
    },
    medium: {
      base: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      text: "#fcd34d",
      border: "rgba(245,158,11,0.25)",
    },
    low: {
      base: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      text: "#6ee7b7",
      border: "rgba(16,185,129,0.25)",
    },
  },

  /* ─── Semantic: Function ────────────────────────────── */
  accent: {
    blue: "#3b82f6",          // Primary / Informational
    cyan: "#06b6d4",          // Reasoning / Causal
    purple: "#8b5cf6",        // Metric / Analytical
    emerald: "#10b981",       // Stable / Operational
    amber: "#f59e0b",         // Warning
    red: "#ef4444",           // Risk / Danger
    orange: "#f97316",        // High severity
  },

  /* ─── System Status ─────────────────────────────────── */
  status: {
    operational: "#10b981",
    degraded: "#f59e0b",
    offline: "#ef4444",
    processing: "#3b82f6",
  },

  /* ─── Trend Direction ───────────────────────────────── */
  trend: {
    up: "#fca5a5",            // Upward = risk increasing (red)
    down: "#6ee7b7",          // Downward = risk decreasing (green)
    stable: "#6b7280",        // No change
  },

  /* ─── Causal Flow Colors ────────────────────────────── */
  causal: {
    event: "#3b82f6",
    economic: "#06b6d4",
    sector: "#f59e0b",
    insurance: "#f97316",
    decision: "#ef4444",
  },

  /* ─── Graph Node Types ──────────────────────────────── */
  node: {
    macro: "#3b82f6",
    insurance: "#f59e0b",
    portfolio: "#10b981",
    metric: "#8b5cf6",
  },
} as const;

export type SeverityLevel = keyof typeof colors.severity;
export type AccentColor = keyof typeof colors.accent;
export type StatusLevel = keyof typeof colors.status;
