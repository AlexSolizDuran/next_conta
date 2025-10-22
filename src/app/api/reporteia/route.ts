// app/api/reportes/generar/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // <-- Importación esencial

const BACKEND_URL = process.env.API_URL;

// --- CONFIGURACIÓN DE TOKENS Y ENDPOINTS ---
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const REPORT_ENDPOINT = "/ia/generar-reporte/"; // Endpoint de reporte en Django
const REFRESH_ENDPOINT = "/auth/token/refresh/";    // Endpoint de refresco en Django
// ------------------------------------------

/**
 * Función auxiliar para refrescar el Access Token usando el Refresh Token.
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const res = await fetch(`${BACKEND_URL}${REFRESH_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!res.ok) {
            console.error("Fallo al obtener nuevo token:", res.status, await res.text());
            return null; 
        }

        const data = await res.json();
        const newAccessToken = data.access;

        if (newAccessToken) {
            // USAMOS cookies() DIRECTAMENTE para establecer la nueva cookie
            const cookieStore = cookies(); 
            cookieStore.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600, // Ajustar la duración (ej: 1 hora)
                path: '/',
            });
            return newAccessToken;
        }
        return null;

    } catch (e) {
        console.error("Error de red o conexión al refrescar el token:", e);
        return null;
    }
}

/**
 * Intenta hacer la solicitud al endpoint final de Django con el token proporcionado.
 */
async function tryRequest(token: string, bodyText: string) {
    const headers: Record<string, string> = {
        "content-type": bodyText ? "application/json" : "text/plain",
        Authorization: `Bearer ${token}`, // Envío del token
    };

    const options: RequestInit = {
        method: "POST",
        headers,
        body: bodyText || undefined,
    };
    
    return fetch(`${BACKEND_URL}${REPORT_ENDPOINT}`, options);
}

// =========================================================================
// HANDLER PRINCIPAL (POST)
// =========================================================================
export async function POST(request: Request) {
    try {
        if (!BACKEND_URL) {
            throw new Error("BACKEND_URL no está configurada");
        }

        // 1. OBTENER LA INSTANCIA DEL COOKIE STORE CORRECTAMENTE
        const cookieStore = cookies(); 
        const bodyText = await request.text();

        // 2. Primer intento de solicitud con el token actual
        // USAMOS cookieStore DIRECTAMENTE, sin await
        let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
        if (!accessToken) {
            // Este es el error que estabas viendo. Ahora debería funcionar si la cookie existe.
            return NextResponse.json({ success: false, error: "Token de acceso no encontrado." }, { status: 401 });
        }
        
        let res = await tryRequest(accessToken, bodyText);

        // 3. Manejo de Error 401: Intento de Refresco
        if (res.status === 401) {
            console.log("Token expirado. Intentando refrescar...");
            
            // Usamos cookieStore DIRECTAMENTE
            const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
            
            if (refreshToken) {
                const newAccessToken = await refreshAccessToken(refreshToken);

                if (newAccessToken) {
                    // Reintento de la solicitud con el nuevo token
                    console.log("Nuevo Access Token obtenido. Reintentando...");
                    res = await tryRequest(newAccessToken, bodyText);
                } else {
                    // El Refresh Token falló o expiró
                    return NextResponse.json(
                        { success: false, error: "Sesión expirada. Inicie sesión de nuevo." },
                        { status: 401 }
                    );
                }
            } else {
                // No hay refresh token para reintentar
                return NextResponse.json({ success: false, error: "Token inválido sin posibilidad de refresco." }, { status: 401 });
            }
        }
        
        // 4. Manejo Final de la Respuesta (Archivo o JSON)
        
        if (!res.ok) {
            // Manejar errores de la solicitud reintentada
            const errorText = await res.text();
            let payload: any;
            try { payload = JSON.parse(errorText); } catch { payload = { raw: errorText }; }
            return NextResponse.json(payload, { status: res.status });
        }

        // Si la respuesta es BINARIA (PDF/Excel), la transmitimos directamente
        const contentType = res.headers.get("Content-Type");
        if (contentType?.includes("application/json")) {
            const payload = await res.json();
            return NextResponse.json(payload, { status: res.status });
        }

        // Transmisión del archivo binario
        const responseHeaders = new Headers(res.headers);
        
        return new NextResponse(res.body, {
            status: res.status,
            headers: responseHeaders, // Reenviamos Content-Disposition y Content-Type
        });

    } catch (err: any) {
        console.error("API /api/reportes/generar error:", err?.message ?? err);
        return NextResponse.json(
            { success: false, error: err?.message || "Error interno del servidor proxy" },
            { status: 500 }
        );
    }
}

// Métodos no permitidos
export function GET() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }
export function PUT() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }
export function DELETE() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }