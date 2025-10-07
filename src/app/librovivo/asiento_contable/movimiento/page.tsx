"use client";

import { apiFetcher } from "@/lib/apiFetcher";
import { MovimientoList } from "@/types/asiento/movimiento";
import { PaginatedResponse } from "@/types/paginacion";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

export default function MovimientosPage() {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<
    "asiento_contable__numero" | "asiento_contable__fecha"
  >("asiento_contable__numero");
  const [sortAsc, setSortAsc] = useState(true);

  const url = `/api/asiento_contable/movimiento/?page=${page}&ordering=${
    sortAsc ? sortField : `-${sortField}`
  }`;

  const {
    data: movimientos,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<MovimientoList>>(url, apiFetcher);

  const toggleSort = (field: "asiento_contable__numero" | "asiento_contable__fecha") => {
    if (sortField === field) {
      setSortAsc(!sortAsc); // si ya es el mismo campo, invertir
    } else {
      setSortField(field);
      setSortAsc(true); // si es un campo nuevo, iniciar ascendente
    }
  };
  if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar los movimientos: {error.message}
      </div>
    );

  if (!movimientos)
    return <div className="text-center p-10">Cargando movimientos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Gestión de Movimientos
      </h1>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
              onClick={() => toggleSort("asiento_contable__numero")}
            >
              Numero {sortField === "asiento_contable__numero" ? (sortAsc ? "↑" : "↓") : ""}
            </th>
            <th
              className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
              onClick={() => toggleSort("asiento_contable__fecha")}
            >
              Fecha {sortField === "asiento_contable__fecha" ? (sortAsc ? "↑" : "↓") : ""}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Referencia
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Cuenta
            </th>
            <th className="border border-gray-300 px-4 py-2 text-right">
              Debe
            </th>
            <th className="border border-gray-300 px-4 py-2 text-right">
              Haber
            </th>

            <th className="border border-gray-300 px-4 py-2 text-left">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {movimientos.results.map((mov) => (
            <tr key={mov.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                {mov.asiento?.numero || "—"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {mov.asiento?.fecha
                  ? new Date(mov.asiento.fecha).toLocaleDateString()
                  : "—"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {mov.referencia}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {mov.cuenta?.codigo} - {mov.cuenta?.nombre}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {mov.debe}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {mov.haber}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  href={`/librovivo/asiento_contable/asiento/${mov.asiento?.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mensaje si no hay resultados */}
      {!isLoading && movimientos.results.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            No se encontraron movimientos registrados.
          </p>
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!movimientos.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!movimientos.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
