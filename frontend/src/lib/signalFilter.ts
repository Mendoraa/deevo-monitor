/**
 * Signal filtering logic for multi-layer monitoring modes.
 * Pure functions — no side effects, no state.
 */

import type { MonitorMode } from "./monitorMode";
import type { ExtendedSignal } from "./gcc-signals";
import { MODE_CONFIGS } from "./monitorMode";

/**
 * Filter signals based on the active monitor mode.
 */
export function filterSignalsByMode(
  signals: ExtendedSignal[],
  mode: MonitorMode
): ExtendedSignal[] {
  const config = MODE_CONFIGS[mode];

  // Global = show everything
  if (mode === "global") return signals;

  let filtered = signals;

  // Region filter
  if (config.regionFilter.length > 0) {
    filtered = filtered.filter((s) =>
      s.region.some((r) => config.regionFilter.includes(r) || r === "GLOBAL")
    );
  }

  // Category filter (for economic mode — only macro signals)
  if (mode === "economic") {
    filtered = filtered.filter((s) => s.category === "macro");
  }

  // Layer filter (intelligence mode — only signals with AI insights)
  if (mode === "intelligence") {
    // Show all signals but prioritize those with AI insights
    filtered = [...filtered].sort((a, b) => {
      const aHas = a.ai_insight ? 1 : 0;
      const bHas = b.ai_insight ? 1 : 0;
      return bHas - aHas;
    });
  }

  return filtered;
}

/**
 * Get severity-sorted top signals for a mode.
 */
export function getTopSignals(
  signals: ExtendedSignal[],
  mode: MonitorMode,
  limit: number = 6
): ExtendedSignal[] {
  const filtered = filterSignalsByMode(signals, mode);

  const severityOrder: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...filtered]
    .sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0))
    .slice(0, limit);
}

/**
 * Get signal categories available in current mode.
 */
export function getVisibleCategories(
  signals: ExtendedSignal[],
  mode: MonitorMode
): string[] {
  const filtered = filterSignalsByMode(signals, mode);
  return [...new Set(filtered.map((s) => s.category))];
}
