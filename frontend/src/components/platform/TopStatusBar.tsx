"use client";

import { Shield, Bell, Wifi, Clock, AlertTriangle } from "lucide-react";
import { useMonitorMode, PRIMARY_MODES, COUNTRY_MODES, type MonitorMode } from "@/lib/monitorMode";

export default function TopStatusBar() {
  const { mode, setMode } = useMonitorMode();

  return (
    <header
      className="absolute top-0 left-[54px] right-0 z-40 flex items-center h-[38px] px-4"
      style={{
        background: "rgba(7, 10, 18, 0.88)",
        borderBottom: "1px solid var(--cx-border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Left: System title */}
      <div className="flex items-center gap-2 mr-6">
        <span className="text-[9px] font-bold text-blue-400 tracking-[0.15em] uppercase">
          CORTEX
        </span>
        <span className="text-[8px] text-dim">|</span>
        <span className="text-[9px] font-medium text-muted tracking-wide">
          GCC Intelligence Platform
        </span>
      </div>

      {/* Center: Mode switches */}
      <div className="flex items-center gap-0.5 mx-auto">
        {["global", "gcc", "kuwait", "saudi", "uae", "intelligence", "economic"].map(
          (m) => {
            const labels: Record<string, string> = {
              global: "GLOBAL",
              gcc: "GCC",
              kuwait: "KWT",
              saudi: "SAU",
              uae: "UAE",
              intelligence: "INTEL",
              economic: "ECON",
            };
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m as MonitorMode)}
                className="px-2.5 py-1 rounded text-[8px] font-semibold tracking-[0.08em] transition-all"
                style={{
                  color: isActive ? "#93c5fd" : "#4a5068",
                  background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(59,130,246,0.2)" : "transparent"}`,
                }}
              >
                {labels[m] || m.toUpperCase()}
              </button>
            );
          }
        )}
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Live alert count */}
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span className="text-[9px] font-bold text-amber-400 text-mono">3</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1 rounded hover:bg-white/[0.03]">
          <Bell className="w-3 h-3 text-muted" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-red-500 pulse-live" />
        </button>

        {/* Connection */}
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-emerald-500" />
          <span className="text-[8px] text-emerald-500/70 font-mono">LIVE</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-[9px] text-muted font-mono">
          <Clock className="w-3 h-3" />
          <span>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
          <span className="text-dim">UTC+3</span>
        </div>
      </div>
    </header>
  );
}
