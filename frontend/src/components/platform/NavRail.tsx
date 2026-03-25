"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  GitBranch,
  Network,
  Target,
  Shield,
  Activity,
} from "lucide-react";

const NAV = [
  { href: "/", icon: Globe, label: "Command", shortcut: "1" },
  { href: "/scenarios", icon: GitBranch, label: "Scenarios", shortcut: "2" },
  { href: "/graph", icon: Network, label: "Graph", shortcut: "3" },
  { href: "/decisions", icon: Target, label: "Decisions", shortcut: "4" },
];

export default function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-3 px-1"
      style={{
        width: "54px",
        background: "rgba(7, 10, 18, 0.95)",
        borderRight: "1px solid var(--cx-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Brand Mark */}
      <div className="mb-4 flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center mb-1"
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <Shield className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-[7px] font-bold text-blue-400 tracking-[0.15em]">
          DEEVO
        </span>
      </div>

      {/* Divider */}
      <div className="w-6 h-px mb-3" style={{ background: "var(--cx-border)" }} />

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-rail-item ${isActive ? "nav-rail-active" : ""}`}
              title={`${item.label} (${item.shortcut})`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[7px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* System Status */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live" />
          <Activity className="w-3 h-3 text-emerald-500/60" />
        </div>
        <span className="text-[7px] text-dim font-mono">v4.0</span>
      </div>
    </nav>
  );
}
