"use client";

import { ReactNode } from "react";

/**
 * AppShell — Root layout primitive.
 * Sidebar (fixed 240px) + Content area with topbar.
 */
interface AppShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}

export default function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="min-h-screen antialiased" style={{ background: "var(--cortex-bg)" }}>
      {sidebar}
      <div className="ml-[240px] min-h-screen flex flex-col">
        {topbar}
        <main className="flex-1 p-6 pb-12">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
