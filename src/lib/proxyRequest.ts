// src/lib/apiProxy.ts
import { NextRequest, NextResponse } from "next/server";

export async function proxyToBackend(
  req: NextRequest,
  endpoint: string
): Promise<NextResponse> {
  try {
    const token = req.cookies.get("sessionToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    const backendUrl = `${process.env.API_URL}/${endpoint}/${queryString}`;

    const options: RequestInit = {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // Solo agregar body si no es GET
    if (req.method !== "GET") {
      const body = await req.json();
      options.body = JSON.stringify(body);
    }

    const res = await fetch(backendUrl, options);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`Error proxy a ${endpoint}:`, err);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
