"use client";

import { useState } from "react";
import NavRail from "@/components/platform/NavRail";
import TopStatusBar from "@/components/platform/TopStatusBar";
import KPIBar from "@/components/platform/KPIBar";
import { Network, Search, Filter, ChevronRight } from "lucide-react";

// ─── Graph Data ──────────────────────────────────────────────
interface GNode {
  id: string;
  label: string;
  type: "event" | "macro" | "sector" | "insurance" | "country" | "variable";
  x: number;
  y: number;
  weight: number;
}

interface GEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
  direction: "up" | "down" | "stable";
}

const NODES: GNode[] = [
  { id: "hormuz", label: "Hormuz Tension", type: "event", x: 120, y: 80, weight: 0.95 },
  { id: "oil", label: "Oil Price", type: "macro", x: 320, y: 60, weight: 0.88 },
  { id: "repair", label: "Repair Costs", type: "variable", x: 520, y: 100, weight: 0.78 },
  { id: "claims", label: "Claims Severity", type: "insurance", x: 700, y: 80, weight: 0.82 },
  { id: "fraud", label: "Fraud Clusters", type: "insurance", x: 700, y: 220, weight: 0.72 },
  { id: "reserves", label: "Reserve Pressure", type: "insurance", x: 880, y: 140, weight: 0.68 },
  { id: "motor", label: "Motor Portfolio", type: "sector", x: 520, y: 280, weight: 0.75 },
  { id: "marine", label: "Marine Insurance", type: "sector", x: 320, y: 280, weight: 0.65 },
  { id: "kwt", label: "Kuwait", type: "country", x: 120, y: 200, weight: 0.80 },
  { id: "sau", label: "Saudi Arabia", type: "country", x: 120, y: 320, weight: 0.60 },
  { id: "uae", label: "UAE", type: "country", x: 320, y: 380, weight: 0.50 },
  { id: "inflation", label: "CPI Inflation", type: "macro", x: 520, y: 380, weight: 0.63 },
  { id: "uw_stress", label: "UW Stress", type: "insurance", x: 880, y: 300, weight: 0.70 },
  { id: "pricing", label: "Pricing Gap", type: "variable", x: 700, y: 380, weight: 0.62 },
  { id: "gdp", label: "GCC GDP", type: "macro", x: 320, y: 180, weight: 0.55 },
];

const EDGES: GEdge[] = [
  { source: "hormuz", target: "oil", relationship: "disrupts", weight: 0.92, direction: "up" },
  { source: "oil", target: "repair", relationship: "inflates", weight: 0.85, direction: "up" },
  { source: "repair", target: "claims", relationship: "amplifies", weight: 0.80, direction: "up" },
  { source: "claims", target: "reserves", relationship: "pressures", weight: 0.75, direction: "up" },
  { source: "hormuz", target: "marine", relationship: "exposes", weight: 0.70, direction: "up" },
  { source: "hormuz", target: "kwt", relationship: "threatens", weight: 0.88, direction: "up" },
  { source: "oil", target: "inflation", relationship: "drives", weight: 0.65, direction: "up" },
  { source: "inflation", target: "pricing", relationship: "widens", weight: 0.60, direction: "up" },
  { source: "kwt", target: "motor", relationship: "exposes", weight: 0.78, direction: "up" },
  { source: "fraud", target: "motor", relationship: "exploits", weight: 0.72, direction: "up" },
  { source: "motor", target: "uw_stress", relationship: "increases", weight: 0.68, direction: "up" },
  { source: "sau", target: "gdp", relationship: "diversifies", weight: 0.55, direction: "stable" },
  { source: "uae", target: "marine", relationship: "operates", weight: 0.50, direction: "stable" },
  { source: "reserves", target: "uw_stress", relationship: "compounds", weight: 0.65, direction: "up" },
  { source: "pricing", target: "uw_stress", relationship: "strains", weight: 0.62, direction: "up" },
];

const TYPE_COLORS: Record<string, string> = {
  event: "#ef4444",
  macro: "#3b82f6",
  sector: "#f59e0b",
  insurance: "#8b5cf6",
  country: "#06b6d4",
  variable: "#10b981",
};

const DIR_COLORS: Record<string, string> = {
  up: "#fca5a5",
  down: "#6ee7b7",
  stable: "#4a5068",
};

export default function GraphPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredNodes = filterType ? NODES.filter((n) => n.type === filterType) : NODES;
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = EDGES.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const selected = NODES.find((n) => n.id === selectedNode);
  const selectedEdges = selectedNode
    ? EDGES.filter((e) => e.source === selectedNode || e.target === selectedNode)
    : [];

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "var(--cx-void)" }}>
      <NavRail />
      <TopStatusBar />
      <KPIBar />

      <div className="absolute flex" style={{ left: "54px", top: "38px", right: 0, bottom: "52px" }}>
        {/* Graph Canvas */}
        <div className="flex-1 relative" style={{ background: "var(--cx-bg)" }}>
          {/* Header */}
          <div
            className="absolute top-0 left-0 right-0 z-10 px-5 py-3 flex items-center gap-3"
            style={{
              background: "rgba(7,10,18,0.9)",
              borderBottom: "1px solid var(--cx-border)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <Network className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-[12px] font-bold text-bright">Causal Intelligence Graph</h1>
              <p className="text-[8px] text-muted">{NODES.length} nodes · {EDGES.length} edges · GCC insurance ontology</p>
            </div>

            {/* Type filters */}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setFilterType(null)}
                className="text-[8px] font-semibold px-2 py-1 rounded transition-all"
                style={{
                  color: !filterType ? "#e8eaef" : "#4a5068",
                  background: !filterType ? "rgba(255,255,255,0.05)" : "transparent",
                  border: `1px solid ${!filterType ? "var(--cx-border-bright)" : "transparent"}`,
                }}
              >
                ALL
              </button>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(filterType === type ? null : type)}
                  className="text-[7px] font-bold px-2 py-1 rounded uppercase tracking-wide transition-all"
                  style={{
                    color: filterType === type ? color : "#4a5068",
                    background: filterType === type ? `${color}15` : "transparent",
                    border: `1px solid ${filterType === type ? `${color}30` : "transparent"}`,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Graph */}
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 460"
            style={{ paddingTop: "50px" }}
          >
            {/* Edges */}
            {filteredEdges.map((edge, i) => {
              const s = NODES.find((n) => n.id === edge.source)!;
              const t = NODES.find((n) => n.id === edge.target)!;
              const isSelected = selectedNode === edge.source || selectedNode === edge.target;
              return (
                <g key={i}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={isSelected ? DIR_COLORS[edge.direction] : "var(--cx-border)"}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    strokeDasharray={edge.weight < 0.6 ? "3 4" : "none"}
                    opacity={selectedNode ? (isSelected ? 1 : 0.15) : 0.5}
                  />
                  {/* Arrow */}
                  <circle
                    cx={(s.x + t.x) / 2}
                    cy={(s.y + t.y) / 2}
                    r={2}
                    fill={isSelected ? DIR_COLORS[edge.direction] : "var(--cx-muted)"}
                    opacity={selectedNode ? (isSelected ? 1 : 0.15) : 0.4}
                  />
                  {/* Label */}
                  {isSelected && (
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 - 6}
                      textAnchor="middle"
                      fill={DIR_COLORS[edge.direction]}
                      fontSize="7"
                      fontWeight="600"
                      fontFamily="Inter, sans-serif"
                    >
                      {edge.relationship} ({Math.round(edge.weight * 100)}%)
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const color = TYPE_COLORS[node.type];
              const isSelected = selectedNode === node.id;
              const isConnected = selectedNode
                ? EDGES.some(
                    (e) =>
                      (e.source === selectedNode && e.target === node.id) ||
                      (e.target === selectedNode && e.source === node.id)
                  )
                : false;
              const dimmed = selectedNode && !isSelected && !isConnected;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  style={{ cursor: "pointer" }}
                  opacity={dimmed ? 0.15 : 1}
                >
                  {/* Glow */}
                  {isSelected && (
                    <circle cx={node.x} cy={node.y} r={20} fill={color} opacity={0.08} />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={8 + node.weight * 8}
                    fill={`${color}20`}
                    stroke={color}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  {/* Inner dot */}
                  <circle cx={node.x} cy={node.y} r={3} fill={color} />
                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + 20 + node.weight * 8}
                    textAnchor="middle"
                    fill={isSelected ? "#e8eaef" : "#6b7280"}
                    fontSize="8"
                    fontWeight={isSelected ? "700" : "500"}
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div
            className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 rounded"
            style={{ background: "rgba(7,10,18,0.9)", border: "1px solid var(--cx-border)" }}
          >
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[7px] font-semibold uppercase tracking-wider" style={{ color }}>
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector Panel */}
        <div
          className="flex flex-col"
          style={{
            width: "280px",
            background: "rgba(7,10,18,0.95)",
            borderLeft: "1px solid var(--cx-border)",
          }}
        >
          {selected ? (
            <>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--cx-border)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: TYPE_COLORS[selected.type] }}
                  />
                  <span
                    className="text-[8px] font-bold uppercase tracking-wider"
                    style={{ color: TYPE_COLORS[selected.type] }}
                  >
                    {selected.type}
                  </span>
                </div>
                <h3 className="text-[13px] font-bold text-bright">{selected.label}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div>
                    <span className="text-[7px] text-muted tracking-wider">WEIGHT</span>
                    <div className="text-[12px] font-bold font-mono text-bright">{Math.round(selected.weight * 100)}%</div>
                  </div>
                  <div>
                    <span className="text-[7px] text-muted tracking-wider">CONNECTIONS</span>
                    <div className="text-[12px] font-bold font-mono text-bright">{selectedEdges.length}</div>
                  </div>
                </div>
              </div>

              {/* Connections */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-2">
                  <span className="text-[8px] font-bold text-muted tracking-wider uppercase">
                    Relationships
                  </span>
                </div>
                {selectedEdges.map((edge, i) => {
                  const other = edge.source === selectedNode ? edge.target : edge.source;
                  const otherNode = NODES.find((n) => n.id === other)!;
                  const isOutgoing = edge.source === selectedNode;
                  return (
                    <div
                      key={i}
                      className="px-4 py-2 hover:bg-white/[0.015] cursor-pointer"
                      style={{ borderBottom: "1px solid var(--cx-border)" }}
                      onClick={() => setSelectedNode(other)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-dim">{isOutgoing ? "OUT →" : "IN ←"}</span>
                        <span className="text-[10px] font-semibold text-bright">{otherNode.label}</span>
                        <ChevronRight className="w-3 h-3 text-dim ml-auto" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-medium" style={{ color: DIR_COLORS[edge.direction] }}>
                          {edge.relationship}
                        </span>
                        <span className="text-[8px] font-mono text-muted ml-auto">
                          w: {Math.round(edge.weight * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <Network className="w-8 h-8 text-dim mb-3" />
              <span className="text-[10px] text-muted text-center">
                Click a node to inspect its relationships and propagation paths
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
