// Proxy para Callback Exitoso
import { NextRequest, NextResponse } from "next/server";

const DJANGO_URL = process.env.API_URL;

/**
 * Este handler intercepta la llamada GET que hace Libélula a nuestra DJANGO_PUBLIC_URL/suscripcion/pago_exitoso
 * y la redirige al backend de Django.
 * * Libélula espera una respuesta HTTP 200 OK para confirmar que hemos recibido el pago.
 * * @param req La solicitud GET de Libélula.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    
    // Libélula envía los parámetros, especialmente transaction_id, en el querystring.
    const queryString = searchParams.toString(); 
    
    // El backend de Django NO usa autenticación JWT para esta ruta, 
    // ya que Libélula es un servicio externo.

    const backendCallbackUrl = `${DJANGO_URL}/suscripcion/pago_exitoso?${queryString}`;

    console.log(`[Libélula Callback] Redirigiendo a Django: ${backendCallbackUrl}`);

    try {
        // Hacemos la petición GET al endpoint de Django
        const djangoResponse = await fetch(backendCallbackUrl, {
            method: 'GET',
            // No se necesitan headers de autenticación aquí
            cache: 'no-store' 
        });

        // Leemos la respuesta de Django para devolverla directamente a Libélula
        const responseBody = await djangoResponse.json();
        
        // Devolvemos la respuesta y el estado de Django a Libélula.
        // Si Django devuelve 200 OK, Libélula sabe que el pago fue procesado.
        return NextResponse.json(responseBody, { status: djangoResponse.status });

    } catch (err: any) {
        console.error(`[Libélula Callback Error] Fallo en el proxy: ${err.message}`);
        // Devolvemos un 500 para indicar que no pudimos procesar la notificación
        return NextResponse.json(
            { message: "Error interno al procesar el callback de pago."}, 
            { status: 500 }
        );
    }
}