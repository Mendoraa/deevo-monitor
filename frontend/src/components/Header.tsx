"use client";

export default function Header() {
  return (
    <header className="border-b border-cortex-border bg-cortex-panel/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
            DC
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Deevo Cortex
            </h1>
            <p className="text-xs text-cortex-muted -mt-0.5">
              Economic Intelligence Layer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-cortex-muted">
            <span className="w-2 h-2 rounded-full bg-cortex-green pulse-dot" />
            System Operational
          </div>
          <span className="text-xs text-cortex-border">v1.0.0</span>
        </div>
      </div>
    </header>
  );
}
