"use client";

import Sidebar from "@/components/Sidebar";
import { ColoresProvider } from "@/context/ColoresContext";
import { EstiloProvider, useEstilo } from "@/context/EstiloContext";

// Componente interno para aplicar las clases dinámicas
function AppContent({ children }: { children: React.ReactNode }) {
  const { fuente, tamano } = useEstilo(); // 🔹 obtenemos los estilos dinámicos

  return (
    <div className={`flex h-screen bg-gray-50 ${fuente} ${tamano}`}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ColoresProvider>
      <EstiloProvider>
        <AppContent>{children}</AppContent>
      </EstiloProvider>
    </ColoresProvider>
  );
}
