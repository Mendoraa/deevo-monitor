/**
 * Deevo Cortex — Typography System
 *
 * Clean, dense, readable. No playful fonts.
 * Strong hierarchy: 5 heading levels + 3 body levels + utility.
 */

export const typography = {
  /* ─── Font Family ───────────────────────────────────── */
  family: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  },

  /* ─── Font Weight ───────────────────────────────────── */
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  /* ─── Heading Scale ─────────────────────────────────── */
  heading: {
    /** Page title — 20px bold */
    h1: {
      size: "1.25rem",
      lineHeight: "1.75rem",
      weight: 700,
      letterSpacing: "-0.01em",
    },
    /** Section header — 16px semibold */
    h2: {
      size: "1rem",
      lineHeight: "1.5rem",
      weight: 600,
      letterSpacing: "-0.005em",
    },
    /** Panel header — 14px semibold */
    h3: {
      size: "0.875rem",
      lineHeight: "1.25rem",
      weight: 600,
      letterSpacing: "0",
    },
    /** Card title — 13px medium */
    h4: {
      size: "0.8125rem",
      lineHeight: "1.125rem",
      weight: 500,
      letterSpacing: "0",
    },
  },

  /* ─── Body Scale ────────────────────────────────────── */
  body: {
    /** Standard body text — 13px */
    md: {
      size: "0.8125rem",
      lineHeight: "1.375rem",
      weight: 400,
    },
    /** Compact body text — 12px */
    sm: {
      size: "0.75rem",
      lineHeight: "1.125rem",
      weight: 400,
    },
    /** Dense info text — 11px */
    xs: {
      size: "0.6875rem",
      lineHeight: "1rem",
      weight: 400,
    },
  },

  /* ─── Utility Styles ────────────────────────────────── */
  utility: {
    /** Section labels — 10px uppercase tracking-wider */
    label: {
      size: "0.625rem",
      lineHeight: "1rem",
      weight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
    /** Metric numbers — 11px tabular */
    metric: {
      size: "0.6875rem",
      lineHeight: "1rem",
      weight: 500,
      fontVariantNumeric: "tabular-nums",
    },
    /** Code/ID strings — 10px mono */
    code: {
      size: "0.625rem",
      lineHeight: "0.875rem",
      weight: 400,
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    },
    /** Large metric display — 24px bold */
    display: {
      size: "1.5rem",
      lineHeight: "2rem",
      weight: 700,
      fontVariantNumeric: "tabular-nums",
    },
  },
} as const;
