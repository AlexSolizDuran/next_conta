import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

async function handler(req:NextRequest):Promise<NextResponse> {
    return proxyToBackend(req,'suscripcion/confirmar_compra') 
}

export const POST = handler;