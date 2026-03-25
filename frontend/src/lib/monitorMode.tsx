"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Monitor Modes ────────────────────────────────────────────
export type MonitorMode =
  | "global"
  | "gcc"
  | "kuwait" | "saudi" | "uae" | "bahrain" | "qatar" | "oman"
  | "intelligence"
  | "economic";

export type ModeGroup = "primary" | "country";

export interface MonitorModeConfig {
  key: MonitorMode;
  group: ModeGroup;
  label: string;
  labelAr: string;
  description: string;
  icon: string;
  accentColor: string;
  signalFilter: string[];
  regionFilter: string[];
  showOverlay: boolean;
  countryCode?: string;      // ISO code for country modes
}

export const MODE_CONFIGS: Record<MonitorMode, MonitorModeConfig> = {
  global: {
    key: "global", group: "primary",
    label: "Global", labelAr: "عالمي",
    description: "Full signal coverage — all regions, all categories",
    icon: "Globe", accentColor: "blue",
    signalFilter: [], regionFilter: [], showOverlay: false,
  },
  gcc: {
    key: "gcc", group: "primary",
    label: "GCC", labelAr: "الخليج",
    description: "Filter signals and intelligence to GCC region",
    icon: "MapPin", accentColor: "emerald",
    signalFilter: ["macro", "claims", "underwriting"],
    regionFilter: ["KWT", "SAU", "UAE", "BHR", "QAT", "OMN"],
    showOverlay: false,
  },
  kuwait: {
    key: "kuwait", group: "country",
    label: "Kuwait", labelAr: "الكويت",
    description: "Kuwait — claims, economy, infrastructure, fraud",
    icon: "Building2", accentColor: "cyan",
    signalFilter: ["macro", "claims", "fraud", "underwriting"],
    regionFilter: ["KWT"], showOverlay: false, countryCode: "KWT",
  },
  saudi: {
    key: "saudi", group: "country",
    label: "Saudi", labelAr: "السعودية",
    description: "Saudi Arabia — Vision 2030, SAMA regulation, motor market",
    icon: "Building2", accentColor: "emerald",
    signalFilter: ["macro", "claims", "underwriting"],
    regionFilter: ["SAU"], showOverlay: false, countryCode: "SAU",
  },
  uae: {
    key: "uae", group: "country",
    label: "UAE", labelAr: "الإمارات",
    description: "UAE — diversified economy, declining claims, strong regulation",
    icon: "Building2", accentColor: "blue",
    signalFilter: ["macro", "claims", "underwriting"],
    regionFilter: ["UAE"], showOverlay: false, countryCode: "UAE",
  },
  bahrain: {
    key: "bahrain", group: "country",
    label: "Bahrain", labelAr: "البحرين",
    description: "Bahrain — banking sector stress, high oil dependency",
    icon: "Building2", accentColor: "amber",
    signalFilter: ["macro", "claims", "underwriting"],
    regionFilter: ["BHR"], showOverlay: false, countryCode: "BHR",
  },
  qatar: {
    key: "qatar", group: "country",
    label: "Qatar", labelAr: "قطر",
    description: "Qatar — LNG revenues, stable market, strong reserves",
    icon: "Building2", accentColor: "purple",
    signalFilter: ["macro", "claims", "underwriting"],
    regionFilter: ["QAT"], showOverlay: false, countryCode: "QAT",
  },
  oman: {
    key: "oman", group: "country",
    label: "Oman", labelAr: "عُمان",
    description: "Oman — fiscal consolidation, high oil dependency",
    icon: "Building2", accentColor: "red",
    signalFilter: ["macro", "claims", "underwriting"],
    regionFilter: ["OMN"], showOverlay: false, countryCode: "OMN",
  },
  intelligence: {
    key: "intelligence", group: "primary",
    label: "Intelligence", labelAr: "ذكاء",
    description: "AI insights overlay — top risks, signal clustering",
    icon: "Brain", accentColor: "purple",
    signalFilter: [], regionFilter: [], showOverlay: true,
  },
  economic: {
    key: "economic", group: "primary",
    label: "Economic", labelAr: "اقتصادي",
    description: "Economic signals — inflation, oil, macro indicators",
    icon: "TrendingUp", accentColor: "amber",
    signalFilter: ["macro"], regionFilter: [], showOverlay: true,
  },
};

// ─── Primary modes (top bar) ──────────────────────────────────
export const PRIMARY_MODES: MonitorMode[] = ["global", "gcc", "kuwait", "intelligence", "economic"];
export const COUNTRY_MODES: MonitorMode[] = ["kuwait", "saudi", "uae", "bahrain", "qatar", "oman"];

// ─── Helper: is this a country mode? ──────────────────────────
export function isCountryMode(mode: MonitorMode): boolean {
  return COUNTRY_MODES.includes(mode);
}

// ─── Context ──────────────────────────────────────────────────
interface MonitorModeContextType {
  mode: MonitorMode;
  config: MonitorModeConfig;
  setMode: (mode: MonitorMode) => void;
  isFiltered: boolean;
  isCountry: boolean;
}

const MonitorModeContext = createContext<MonitorModeContextType>({
  mode: "global",
  config: MODE_CONFIGS.global,
  setMode: () => {},
  isFiltered: false,
  isCountry: false,
});

export function MonitorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<MonitorMode>("global");

  const setMode = useCallback((newMode: MonitorMode) => {
    setModeState(newMode);
  }, []);

  const config = MODE_CONFIGS[mode];
  const isFiltered = mode !== "global";
  const isCountry = isCountryMode(mode);

  return (
    <MonitorModeContext.Provider value={{ mode, config, setMode, isFiltered, isCountry }}>
      {children}
    </MonitorModeContext.Provider>
  );
}

export function useMonitorMode() {
  return useContext(MonitorModeContext);
}
