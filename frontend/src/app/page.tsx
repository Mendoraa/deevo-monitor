"use client";

import dynamic from "next/dynamic";
import NavRail from "@/components/platform/NavRail";
import TopStatusBar from "@/components/platform/TopStatusBar";
import SignalFeed from "@/components/platform/SignalFeed";
import InsightPanel from "@/components/platform/InsightPanel";
import KPIBar from "@/components/platform/KPIBar";

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/platform/MapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-void">
      <div className="flex flex-col items-center gap-3">
        <div className="cx-spinner" />
        <span className="text-[9px] text-muted tracking-widest uppercase">
          Initializing Intelligence Surface
        </span>
      </div>
    </div>
  ),
});

export default function CommandCenter() {
  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "var(--cx-void)" }}>
      {/* Navigation Rail — 54px left */}
      <NavRail />

      {/* Top Status Bar — 38px height */}
      <TopStatusBar />

      {/* Map — full screen behind everything */}
      <div className="absolute inset-0" style={{ left: "54px", top: "38px", bottom: "52px" }}>
        <MapView />
      </div>

      {/* Signal Feed — left floating panel */}
      <SignalFeed />

      {/* AI Insight Panel — right floating panel */}
      <InsightPanel />

      {/* KPI Bar — bottom */}
      <KPIBar />
    </div>
  );
}
// Platform v4.0 — Intelligence Operating System
