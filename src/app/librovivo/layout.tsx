"use client";

import Sidebar from "@/components/Sidebar";
import { ColoresProvider } from "@/context/ColoresContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ColoresProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </ColoresProvider>
  );
}
