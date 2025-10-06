// src/app/api/asiento_contable/route.ts
import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest): Promise<NextResponse> {
  return proxyToBackend(req, "asiento_contable");
}

// Ambas exportaciones apuntan al mismo handler
export const GET = handler;
export const POST = handler;
