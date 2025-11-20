import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

async function handler(req:NextRequest): Promise<NextResponse>{
    return proxyToBackend(req,'ia/asiento-predict')
}

export const POST = handler