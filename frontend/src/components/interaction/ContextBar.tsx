"use client";

import { MapPin, AlertTriangle, Clock, Activity } from "lucide-react";
import type { FullCortexResponse } from "@/types/cortex";

/**
 * ContextBar — Persistent context memory strip.
 * User always knows: current scenario, region, risk state, last update.
 * Sits at the top of the intelligence dashboard.
 */
interface ContextBarProps {
  data: FullCortexResponse | null;
  isProcessing: boolean;
}

export default function ContextBar({ data, isProcessing }: ContextBarProps) {
  const event = data?.economic?.normalized_event;
  const hasData = !!event;

  return (
    <div className="context-bar">
      <div className="flex items-center gap-6 overflow-x-auto">
        {/* Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${
            isProcessing ? "bg-blue-500 pulse-dot" :
            hasData ? "bg-emerald-500" : "bg-neutral-600"
          }`} />
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
            {isProcessing ? "Processing" : hasData ? "Active Analysis" : "Standby"}
          </span>
        </div>

        <div className="w-px h-4 bg-neutral-800 flex-shrink-0" />

        {/* Region */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <MapPin className="w-3 h-3 text-neutral-600" />
          <span className="text-[10px] text-neutral-400">
            {event?.region || "Kuwait"} — KWT/motor_retail
          </span>
        </div>

        <div className="w-px h-4 bg-neutral-800 flex-shrink-0" />

        {/* Event */}
        {hasData ? (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="text-[10px] text-neutral-300 truncate">
                {event.title}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 flex-shrink-0 uppercase">
                {event.category?.replace(/_/g, " ")}
              </span>
            </div>

            <div className="w-px h-4 bg-neutral-800 flex-shrink-0" />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Activity className="w-3 h-3 text-neutral-600" />
              <span className="text-[10px] text-neutral-500">
                Severity: {typeof event.severity === "number"
                  ? `${(event.severity * 100).toFixed(0)}%`
                  : event.severity}
              </span>
            </div>
          </>
        ) : (
          <span className="text-[10px] text-neutral-600 italic">
            No active analysis — run an event to begin
          </span>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          <Clock className="w-3 h-3 text-neutral-700" />
          <span className="text-[10px] text-neutral-600 tabular-nums">
            {hasData ? new Date(event.timestamp).toLocaleTimeString() : "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
}
