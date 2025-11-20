import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

//endpoint en el backend  suscripcion/activa
async function handler(req:NextRequest):Promise<NextResponse> {
    return proxyToBackend(req,'suscripcion/activa') 
}

export const GET = handler;
// Nota: Solo se necesita el método GET para consultar la suscripción.