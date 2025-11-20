import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const API_URL = process.env.API_URL;
    if (!API_URL) {
      return NextResponse.json(
        { error: "API_URL no configurada" },
        { status: 500 }
      );
    }

    // Obtener parámetros de búsqueda
    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Obtener el token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Construir la URL del backend
    const backendUrl = `${API_URL}/estado_resultados/export/pdf/?${queryString}`;

    // Hacer la petición al backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al exportar PDF" },
        { status: response.status }
      );
    }

    // Obtener el PDF como blob
    const pdfBlob = await response.blob();

    // Retornar el PDF con los headers correctos
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="estado_resultados.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error en proxy de exportación PDF:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
