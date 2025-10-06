import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

export async function handler(req:NextRequest):Promise<NextResponse> {
    return proxyToBackend(req,'clase_cuenta')
}

export const GET = handler;
export const POST = handler;