"use client";

import NavBar from "@/components/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 🔹 Navbar fijo o superior */}
      <NavBar />

      {/* 🔹 Contenido principal (debajo del navbar) */}
      <main className="flex-1 p-6 overflow-auto mt-16">
        {children}
      </main>
    </div>
  );
}
