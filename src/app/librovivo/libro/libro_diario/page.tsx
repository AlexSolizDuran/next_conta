"use client";

import { apiFetcher } from "@/lib/apiFetcher";
import { LibroDiario } from "@/types/libro/libroDiario";
import { PaginatedResponse } from "@/types/paginacion";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import TableList from "@/components/TableList";
import { Eye } from "lucide-react";

export default function MovimientosPage() {
  const [page, setPage] = useState(1);
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const [sortField, setSortField] = useState<
    "asiento_contable__numero" | "asiento_contable__fecha"
  >("asiento_contable__numero");
  const [sortAsc, setSortAsc] = useState(true);

  const [fechaInicio, setFechaInicio] = useState("2010-01-01");
  const [fechaFin, setFechaFin] = useState(hoyStr);

  const url =
    `/api/libro/libro_diario/?page=${page}&ordering=${
      sortAsc ? sortField : `-${sortField}`
    }` +
    `${fechaInicio ? `&fecha_inicio=${fechaInicio}` : ""}` +
    `${fechaFin ? `&fecha_fin=${fechaFin}` : ""}`;

  const {
    data: libro_diario,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<LibroDiario>>(url, apiFetcher);

  const toggleSort = (
    field: "asiento_contable__numero" | "asiento_contable__fecha"
  ) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar el Libro Diario: {error.message}
      </div>
    );

  if (!libro_diario)
    return <div className="text-center p-10">Cargando Libro Diario...</div>;

  // Columnas para TableList
  const columns = [
    {
      key: "numero",
      header: (
        <span
          className="cursor-pointer select-none"
          onClick={() => toggleSort("asiento_contable__numero")}
        >
          Numero {sortField === "asiento_contable__numero" ? (sortAsc ? "↑" : "↓") : ""}
        </span>
      ),
      render: (mov: LibroDiario) => mov.asiento?.numero || "—",
    },
    {
      key: "fecha",
      header: (
        <span
          className="cursor-pointer select-none"
          onClick={() => toggleSort("asiento_contable__fecha")}
        >
          Fecha {sortField === "asiento_contable__fecha" ? (sortAsc ? "↑" : "↓") : ""}
        </span>
      ),
      render: (mov: LibroDiario) =>
        mov.asiento?.fecha
          ? new Date(mov.asiento.fecha).toLocaleDateString()
          : "—",
    },
    {
      key: "referencia",
      header: "Referencia",
      render: (mov: LibroDiario) => mov.referencia,
    },
    {
      key: "cuenta",
      header: "Cuenta",
      render: (mov: LibroDiario) =>
        `${mov.cuenta?.codigo || ""} - ${mov.cuenta?.nombre || ""}`,
    },
    {
      key: "debe",
      header: "Debe",
      className: "text-right",
      render: (mov: LibroDiario) => mov.debe,
    },
    {
      key: "haber",
      header: "Haber",
      className: "text-right",
      render: (mov: LibroDiario) => mov.haber,
    },
    {
      key: "detalle",
      header: "Detalle",
      render: (mov: LibroDiario) => (
        <Link
          href={`/librovivo/asiento_contable/asiento/${mov.asiento?.id}`}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <Eye className="w-5 h-5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">Libro Diario</h1>

        {/* Filtros de fecha */}
        <div className="mb-4 flex gap-2 items-end">
          <div>
            <label className="block text-sm font-medium">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <button
            onClick={() => setPage(1)} // resetear página al filtrar
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Filtrar
          </button>
        </div>

        {/* Aquí va tu tabla y resto del código */}
      </div>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
              onClick={() => toggleSort("asiento_contable__numero")}
            >
              Numero{" "}
              {sortField === "asiento_contable__numero"
                ? sortAsc
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th
              className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
              onClick={() => toggleSort("asiento_contable__fecha")}
            >
              Fecha{" "}
              {sortField === "asiento_contable__fecha"
                ? sortAsc
                  ? "↑"
                  : "↓"
                : ""}
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
              Detalle
            </th>
          </tr>
        </thead>
        <tbody>
          {libro_diario.results.map((mov) => (
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
      {!isLoading && libro_diario.results.length === 0 && (
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
          disabled={!libro_diario.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!libro_diario.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}