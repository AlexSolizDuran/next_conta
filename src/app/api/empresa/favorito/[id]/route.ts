import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";


async function handle(req:NextRequest,ctx:{params:Promise<{id:string}>}) {
    return proxyById(req,ctx,'favorito')
}

export const DELETE = handle