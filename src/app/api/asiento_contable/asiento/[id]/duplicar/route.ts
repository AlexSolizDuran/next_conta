import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxyRequest"; // Asegúrate de importar proxyRequest, no proxyById

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // En Next.js 15 params es una Promise
) {
  const { id } = await params;

  // Construimos la URL manual para incluir "/duplicar/" al final
  // Nota: Ajusta "asiento_contable" si tu prefijo en Django es diferente (ej. "gestion_asiento/asiento_contable")
  const backendPath = `asiento_contable/${id}/duplicar`;

  return proxyToBackend(req, backendPath);
}