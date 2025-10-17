import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // 1. Obtener el token de las cookies de la petición.
  //    El nombre 'sessionToken' debe coincidir con el que usaste al crear la cookie.
  const token = request.cookies.get("sessionToken")?.value;

  // 2. Si no hay token, el usuario no está autenticado.
  //    Lo redirigimos a la página de login.
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3. Si hay un token, verificamos que sea válido.
  try {
    // La clave secreta DEBE estar en tus variables de entorno (.env.local)
    // y debe ser la misma con la que se firmó el token en el backend.
    const secret = new TextEncoder().encode('django-insecure-mf&$v2m+id9iphtz1w2ap*@2nv93eomfv$2ajtwjti_8eurz*a');
    const {payload} = await jwtVerify(token, secret);

    // Si jwtVerify no lanza un error, el token es válido.
    // Dejamos que la petición continúe.
    return NextResponse.next();
  } catch (error) {
    // 4. Si el token es inválido (expirado, malformado, etc.), jwtVerify lanzará un error.
    console.error("Error de verificación de JWT:", error);

    // Redirigimos al login y eliminamos la cookie inválida del navegador.
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.cookies.delete("sessionToken"); // Limpiamos la cookie corrupta

    return response;
  }
}

// 5. Configuración del "Matcher"
// Aquí especificamos en qué rutas se debe ejecutar el middleware.
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas que quieras proteger.
     * Excluye rutas como /login, /api, _next/static, etc. para evitar bucles.
     */
    "/librovivo/:path*",
    "/perfil/:path*",
    "/superuser/:path*"

  ],
};
