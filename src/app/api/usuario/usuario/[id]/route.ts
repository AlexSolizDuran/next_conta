import { proxyById } from "@/lib/proxyById";
import { NextRequest, NextResponse } from "next/server";


async function handler(req:NextRequest,ctx:{params:Promise<{id:string}>}):Promise<NextResponse> {
    return proxyById(req,ctx,`usuario`)
}

export const GET = handler
export const PATCH = handler
export const PUT = handler
export const DELETE = handler