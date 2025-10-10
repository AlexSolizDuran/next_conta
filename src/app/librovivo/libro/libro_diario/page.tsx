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
  const [sortField, setSortField] = useState<
    "asiento_contable__numero" | "asiento_contable__fecha"
  >("asiento_contable__numero");
  const [sortAsc, setSortAsc] = useState(true);

  const url = `/api/libro/libro_diario/?page=${page}&ordering=${
    sortAsc ? sortField : `-${sortField}`
  }`;

  const {
    data: libro_diario,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<LibroDiario>>(url, apiFetcher);

  const toggleSort = (field: "asiento_contable__numero" | "asiento_contable__fecha") => {
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
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Libro Diario
      </h1>

      <TableList
        columns={columns}
        data={libro_diario.results}
        rowKey={(item) => item.id}
        emptyMessage="No se encontraron movimientos registrados."
      />

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