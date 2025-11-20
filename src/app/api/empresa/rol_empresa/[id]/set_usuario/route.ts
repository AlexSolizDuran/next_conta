import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // Obtener id desde params
  const { id } = await ctx.params;

  if (!id)
    return NextResponse.json(
      { message: "ID no especificado" },
      { status: 400 }
    );

  const token = req.cookies.get("sessionToken")?.value;
  if (!token)
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const backendUrl = `${process.env.API_URL}/rol/${id}/set_usuarios/`;
  const body = await req.json();
  const fetchOptions: RequestInit = {
    method: req.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  try {
    const res = await fetch(backendUrl, fetchOptions);

    if (res.status === 204) {
      return NextResponse.json(
        { success: true, message: "Eliminado" },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err:any) {
    return NextResponse.json({ message: `Error al conectar con el backend: ${err.message}` });
  }
}
