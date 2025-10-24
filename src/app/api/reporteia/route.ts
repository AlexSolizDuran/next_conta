import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.API_URL;

// --- CONFIGURACIÓN DE TOKENS Y ENDPOINTS ---
const ACCESS_TOKEN_COOKIE = "sessionToken";
const REPORT_ENDPOINT = "/ia/generar-reporte/"; // Endpoint de reporte en Django
// Se ha eliminado: REFRESH_TOKEN_COOKIE y REFRESH_ENDPOINT
// ------------------------------------------

// Se ha eliminado la función 'refreshAccessToken'

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
    
    // BACKEND_URL debe estar definida en .env
    return fetch(`${BACKEND_URL}${REPORT_ENDPOINT}`, options);
}

// =========================================================================
// HANDLER PRINCIPAL (POST)
// =========================================================================
export async function POST(request: Request) {
    try {
        if (!BACKEND_URL) {
            throw new Error("BACKEND_URL no está configurada en las variables de entorno.");
        }

        // 1. Obtener el Access Token
        const cookieStore = cookies(); 
        const bodyText = await request.text();

        const accessToken = (await cookieStore).get(ACCESS_TOKEN_COOKIE)?.value;
        
        if (!accessToken) {
            console.warn("API /api/reportes/generar: Token de acceso no encontrado.");
            return NextResponse.json({ success: false, error: "Token de acceso no encontrado o sesión no iniciada." }, { status: 401 });
        }
        
        // 2. Intento de solicitud con el token actual
        let res = await tryRequest(accessToken, bodyText);

        // 3. Manejo de Error 401 (Unauthorized)
        // Ya que se eliminó el flujo de refresh, cualquier 401 indica una sesión inválida.
        if (res.status === 401) {
            console.log("Token expirado/inválido. Retornando 401 directamente.");
            return NextResponse.json(
                { success: false, error: "Token de acceso expirado o inválido. Inicie sesión de nuevo." },
                { status: 401 }
            );
        }
        
        // 4. Manejo Final de la Respuesta (Archivo o JSON)
        
        if (!res.ok) {
            // Manejar otros errores (400, 500, etc.)
            const errorText = await res.text();
            let payload: any;
            try { payload = JSON.parse(errorText); } catch { payload = { raw: errorText }; }
            return NextResponse.json(payload, { status: res.status });
        }

        // Si la respuesta es JSON, la transmitimos
        const contentType = res.headers.get("Content-Type");
        if (contentType?.includes("application/json")) {
            const payload = await res.json();
            return NextResponse.json(payload, { status: res.status });
        }

        // Si es un archivo binario (ej. PDF), transmitimos el cuerpo
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
