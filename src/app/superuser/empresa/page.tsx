"use client"
import ButtonInput from "@/components/ButtonInput";
import TableList from "@/components/TableList";
import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaList } from "@/types/empresa/empresa";
import { PaginatedResponse } from "@/types/paginacion";
import { useState } from "react";
import useSWR from "swr";


export default function page(){
    const [page,setPage] = useState(1)
    const url = `/api/empresa/empresa?page=${page}`;
    
    const {data:empresas ,error, isLoading} = useSWR<PaginatedResponse<EmpresaList>>(url,apiFetcher);

    if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar los empresas: {error.message}
      </div>
    );

  if (!empresas)
    return <div className="text-center p-10">Cargando empresas...</div>;

  // Definir columnas para TableList
  const columns = [
    {
      key: "id",
      header: "UUID",
    },
    {
      key: "nombre",
      header: "Nombre",
    },
    
    {
      key: "acciones",
      header: "Acciones",
      render: (item: EmpresaList) => (
        <div className="gap-1">
            Button
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Lista de empresas</h1>

      
      <TableList
        columns={columns}
        data={empresas.results}
        rowKey={(item) => item.id}
        emptyMessage="No se encontraron Empresas registradas."
      />

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!empresas.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!empresas.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      
    </div>
  );



}