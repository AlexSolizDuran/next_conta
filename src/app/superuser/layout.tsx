"use client";

import SideBar from "@/components/superuser/SideBar";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex h-screen bg-gray-50 `}>
          <SideBar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
  );
}
