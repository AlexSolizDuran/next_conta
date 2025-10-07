"use client";

import { apiFetcher } from "@/lib/apiFetcher";
import { AsientoList } from "@/types/asiento/asiento";
import { PaginatedResponse } from "@/types/paginacion";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

export default function AsientoPage() {
  const [page, setPage] = useState(1);
  const url = `/api/asiento_contable/asiento/?page=${page}`;

  const {
    data: asientos,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<AsientoList>>(url, apiFetcher);

  if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar los Asientos: {error.message}
      </div>
    );

  if (!asientos)
    return <div className="text-center p-10">Cargando asientos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Gestión de Asientos
      </h1>
      <Link
      href={"/librovivo/asiento_contable/asiento/crear"}>
        añadir
      </Link>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Numero</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Fecha
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Descripción
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Estado
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Acciones
            </th>

            {/* agrega más columnas según tu modelo */}
          </tr>
        </thead>
        <tbody>
          {asientos.results.map((asiento) => (
            <tr key={asiento.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{asiento.numero}</td>
              <td className="border border-gray-300 px-4 py-2">
                {asiento.fecha}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {asiento.descripcion}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {asiento.estado}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  key={asiento.id}
                  href={`/librovivo/asiento_contable/asiento/${asiento.id}`}
                  
                  className="flex items-center p-2 text-white hover:text-blue-900 hover:bg-white rounded-md transition-colors"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mensaje si no hay resultados */}
      {!isLoading && asientos.results.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            No se encontraron Asientos registrados.
          </p>
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!asientos.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!asientos.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
