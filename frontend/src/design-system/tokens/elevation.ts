/**
 * Deevo Cortex — Elevation System
 *
 * Subtle depth through borders and minimal shadows.
 * No heavy drop-shadows — intelligence interface prefers borders.
 */

export const elevation = {
  /** Flat — no elevation, just background */
  flat: {
    shadow: "none",
    border: "1px solid #14161f",
  },

  /** Low — standard card/panel */
  low: {
    shadow: "none",
    border: "1px solid #1a1d2a",
  },

  /** Medium — raised surface (dropdowns, popovers) */
  medium: {
    shadow: "0 4px 16px rgba(0,0,0,0.3)",
    border: "1px solid #1a1d2a",
  },

  /** High — modal/overlay */
  high: {
    shadow: "0 8px 32px rgba(0,0,0,0.5)",
    border: "1px solid #1a1d2a",
  },

  /** Glow — subtle accent glow for focus/active states */
  glow: {
    blue: "0 0 24px rgba(59,130,246,0.05)",
    red: "0 0 24px rgba(239,68,68,0.05)",
    amber: "0 0 24px rgba(245,158,11,0.05)",
  },
} as const;
