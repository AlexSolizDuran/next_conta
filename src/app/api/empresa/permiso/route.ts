import { proxyById } from "@/lib/proxyById";
import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
    return proxyToBackend(req,'permiso')
}