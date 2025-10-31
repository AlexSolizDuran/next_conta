// src/app/api/asiento_contable/route.ts
import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest): Promise<NextResponse> {
  return proxyToBackend(req, "asiento_contable");
}

export const GET = handler
export const POST = handler