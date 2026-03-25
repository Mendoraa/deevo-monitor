"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

// ─── GCC Signal Points ───────────────────────────────────────
interface MapSignal {
  id: string;
  lat: number;
  lng: number;
  label: string;
  severity: "critical" | "high" | "medium" | "low";
  type: "country" | "hotspot" | "route" | "event";
  detail: string;
  riskScore?: number;
}

const GCC_SIGNALS: MapSignal[] = [
  // Countries
  { id: "kwt", lat: 29.3759, lng: 47.9774, label: "Kuwait", severity: "high", type: "country", detail: "DRI: 64 · Motor claims +12% · Fraud exposure elevated", riskScore: 64 },
  { id: "sau", lat: 24.7136, lng: 46.6753, label: "Saudi Arabia", severity: "medium", type: "country", detail: "DRI: 48 · Vision 2030 restructuring · Property exposure rising", riskScore: 48 },
  { id: "uae", lat: 25.2048, lng: 55.2708, label: "UAE", severity: "low", type: "country", detail: "DRI: 38 · Stable portfolio · Marine logistics monitored", riskScore: 38 },
  { id: "bhr", lat: 26.0667, lng: 50.5577, label: "Bahrain", severity: "medium", type: "country", detail: "DRI: 52 · Provider billing anomaly detected", riskScore: 52 },
  { id: "qat", lat: 25.2854, lng: 51.5310, label: "Qatar", severity: "low", type: "country", detail: "DRI: 35 · Lowest regional risk · LNG revenue buffer", riskScore: 35 },
  { id: "omn", lat: 23.5880, lng: 58.3829, label: "Oman", severity: "medium", type: "country", detail: "DRI: 55 · Cyclone season exposure · Marine stress", riskScore: 55 },

  // Hotspots
  { id: "hormuz", lat: 26.55, lng: 56.25, label: "Strait of Hormuz", severity: "critical", type: "hotspot", detail: "Critical chokepoint · 21% global oil transit · Tension index: HIGH" },
  { id: "yemen", lat: 15.35, lng: 44.20, label: "Yemen Conflict Zone", severity: "critical", type: "hotspot", detail: "Active conflict · Maritime threat to Red Sea shipping" },
  { id: "basra", lat: 30.51, lng: 47.81, label: "Basra Oil Terminal", severity: "high", type: "hotspot", detail: "Major export hub · Supply disruption risk" },

  // Routes
  { id: "oil-route", lat: 24.0, lng: 58.0, label: "GCC Oil Export Corridor", severity: "medium", type: "route", detail: "Primary tanker route · Insurance exposure: $2.4B daily" },
  { id: "supply-chain", lat: 25.0, lng: 55.0, label: "Dubai Logistics Hub", severity: "low", type: "route", detail: "Parts supply chain node · Repair cost dependency" },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

function createMarkerIcon(signal: MapSignal): L.DivIcon {
  const color = SEVERITY_COLORS[signal.severity];
  const size = signal.type === "country" ? 16 : signal.type === "hotspot" ? 14 : 10;
  const ringSize = size + 8;

  return L.divIcon({
    className: "",
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
    html: `
      <div style="position:relative;width:${ringSize}px;height:${ringSize}px;">
        <div style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:${color};
          opacity:0.9;
          box-shadow:0 0 ${size}px ${color}40, 0 0 ${size * 2}px ${color}20;
        "></div>
        <div style="
          position:absolute;
          top:0;left:0;
          width:${ringSize}px;height:${ringSize}px;
          border-radius:50%;
          border:1px solid ${color}60;
          animation:pulse-ring 2.5s ease-out infinite;
        "></div>
        ${signal.riskScore ? `<div style="
          position:absolute;
          top:-14px;left:50%;
          transform:translateX(-50%);
          font-size:8px;font-weight:700;
          color:${color};
          font-family:'JetBrains Mono',monospace;
          text-shadow:0 1px 4px rgba(0,0,0,0.8);
          white-space:nowrap;
        ">${signal.riskScore}</div>` : ""}
      </div>
    `,
  });
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [25.5, 51.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 12,
    });

    // Dark CartoDB tiles — cinematic look
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    // Add subtle label layer on top
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19, opacity: 0.4 }
    ).addTo(map);

    // Zoom control — bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add signal markers
    GCC_SIGNALS.forEach((signal) => {
      const marker = L.marker([signal.lat, signal.lng], {
        icon: createMarkerIcon(signal),
      }).addTo(map);

      marker.bindPopup(
        `<div style="min-width:200px;padding:4px 0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="width:6px;height:6px;border-radius:50%;background:${SEVERITY_COLORS[signal.severity]}"></span>
            <span style="font-size:11px;font-weight:700;color:#e8eaef;">${signal.label}</span>
            <span style="font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${SEVERITY_COLORS[signal.severity]};margin-left:auto;">${signal.severity}</span>
          </div>
          <div style="font-size:10px;color:#9ca3af;line-height:1.5;">${signal.detail}</div>
          ${signal.riskScore ? `<div style="margin-top:6px;font-size:9px;font-weight:600;color:${SEVERITY_COLORS[signal.severity]};">DEEVO RISK INDEX: ${signal.riskScore}</div>` : ""}
        </div>`,
        { className: "", closeButton: false }
      );
    });

    // Draw connection lines between hotspots and affected countries
    const connections: [number, number][][] = [
      [[26.55, 56.25], [29.3759, 47.9774]], // Hormuz → Kuwait
      [[26.55, 56.25], [25.2048, 55.2708]], // Hormuz → UAE
      [[26.55, 56.25], [26.0667, 50.5577]], // Hormuz → Bahrain
      [[30.51, 47.81], [29.3759, 47.9774]], // Basra → Kuwait
      [[15.35, 44.20], [24.7136, 46.6753]], // Yemen → Saudi
    ];

    connections.forEach((coords) => {
      L.polyline(coords as L.LatLngExpression[], {
        color: "#3b82f640",
        weight: 1,
        dashArray: "4 6",
      }).addTo(map);
    });

    mapInstanceRef.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0" style={{ background: "var(--cx-void)" }}>
      <div ref={mapRef} className="w-full h-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="cx-spinner" />
        </div>
      )}
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(4,6,11,0.4) 100%)",
        }}
      />
    </div>
  );
}
