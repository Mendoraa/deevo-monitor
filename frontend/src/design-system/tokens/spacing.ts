/**
 * Deevo Cortex — Spacing System
 *
 * 4px base grid. All spacing is a multiple of 4.
 * Dense but readable — intelligence interface, not consumer app.
 */

export const spacing = {
  /* ─── Base Unit ─────────────────────────────────────── */
  unit: 4, // px

  /* ─── Scale (multiples of 4px) ──────────────────────── */
  px: "1px",
  0: "0",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",

  /* ─── Semantic Aliases ──────────────────────────────── */
  /** Internal padding within compact elements (badges, tags) */
  inset_xs: "4px",
  /** Internal padding within cards and panels */
  inset_sm: "12px",
  /** Standard panel padding */
  inset_md: "16px",
  /** Spacious panel padding (hero, featured) */
  inset_lg: "24px",
  /** Page-level padding */
  inset_xl: "32px",

  /** Gap between tightly grouped items */
  gap_xs: "4px",
  /** Gap between related items */
  gap_sm: "8px",
  /** Standard gap between components */
  gap_md: "12px",
  /** Gap between sections */
  gap_lg: "24px",
  /** Gap between major sections */
  gap_xl: "32px",
  /** Page section spacing */
  gap_section: "40px",
} as const;

/* ─── Layout Constants ────────────────────────────────── */
export const layout = {
  /** Sidebar width */
  sidebar: 240,
  /** Top bar height */
  topbar: 52,
  /** Maximum content width */
  maxContent: 1400,
  /** Breakpoints */
  breakpoint: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  /** Border radius scale */
  radius: {
    sm: "0.375rem",  // 6px — buttons, badges
    md: "0.5rem",    // 8px — inputs
    lg: "0.625rem",  // 10px — cards
    xl: "0.75rem",   // 12px — panels
    "2xl": "1rem",   // 16px — hero sections
    full: "9999px",  // pills
  },
} as const;
