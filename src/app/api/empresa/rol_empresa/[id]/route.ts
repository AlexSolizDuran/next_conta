import { proxyById } from "@/lib/proxyById";
import { NextRequest, NextResponse } from "next/server";



async function handler(req:NextRequest,ctx:{params:Promise<{id:string}>}) {
    return proxyById(req,ctx,'rol')
}

export const GET = handler
export const PATCH = handler
export const PUT = handler
export const DELETE = handler