import { proxyToBackend } from '@/lib/proxyRequest'; // 👈 Corregido el nombre de la importación
import { NextRequest } from "next/server";

// Maneja la solicitud POST para cancelar la suscripción activa
export async function POST(request: NextRequest) {
    // Reenvía la solicitud POST al endpoint de Django: suscripcion/cancelar/
    // El endpoint de Django no requiere un ID en la ruta.
    return proxyToBackend(request, 'suscripcion/cancelar'); 
}