"use client";

import { apiFetcher } from "@/lib/apiFetcher";
import { AsientoList } from "@/types/asiento/asiento";
import { PaginatedResponse } from "@/types/paginacion";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import ButtonInput from "@/components/ButtonInput";
import TableList from "@/components/TableList";
import { Eye,Copy } from "lucide-react";
import { usePermisos } from "@/context/PermisoProvider";
import { useRouter } from "next/navigation"; 


export default function AsientoPage() {
  const { permisos, tienePermiso } = usePermisos();
  const [page, setPage] = useState(1);
  const url = `/api/asiento_contable/asiento/?page=${page}`;
  const router = useRouter();
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

  const handleDuplicar = async (id: string) => {
    if (!confirm("¿Deseas generar un borrador a partir de este asiento?")) return;

    try {
      // CORRECCIÓN: Ponemos el ID en la URL
      const res = await apiFetcher<any>(`/api/asiento_contable/asiento/${id}/duplicar/`, {
        method: "POST",
        // CORRECCIÓN CRÍTICA: Enviamos un objeto vacío para que req.json() no falle en el proxy
        body: JSON.stringify({}), 
      });
      
      router.push(`/librovivo/asiento_contable/asiento/${res.id}/editar`);
      
    } catch (e: any) {
      alert("Error al duplicar: " + (e.message || e));
    }
  };
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
          {tienePermiso("crear_asiento") && (
            <button
              onClick={() => handleDuplicar(asiento.id)}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Duplicar Asiento"
            >
              <Copy className="w-5 h-5" />
            </button>
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
