"use client";

import { usePathname } from "next/navigation";
import { Bell, Clock, Search } from "lucide-react";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Intelligence Dashboard", subtitle: "Decision intelligence overview" },
  "/world": { title: "World Monitor", subtitle: "Global signals and GCC regional status" },
  "/economic": { title: "Economic Layer", subtitle: "Causal reasoning and influence analysis" },
  "/kuwait-motor": { title: "Kuwait Motor", subtitle: "Portfolio risk scoring" },
  "/recommendations": { title: "Recommendations", subtitle: "Rule-based executive actions" },
  "/calibration": { title: "Calibration", subtitle: "Adaptive weight adjustment" },
};

export default function TopBar() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] || PAGE_TITLES["/"];

  return (
    <header
      className="h-[52px] flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-sm"
      style={{
        background: "rgba(13,15,22,0.85)",
        borderBottom: "1px solid var(--cortex-border)",
      }}
    >
      <div>
        <h2 className="text-xs font-semibold text-white">{page.title}</h2>
        <p className="text-[10px] text-neutral-600">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
          style={{ background: "var(--cortex-bg)", border: "1px solid var(--cortex-border)" }}>
          <Search className="w-3 h-3" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline text-[9px] px-1 py-0.5 rounded text-neutral-600"
            style={{ background: "var(--cortex-border)" }}>
            /
          </kbd>
        </button>

        <button className="relative p-1.5 rounded-md hover:bg-white/[0.02] transition-colors">
          <Bell className="w-3.5 h-3.5 text-neutral-500" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
        </button>

        <div className="flex items-center gap-1 text-[10px] text-neutral-600">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">2m ago</span>
        </div>
      </div>
    </header>
  );
}
