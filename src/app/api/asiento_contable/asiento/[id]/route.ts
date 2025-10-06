// src/app/api/residencias/vivienda/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { proxyById } from "@/lib/proxyById";

export async function handler(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const allowedMethods = ["GET", "PATCH", "DELETE"];
  if (!allowedMethods.includes(req.method)) {
    return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
  }

  return proxyById(req, ctx, "asiento_contable");
}

// Mapear los métodos a la función handler
export const GET = handler;
export const PATCH = handler;
export const DELETE = handler;
export const PUT = handler;
