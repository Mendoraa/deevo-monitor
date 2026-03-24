"use client";

import { useState } from "react";
import {
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  Zap,
  ChevronDown,
} from "lucide-react";
import type { EventInput } from "@/types/economic-layer";
import type { FullCortexResponse } from "@/types/cortex";
import { runFullCortex } from "@/lib/api";
import { MOCK_OVERALL_RISK } from "@/lib/mock-data";

interface HeroSectionProps {
  onAnalysisComplete: (data: FullCortexResponse) => void;
  onAnalysisStart: () => void;
  onAnalysisError: (error: string) => void;
  isLoading: boolean;
  isCompact?: boolean;
}

const EVENT_CATEGORIES = [
  { value: "energy_supply", label: "Energy Supply" },
  { value: "geopolitical", label: "Geopolitical" },
  { value: "sanctions", label: "Sanctions" },
  { value: "natural_disaster", label: "Natural Disaster" },
  { value: "financial_crisis", label: "Financial Crisis" },
  { value: "regulatory", label: "Regulatory" },
  { value: "pandemic", label: "Pandemic" },
];

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function HeroSection({
  onAnalysisComplete,
  onAnalysisStart,
  onAnalysisError,
  isLoading,
  isCompact = false,
}: HeroSectionProps) {
  const risk = MOCK_OVERALL_RISK;

  // Event input state
  const [eventTitle, setEventTitle] = useState("Oil prices surge due to Middle East tensions");
  const [eventCategory, setEventCategory] = useState("energy_supply");
  const [eventSeverity, setEventSeverity] = useState("high");
  const [eventRegion, setEventRegion] = useState("Middle East");
  const [showEventInput, setShowEventInput] = useState(false);

  const handleRunAnalysis = async () => {
    if (!eventTitle.trim()) return;
    onAnalysisStart();
    const event: EventInput = {
      title: eventTitle.trim(),
      category: eventCategory,
      severity: eventSeverity,
      region: eventRegion,
      source_confidence: 0.85,
    };
    try {
      const result = await runFullCortex(event);
      onAnalysisComplete(result);
    } catch (e: unknown) {
      onAnalysisError(e instanceof Error ? e.message : "Analysis failed");
    }
  };

  return (
    <section className="hero-section">
      {/* Top: Status bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="hero-icon-ring">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Deevo Cortex
            </h1>
            <p className="text-xs text-neutral-500 tracking-wide">
              Decision Intelligence Engine — Kuwait Motor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Composite Risk */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                Composite Risk
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {risk.composite_score}
                </span>
                <span className="risk-indicator-high text-xs px-2 py-0.5 rounded-full font-medium">
                  HIGH
                </span>
              </div>
            </div>
            <div className="w-px h-10 bg-neutral-700/50" />
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                Confidence
              </span>
              <div className="text-lg font-semibold text-white tabular-nums">
                {(risk.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Run Analysis */}
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading || !eventTitle.trim()}
            className="hero-analyze-btn"
          >
            {isLoading ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isLoading ? "Analyzing..." : "Run Analysis"}</span>
          </button>
        </div>
      </div>

      {/* Event Input Panel */}
      <div className="mb-3">
        <button
          onClick={() => setShowEventInput(!showEventInput)}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <ChevronDown
            size={12}
            className={`transition-transform ${showEventInput ? "rotate-180" : ""}`}
          />
          Event Configuration
        </button>

        {showEventInput && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-[9px] uppercase tracking-wider text-neutral-600 block mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Describe the geopolitical event..."
                className="w-full px-3 py-2 rounded-md text-[12px] text-neutral-200 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/30 focus:outline-none placeholder-neutral-700"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[9px] uppercase tracking-wider text-neutral-600 block mb-1">
                Category
              </label>
              <select
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-[12px] text-neutral-200 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/30 focus:outline-none appearance-none"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0d0f16] text-neutral-200">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity + Region */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-neutral-600 block mb-1">
                  Severity
                </label>
                <select
                  value={eventSeverity}
                  onChange={(e) => setEventSeverity(e.target.value)}
                  className="w-full px-2 py-2 rounded-md text-[12px] text-neutral-200 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/30 focus:outline-none appearance-none"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-[#0d0f16] text-neutral-200">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-neutral-600 block mb-1">
                  Region
                </label>
                <input
                  type="text"
                  value={eventRegion}
                  onChange={(e) => setEventRegion(e.target.value)}
                  className="w-full px-2 py-2 rounded-md text-[12px] text-neutral-200 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/30 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick insight strip */}
      {!isCompact && (
        <div className="hero-insight-strip">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-neutral-300">
              Market stress elevated at 72 — oil volatility driving regional
              pressure across motor portfolio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-neutral-400">
              3 of 5 scores trending upward
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
