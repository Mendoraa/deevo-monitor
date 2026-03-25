"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Monitor Modes ────────────────────────────────────────────
export type MonitorMode = "global" | "gcc" | "kuwait" | "intelligence" | "economic";

export interface MonitorModeConfig {
  key: MonitorMode;
  label: string;
  labelAr: string;
  description: string;
  icon: string; // lucide icon name reference
  accentColor: string;
  signalFilter: string[];       // category filter for signals
  regionFilter: string[];       // GCC country codes to focus
  showOverlay: boolean;         // whether to show an overlay panel
}

export const MODE_CONFIGS: Record<MonitorMode, MonitorModeConfig> = {
  global: {
    key: "global",
    label: "Global",
    labelAr: "عالمي",
    description: "Full signal coverage — all regions, all categories",
    icon: "Globe",
    accentColor: "blue",
    signalFilter: [],             // empty = show all
    regionFilter: [],             // empty = show all
    showOverlay: false,
  },
  gcc: {
    key: "gcc",
    label: "GCC",
    labelAr: "الخليج",
    description: "Filter signals and intelligence to GCC region",
    icon: "MapPin",
    accentColor: "emerald",
    signalFilter: ["macro", "claims", "underwriting"],
    regionFilter: ["KWT", "SAU", "UAE", "BHR", "QAT", "OMN"],
    showOverlay: false,
  },
  kuwait: {
    key: "kuwait",
    label: "Kuwait",
    labelAr: "الكويت",
    description: "Kuwait-focused intelligence — claims, economy, infrastructure",
    icon: "Building2",
    accentColor: "cyan",
    signalFilter: ["macro", "claims", "fraud", "underwriting"],
    regionFilter: ["KWT"],
    showOverlay: false,
  },
  intelligence: {
    key: "intelligence",
    label: "Intelligence",
    labelAr: "ذكاء",
    description: "AI insights overlay — top risks, signal clustering, key developments",
    icon: "Brain",
    accentColor: "purple",
    signalFilter: [],
    regionFilter: [],
    showOverlay: true,
  },
  economic: {
    key: "economic",
    label: "Economic",
    labelAr: "اقتصادي",
    description: "Economic signals — inflation, oil, macro indicators",
    icon: "TrendingUp",
    accentColor: "amber",
    signalFilter: ["macro"],
    regionFilter: [],
    showOverlay: true,
  },
};

// ─── Context ──────────────────────────────────────────────────
interface MonitorModeContextType {
  mode: MonitorMode;
  config: MonitorModeConfig;
  setMode: (mode: MonitorMode) => void;
  isFiltered: boolean;
}

const MonitorModeContext = createContext<MonitorModeContextType>({
  mode: "global",
  config: MODE_CONFIGS.global,
  setMode: () => {},
  isFiltered: false,
});

export function MonitorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<MonitorMode>("global");

  const setMode = useCallback((newMode: MonitorMode) => {
    setModeState(newMode);
  }, []);

  const config = MODE_CONFIGS[mode];
  const isFiltered = mode !== "global";

  return (
    <MonitorModeContext.Provider value={{ mode, config, setMode, isFiltered }}>
      {children}
    </MonitorModeContext.Provider>
  );
}

export function useMonitorMode() {
  return useContext(MonitorModeContext);
}
