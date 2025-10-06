// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = process.env.API_URL; // URL de tu backend Django

  try {
    // Leer los datos del registro enviados desde el frontend
    const registerData = await request.json();

    // Hacer POST al backend Django
    const backendResponse = await fetch(`${url}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    // Si el backend devuelve un error, se pasa tal cual al frontend
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { message: errorData.message || "Error al registrar usuario" },
        { status: backendResponse.status }
      );
    }

    // Registro exitoso: devolver la respuesta del backend al frontend
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Error en /api/auth/register:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
