"use client"
import ButtonInput from "@/components/ButtonInput";
import TableList from "@/components/TableList";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { UsuarioList } from "@/types/usuario/usuario";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";


export default function page(){
    const [page,setPage] = useState(1)
    const url = `/api/usuario/usuario/?page=${page}`;
    
    const {data:usuarios ,error, isLoading} = useSWR<PaginatedResponse<UsuarioList>>(url,apiFetcher);

    if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar los usuarios: {error.message}
      </div>
    );

  if (!usuarios)
    return <div className="text-center p-10">Cargando usuarios...</div>;

  // Definir columnas para TableList
  const columns = [
    {
      key: "username",
      header: "Nombre Usuario",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "nombre",
      header: "Nombre",
      render: (item: UsuarioList) =>
        item.persona
          ? `${item.persona.nombre} - ${item.persona.apellido}`
          : "—",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (item: UsuarioList) => (
        <Link
          key={item.id}
          href={`/superuser/cliente/${item.id}`}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <Eye className="w-5 h-5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Lista de usuarios</h1>

      <TableList
        columns={columns}
        data={usuarios.results}
        rowKey={(item) => item.id}
        emptyMessage="No se encontraron Usuarios registrados."
      />

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!usuarios.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!usuarios.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      
    </div>
  );



}