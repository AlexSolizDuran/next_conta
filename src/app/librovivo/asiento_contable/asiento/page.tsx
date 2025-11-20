"use client";

import { apiFetcher } from "@/lib/apiFetcher";
import { AsientoList } from "@/types/asiento/asiento";
import { PaginatedResponse } from "@/types/paginacion";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import ButtonInput from "@/components/ButtonInput";
import TableList from "@/components/TableList";
import { Eye } from "lucide-react";
import { usePermisos } from "@/context/PermisoProvider";

export default function AsientoPage() {
  const { permisos, tienePermiso } = usePermisos();
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

  // Columnas para TableList
  const columns = [
    {
      key: "numero",
      header: "Numero",
    },
    {
      key: "fecha",
      header: "Fecha",
    },
    {
      key: "descripcion",
      header: "Descripción",
    },
    {
      key: "estado",
      header: "Estado",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (asiento: AsientoList) => (
        <div className="flex gap-2">
          {tienePermiso("ver_asiento") && (
            <Link
              href={`/librovivo/asiento_contable/asiento/${asiento.id}`}
              className="text-blue-600 hover:underline"
            >
              <Eye className="w-5 h-5" />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Gestión de Asientos
      </h1>
      {tienePermiso("crear_asiento") && (
        <Link href={"/librovivo/asiento_contable/asiento/crear"}>
          <ButtonInput className="mb-4 bg-green-600 text-white hover:bg-green-700">
            Añadir
          </ButtonInput>
        </Link>
      )}

      <TableList
        columns={columns}
        data={asientos.results}
        rowKey={(item) => item.id}
        emptyMessage="No se encontraron Asientos registrados."
      />

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
