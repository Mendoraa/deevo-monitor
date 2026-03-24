import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Deevo Cortex — Decision Intelligence Engine",
  description:
    "Economic intelligence and GCC insurance risk analysis with causal reasoning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Sidebar />
        <div className="ml-[240px] min-h-screen flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 pb-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
