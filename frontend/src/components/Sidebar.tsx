"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  GitBranch,
  Car,
  ListChecks,
  SlidersHorizontal,
  Activity,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Intelligence", icon: LayoutDashboard },
  { href: "/economic", label: "Economic Layer", icon: GitBranch },
  { href: "/world", label: "World Monitor", icon: Globe },
  { href: "/kuwait-motor", label: "Kuwait Motor", icon: Car },
  { href: "/recommendations", label: "Recommendations", icon: ListChecks },
  { href: "/calibration", label: "Calibration", icon: SlidersHorizontal },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] flex flex-col z-50"
      style={{ background: "var(--cortex-panel)", borderRight: "1px solid var(--cortex-border)" }}>

      {/* Brand */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--cortex-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-tight">
              DEEVO CORTEX
            </h1>
            <p className="text-[9px] text-neutral-600 uppercase tracking-[0.15em]">
              Decision Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Market */}
      <div className="px-5 py-2.5" style={{ borderBottom: "1px solid var(--cortex-border)" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-[10px] text-neutral-500">Active</span>
          <span className="text-[10px] font-semibold text-white ml-auto">KWT</span>
          <span className="text-[10px] text-neutral-600">Motor</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2 mx-1.5 rounded-md text-xs transition-all
                ${isActive
                  ? "nav-active font-medium"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"
                }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System */}
      <div className="px-5 py-3" style={{ borderTop: "1px solid var(--cortex-border)" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px] text-neutral-600 uppercase tracking-wider">
            System
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[9px]">
          {["Graph", "Scoring", "Calibration", "Audit"].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-neutral-600">{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-neutral-700">v3.0.0</div>
      </div>
    </aside>
  );
}
