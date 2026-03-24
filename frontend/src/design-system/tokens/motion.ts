/**
 * Deevo Cortex — Motion System
 *
 * Subtle, purposeful animation. No flashy transitions.
 * Motion supports clarity, not decoration.
 */

export const motion = {
  /* ─── Duration ──────────────────────────────────────── */
  duration: {
    instant: "75ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    entrance: "400ms",
  },

  /* ─── Easing ────────────────────────────────────────── */
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /* ─── Semantic Transitions ──────────────────────────── */
  transition: {
    /** Hover states — color, border, shadow changes */
    hover: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    /** Focus states */
    focus: "box-shadow 200ms cubic-bezier(0, 0, 0.2, 1)",
    /** Panel expand/collapse */
    expand: "all 300ms cubic-bezier(0, 0, 0.2, 1)",
    /** Score gauge fill */
    gauge: "stroke-dashoffset 1200ms cubic-bezier(0, 0, 0.2, 1)",
    /** Bar fill */
    bar: "width 700ms cubic-bezier(0, 0, 0.2, 1)",
  },
} as const;
