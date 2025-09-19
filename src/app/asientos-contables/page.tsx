"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import ProtectedRoute from "../../components/ProtectedRoute";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface AsientoContable {
  id: string;
  descripcion: string;
  movimientos: Movimiento[];
}
interface Cuenta {
  id: string;
  codigo: string;
  nombre: string;
}
interface Movimiento {
  id: string;
  cuenta: Cuenta;
  referencia: string;
  debe: number;
  haber: number;
}
export default function AsientosContablesPage() {
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const { user, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // EVENTO PARA OBTENER LAS CUENTAS
  const fetchCuentas = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/asiento_contable/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los asientos contables.");
      }
      const data = await response.json();
      setAsientos(data);
      const reversedData = [...data].reverse(); // copiamos el array y lo invertimos
      setAsientos(reversedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // EVENTO PARA QUE AL ENTRAR A LA PESTAÑA SE OBTENGA LAS CUENTAS
  useEffect(() => {
    if (!authLoading) {
      fetchCuentas();
    }
  }, [authLoading]);

  // EVENTO PARA BORRAR CUENTA
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cuenta?")) {
      return;
    }

    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}/asiento_contable/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204 || response.ok) {
        // 204 No Content es una respuesta común para DELETE exitoso
        fetchCuentas(); // Recargar la lista de cuentas
      } else {
        throw new Error("No se pudo eliminar el asiento contable");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="text-indigo-600 hover:text-indigo-500 mr-4"
                >
                  ← Volver al Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Asientos Contables
                </h1>
              </div>
              <Link
                href="/asientos-contables/crear"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Nuevo Asiento
              </Link>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap space-x-2 md:space-x-8">
              <Link
                href="/dashboard"
                className="text-white hover:bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/cuentas-contables"
                className="text-white hover:bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
              >
                Cuentas
              </Link>
              <Link
                href="/asientos-contables"
                className="text-white bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
              >
                Asientos
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-6">
              {asientos.map((asiento) => (
                <div
                  key={asiento.id}
                  className="bg-white shadow overflow-hidden sm:rounded-lg"
                >
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {asiento.descripcion}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDelete(asiento.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    {/* Vista de escritorio */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Codigo Cuenta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre Cuenta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Descripción
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
                          {asiento.movimientos.map((movimiento) => (
                            <tr key={movimiento.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {movimiento.cuenta.codigo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {movimiento.cuenta.nombre}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {movimiento.referencia}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {movimiento.debe > 0
                                  ? `$${movimiento.debe.toLocaleString()}`
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {movimiento.haber > 0
                                  ? `$${movimiento.haber.toLocaleString()}`
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista móvil */}
                    <div className="md:hidden">
                      {asiento.movimientos.map((movimiento) => (
                        <div
                          key={movimiento.id}
                          className="border-b border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {movimiento.cuenta.codigo} -{" "}
                                {movimiento.cuenta.nombre}
                              </p>
                              <p className="text-xs text-gray-500">
                                {movimiento.referencia}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm">
                              <span className="text-gray-500">Debe: </span>
                              <span className="font-medium text-gray-900">
                                {movimiento.debe > 0
                                  ? `$${movimiento.debe.toLocaleString()}`
                                  : "-"}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Haber: </span>
                              <span className="font-medium text-gray-900">
                                {movimiento.haber > 0
                                  ? `$${movimiento.haber.toLocaleString()}`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
