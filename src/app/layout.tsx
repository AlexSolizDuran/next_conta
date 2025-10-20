import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SuscripcionesPage from "@/components/Suscripciones";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div>
          {children}
          </div>
        <div className="pt-2">
        <SuscripcionesPage/>
        </div>
      </body>
    </html>
  );
}
