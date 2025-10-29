"use client";

import Sidebar from "@/components/Sidebar";
import { ColoresProvider } from "@/context/ColoresContext";
import { EstiloProvider, useEstilo } from "@/context/EstiloContext";
import { PermisosProvider } from "@/context/PermisoProvider";

// Componente interno para aplicar las clases dinámicas
function AppContent({ children }: { children: React.ReactNode }) {
  const { fuente, tamano } = useEstilo(); // 🔹 obtenemos los estilos dinámicos
  const authChannel = new BroadcastChannel("auth_channel");

  authChannel.onmessage = (event) => {
    if (event.data === "logout") {
      // 🔔 ¡Acción actualizada!
      // Al recibir el aviso, redirige a la raíz
      window.location.href = "/login";
    }
  };
  return (
    <div className={`flex h-screen bg-gray-50 ${fuente} ${tamano}`}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ColoresProvider>
      <EstiloProvider>
        <PermisosProvider>
          <AppContent>{children}</AppContent>
        </PermisosProvider>
      </EstiloProvider>
    </ColoresProvider>
  );
}
