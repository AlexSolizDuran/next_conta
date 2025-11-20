import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Creamos una respuesta para poder modificar las cookies
    const response = NextResponse.json({ success: true });

    // Le decimos al navegador que elimine la cookie de sesión
    response.cookies.set("sessionToken", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0), // Fija la fecha de expiración en el pasado
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

