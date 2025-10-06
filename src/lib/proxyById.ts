// src/lib/proxyById.ts
import { NextRequest, NextResponse } from "next/server";

export async function proxyById(req: NextRequest,{ params }: { params: Promise<{ id: string }> }, endpoint: string) {
  // Obtener id desde params
  const { id } = await params;
  
  if (!id) return NextResponse.json({ message: "ID no especificado" }, { status: 400 });

  const token = req.cookies.get("sessionToken")?.value;
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const backendUrl = `${process.env.API_URL}/${endpoint}/${id}/`;

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method !== "GET") {
    const body = await req.json();
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(backendUrl, fetchOptions);

    if (res.status === 204) {
      return NextResponse.json({ success: true, message: "Eliminado" }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`Error proxy a ${endpoint}/${id}:`, err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
