import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest,NextResponse } from "next/server";

async function handler(req:NextRequest):Promise<NextResponse> {
    return proxyToBackend(req,'usuario')
}

export const GET = handler
export const POST = handler