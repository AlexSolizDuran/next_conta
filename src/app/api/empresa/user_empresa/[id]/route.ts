import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";


async function handler(req:NextRequest,ctx:{params:Promise<{id:string}>}) {
    return proxyById(req,ctx,'user_empresa')
}
export const GET = handler;
export const PATCH = handler;
export const DELETE = handler;
export const PUT = handler;