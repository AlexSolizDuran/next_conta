import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const empresa_id = req.nextUrl.searchParams.get("empresa_id");
  const usuario_id = req.nextUrl.searchParams.get("usuario_id");

  if (!empresa_id || !usuario_id) {
    return NextResponse.json(
      { message: "Faltan parámetros empresa_id o usuario_id" },
      { status: 400 }
    );
  }

  const backendUrl = `${process.env.API_URL}/logs/descargar/?empresa_id=${empresa_id}&usuario_id=${usuario_id}`;

  const token = req.cookies.get("sessionToken")?.value;
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const res = await fetch(backendUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let errMsg = "Error al descargar el log";
    try { errMsg = (await res.json()).message || errMsg; } catch {}
    return NextResponse.json({ message: errMsg }, { status: res.status });
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename=log_${empresa_id}_${usuario_id}.json`,
    },
  });
}
