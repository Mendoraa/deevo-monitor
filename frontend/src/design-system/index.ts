/**
 * Deevo Cortex — Design System
 *
 * Palantir-grade structure + Eli-style command center layout +
 * Chinese-style causal reasoning + Deevo decision intelligence.
 *
 * This module exports all design system tokens and components.
 */

// Tokens
export { colors, type SeverityLevel, type AccentColor, type StatusLevel } from "./tokens/colors";
export { spacing, layout } from "./tokens/spacing";
export { typography } from "./tokens/typography";
export { elevation } from "./tokens/elevation";
export { motion } from "./tokens/motion";

// Layout components
export { default as AppShell } from "./components/layout/AppShell";
export { default as IntelPanel } from "./components/layout/IntelPanel";
export { default as SectionHeader } from "./components/layout/SectionHeader";

// System components
export { default as SeverityBadge } from "./components/system/SeverityBadge";
export { default as StatusDot } from "./components/system/StatusDot";
