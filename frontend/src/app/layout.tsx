import type { Metadata } from "next";
import "./globals.css";
import { MonitorModeProvider } from "@/lib/monitorMode";

export const metadata: Metadata = {
  title: "DEEVO CORTEX — Intelligence Operating System",
  description: "Real-time economic intelligence and geopolitical signal monitoring for GCC insurance markets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="h-screen overflow-hidden antialiased">
        <MonitorModeProvider>
          {children}
        </MonitorModeProvider>
      </body>
    </html>
  );
}
