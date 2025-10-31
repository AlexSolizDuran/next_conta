import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = process.env.API_URL;
  try {
    const loginData = await request.json();
    const token1 = request.cookies.get("sessionToken")?.value;
    // 1. Llamamos a tu backend REAL para autenticar al usuario
    const backendResponse = await fetch(
      `${url}/auth_empresa/login_empresa/`, // URL del backend actualizada
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token1}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
        credentials: "include", // 👈 Importante para pasar cookies
      }
    );

    if (!backendResponse.ok) {
      // Si el backend devuelve un error, lo pasamos al frontend
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { message: errorData.message || "Credenciales inválidas" },
        { status: backendResponse.status }
      );
    }

    // 2. El backend nos devuelve el token en el cuerpo de la respuesta
    const data = await backendResponse.json();
    const token = data.access;

    if (!token) {
      return NextResponse.json(
        { message: "El token no fue proporcionado por el backend" },
        { status: 500 }
      );
    }

    // 3. Creamos una respuesta y establecemos el token en una cookie httpOnly
    const response = NextResponse.json({
      access: token,
      empresa: data.empresa,
      user_empresa: data.user_empresa,
      usuario: data.usuario,
      rol: data.roles,
      permisos: data.permisos,
      custom: data.custom,
    });
    const cookies = backendResponse.headers.get("set-cookie");
    if (cookies) {
      response.headers.set("set-cookie", cookies);
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
