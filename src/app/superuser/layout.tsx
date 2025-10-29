"use client";

import SideBar from "@/components/superuser/SideBar";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authChannel = new BroadcastChannel("auth_channel");

  authChannel.onmessage = (event) => {
    if (event.data === "logout") {
      // 🔔 ¡Acción actualizada!
      // Al recibir el aviso, redirige a la raíz
      window.location.href = "/login";
    }
  };
  return (
    <div className={`flex h-screen bg-gray-50 `}>
          <SideBar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
  );
}
