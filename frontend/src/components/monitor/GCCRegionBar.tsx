"use client";

import { useMonitorMode, isCountryMode } from "@/lib/monitorMode";
import { MOCK_REGIONS, type RegionData } from "@/lib/mock-data";

const REGION_ACTIVE_STYLES: Record<string, string> = {
  KWT: "border-cyan-500/30 bg-cyan-500/5",
  SAU: "border-emerald-500/30 bg-emerald-500/5",
  UAE: "border-blue-500/30 bg-blue-500/5",
  BHR: "border-amber-500/30 bg-amber-500/5",
  QAT: "border-purple-500/30 bg-purple-500/5",
  OMN: "border-red-500/30 bg-red-500/5",
};

export default function GCCRegionBar() {
  const { mode, config } = useMonitorMode();

  // Show in GCC or any country mode
  if (mode !== "gcc" && !isCountryMode(mode)) return null;

  const regions = MOCK_REGIONS;
  const focusedRegions = config.regionFilter;

  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-[9px] uppercase tracking-wider text-neutral-600 mr-1">
        Region Focus
      </span>
      {regions.map((region: RegionData) => {
        const isFocused = focusedRegions.includes(region.code);
        const activeStyle = REGION_ACTIVE_STYLES[region.code] || "";

        return (
          <div
            key={region.code}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] border transition-all duration-200 ${
              isFocused
                ? `${activeStyle} text-white font-medium`
                : "border-transparent text-neutral-600 opacity-40"
            }`}
          >
            {isFocused && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            )}
            <span>{region.code}</span>
            <span className="text-neutral-500">{region.name_ar}</span>
          </div>
        );
      })}
    </div>
  );
}
