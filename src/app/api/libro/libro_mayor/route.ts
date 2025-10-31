import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest):Promise<NextResponse> {
    return proxyToBackend(req,'libro_mayor')
    
}