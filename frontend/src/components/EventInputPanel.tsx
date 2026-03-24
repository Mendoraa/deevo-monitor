"use client";

import { useState } from "react";
import type { EventInput, EventSeverity, EventCategory } from "@/types/economic-layer";
import { PRESET_SCENARIOS } from "@/lib/presets";

interface Props {
  onAnalyze: (event: EventInput) => void;
  loading: boolean;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "geopolitical_conflict", label: "Geopolitical Conflict" },
  { value: "shipping_disruption", label: "Shipping Disruption" },
  { value: "energy_supply", label: "Energy Supply" },
  { value: "sanctions", label: "Sanctions" },
  { value: "banking_stress", label: "Banking Stress" },
  { value: "infrastructure_damage", label: "Infrastructure Damage" },
  { value: "trade_policy", label: "Trade Policy" },
  { value: "climate_disaster", label: "Climate Disaster" },
  { value: "cyber", label: "Cyber" },
];

const SEVERITIES: { value: EventSeverity; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-cortex-green" },
  { value: "moderate", label: "Moderate", color: "bg-cortex-amber" },
  { value: "high", label: "High", color: "bg-cortex-red" },
  { value: "critical", label: "Critical", color: "bg-red-700" },
];

export default function EventInputPanel({ onAnalyze, loading }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("geopolitical_conflict");
  const [severity, setSeverity] = useState<EventSeverity>("high");
  const [region] = useState("Middle East");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAnalyze({
      title: title.trim(),
      category,
      severity,
      region,
      source_confidence: 0.8,
    });
  };

  const handlePreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setTitle(preset.event.title);
    if (preset.event.category) setCategory(preset.event.category);
    setSeverity(preset.event.severity);
    onAnalyze(preset.event);
  };

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Event Input
        </h2>
        <span className="text-xs text-cortex-muted">Phase 1 — Classify &amp; Route</span>
      </div>

      {/* Preset scenarios */}
      <div>
        <p className="text-xs text-cortex-muted mb-2">Quick scenarios:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              disabled={loading}
              className="px-3 py-1.5 text-xs rounded-lg bg-cortex-border/50 text-cortex-text
                         hover:bg-cortex-accent/20 hover:text-white transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom event input */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-cortex-muted block mb-1">Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe the geopolitical or economic event..."
            className="w-full px-3 py-2 bg-cortex-bg border border-cortex-border rounded-lg
                       text-sm text-white placeholder-cortex-muted/60
                       focus:outline-none focus:border-cortex-accent transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-cortex-muted block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3 py-2 bg-cortex-bg border border-cortex-border rounded-lg
                         text-sm text-white focus:outline-none focus:border-cortex-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-cortex-muted block mb-1">Severity</label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value)}
                  className={`flex-1 px-2 py-2 text-xs rounded-lg border transition-all
                    ${severity === s.value
                      ? `${s.color} bg-opacity-20 border-current text-white`
                      : "border-cortex-border text-cortex-muted hover:text-white"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className="w-full py-2.5 bg-cortex-accent text-white text-sm font-medium rounded-lg
                     hover:bg-blue-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Economic Impact...
            </>
          ) : (
            "Run Economic Analysis"
          )}
        </button>
      </div>
    </div>
  );
}
