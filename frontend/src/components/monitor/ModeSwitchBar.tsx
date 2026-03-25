"use client";

import {
  Globe, MapPin, Building2, Brain, TrendingUp,
} from "lucide-react";
import {
  useMonitorMode,
  type MonitorMode,
  MODE_CONFIGS,
  PRIMARY_MODES,
  COUNTRY_MODES,
  isCountryMode,
} from "@/lib/monitorMode";

const ICON_MAP: Record<string, typeof Globe> = {
  Globe, MapPin, Building2, Brain, TrendingUp,
};

const ACCENT_COLORS: Record<string, string> = {
  blue: "rgba(59,130,246,0.15)",
  emerald: "rgba(16,185,129,0.15)",
  cyan: "rgba(6,182,212,0.15)",
  purple: "rgba(168,85,247,0.15)",
  amber: "rgba(245,158,11,0.15)",
  red: "rgba(239,68,68,0.15)",
};

const ACCENT_TEXT: Record<string, string> = {
  blue: "text-blue-400",
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

const ACCENT_BORDER: Record<string, string> = {
  blue: "rgba(59,130,246,0.3)",
  emerald: "rgba(16,185,129,0.3)",
  cyan: "rgba(6,182,212,0.3)",
  purple: "rgba(168,85,247,0.3)",
  amber: "rgba(245,158,11,0.3)",
  red: "rgba(239,68,68,0.3)",
};

function ModeButton({ modeKey, isActive, onClick, compact }: {
  modeKey: MonitorMode; isActive: boolean; onClick: () => void; compact?: boolean;
}) {
  const cfg = MODE_CONFIGS[modeKey];
  const Icon = ICON_MAP[cfg.icon] || Globe;
  const accent = cfg.accentColor;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 ${compact ? "px-2 py-1" : "px-3 py-1.5"} rounded-md text-[11px] font-medium transition-all duration-200 ${
        isActive ? `${ACCENT_TEXT[accent]}` : "text-neutral-500 hover:text-neutral-300"
      }`}
      style={
        isActive
          ? {
              background: ACCENT_COLORS[accent],
              border: `1px solid ${ACCENT_BORDER[accent]}`,
              boxShadow: `0 0 12px ${ACCENT_COLORS[accent]}`,
            }
          : { background: "transparent", border: "1px solid transparent" }
      }
      title={cfg.description}
    >
      {!compact && <Icon className="w-3.5 h-3.5" />}
      <span>{cfg.label}</span>
      {compact && cfg.labelAr && (
        <span className="text-[8px] text-neutral-600" dir="rtl">{cfg.labelAr}</span>
      )}
    </button>
  );
}

export default function ModeSwitchBar() {
  const { mode, setMode } = useMonitorMode();

  // Show country sub-bar when in GCC or any country mode
  const showCountryBar = mode === "gcc" || isCountryMode(mode);

  return (
    <div className="space-y-1.5">
      {/* Primary modes */}
      <div
        className="flex items-center gap-1 p-1 rounded-lg"
        style={{ background: "var(--cortex-panel)", border: "1px solid var(--cortex-border)" }}
      >
        {PRIMARY_MODES.map((modeKey) => (
          <ModeButton
            key={modeKey}
            modeKey={modeKey}
            isActive={mode === modeKey || (modeKey === "gcc" && isCountryMode(mode))}
            onClick={() => setMode(modeKey)}
          />
        ))}

        {/* Active mode indicator */}
        {mode !== "global" && (
          <div className="ml-auto flex items-center gap-1.5 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            <span className="text-[9px] text-neutral-600 uppercase tracking-wider">
              {MODE_CONFIGS[mode].labelAr}
            </span>
          </div>
        )}
      </div>

      {/* Country sub-modes (when GCC or country is active) */}
      {showCountryBar && (
        <div
          className="flex items-center gap-0.5 p-1 rounded-lg ml-4"
          style={{
            background: "rgba(16,185,129,0.02)",
            border: "1px solid rgba(16,185,129,0.08)",
          }}
        >
          <span className="text-[8px] text-neutral-600 uppercase tracking-wider px-2">
            Country
          </span>
          <div className="w-px h-4 bg-neutral-800 mx-1" />
          {COUNTRY_MODES.map((countryMode) => (
            <ModeButton
              key={countryMode}
              modeKey={countryMode}
              isActive={mode === countryMode}
              onClick={() => setMode(countryMode)}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
