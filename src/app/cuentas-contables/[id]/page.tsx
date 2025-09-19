"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Link from "next/link";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Interfaces (puedes moverlas a un archivo compartido si las usas en otros lugares)
interface CuentaContable {
  id: string;
  codigo: string;
  nombre: string;
  clase_cuenta: ClaseCuenta;
}
interface ClaseCuenta {
  id: string;
  codigo: string;
  nombre: string;
}

interface Movimiento {
  id: string;
  fecha: string;
  referencia: string;
  debe: number;
  haber: number;
}

export default function CuentaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string; // Obtenemos el ID de la URL
  const { user, loading: authLoading } = useAuth();

  const [cuenta, setCuenta] = useState<CuentaContable | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && !authLoading) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem("token");

          // 1. Obtener detalles de la cuenta
          const cuentaResponse = await fetch(
            `${apiUrl}/cuentas/${id}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!cuentaResponse.ok)
            throw new Error("Error al obtener los detalles de la cuenta.");
          const cuentaData = await cuentaResponse.json();
          setCuenta(cuentaData);
          console.log(cuentaData);
          // 2. Obtener movimientos de la cuenta (asumiendo que este endpoint existe)
          // Si tu endpoint es diferente, ajústalo aquí.

          const movimientosResponse = await fetch(
            `${apiUrl}/cuentas/${id}/movimientos/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!movimientosResponse.ok) {
            // Si no hay movimientos, no lo tratamos como un error fatal
            console.warn(
              "No se pudieron obtener los movimientos o no existen."
            );
            setMovimientos([]);
          } else {
            const movimientosData = await movimientosResponse.json();
            setMovimientos(movimientosData);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando detalles...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!cuenta) {
    return <div className="text-center mt-10">No se encontró la cuenta.</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/cuentas-contables"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            &larr; Volver al Plan de Cuentas
          </Link>

          {/* Detalles de la Cuenta */}
          <div className="bg-white shadow rounded-lg p-6 mb-8 flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {cuenta.codigo} - {cuenta.nombre}
            </h1>
            {cuenta.clase_cuenta?.codigo && cuenta.clase_cuenta?.nombre && (
              <span className="text-lg text-gray-500">
                ({cuenta.clase_cuenta.codigo}) {cuenta.clase_cuenta.nombre}
              </span>
            )}
          </div>

          {/* Lista de Movimientos */}
          <div className="bg-white shadow rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 p-6 border-b">
              Historial de Movimientos
            </h2>
            <ul className="divide-y divide-gray-200">
              {movimientos.length > 0 ? (
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debe
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Haber
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {movimientos.map((mov) => (
                      <tr key={mov.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mov.referencia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(mov.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${mov.debe.toLocaleString("es-CO")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${mov.haber.toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-gray-500">
                  No hay movimientos registrados para esta cuenta.
                </p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
