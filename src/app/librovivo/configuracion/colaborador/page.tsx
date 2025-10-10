"use client";

import { useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { UserEmpresaList } from "@/types/empresa/user_empresa";
import useSWR, { mutate } from "swr";
import { PaginatedResponse } from "@/types/paginacion";
import ButtonInput from "@/components/ButtonInput";
import ButtonDelete from "@/components/ButtonDelete";
import TableList from "@/components/TableList";

export default function ColaboradoresPage() {
  const [page, setPage] = useState(1);
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const url = `/api/empresa/user_empresa`;
  const pageUrl = `${url}/?page=${page}`;
  const {
    data: usuarios_empresas,
    error,
    isLoading: loadingUser,
  } = useSWR<PaginatedResponse<UserEmpresaList>>(pageUrl, apiFetcher);

  // Añadir nuevo colaborador
  const handleAgregar = async () => {
    if (!nuevoEmail) return alert("Ingresa un correo válido");
    try {
      setIsLoading(true);
      await apiFetcher(`${url}/`, {
        method: "POST",
        body: JSON.stringify({ email: nuevoEmail }),
      });
      setNuevoEmail("");
      mutate(pageUrl);
    } catch (err) {
      console.error(err);
      alert("Error al agregar colaborador");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar colaborador
  const handleEliminar = async (id: string) => {
    if (!confirm("¿Deseas eliminar este colaborador?")) return;
    try {
      await apiFetcher(`${url}/${id}`, { method: "DELETE" });
      mutate(pageUrl);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar colaborador");
    }
  };

  // Columnas para TableList
  const columns = [
    {
      key: "nombre",
      header: "Nombre",
      render: (c: UserEmpresaList) =>
        `${c.usuario.persona.nombre} ${c.usuario.persona.apellido}`,
    },
    {
      key: "correo",
      header: "Correo",
      render: (c: UserEmpresaList) => c.usuario.email,
    },
    {
      key: "rol",
      header: "Rol",
      render: (c: UserEmpresaList) =>
        c.roles?.length
          ? c.roles.map((r: any) => r.nombre).join(", ")
          : "Colaborador",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (c: UserEmpresaList) => (
        <div className="flex gap-2">
          <ButtonDelete onClick={() => handleEliminar(c.id)}>
            Eliminar
          </ButtonDelete>
          <ButtonInput
            onClick={() => alert(JSON.stringify(c, null, 2))}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Info
          </ButtonInput>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Colaboradores</h1>

      {/* Formulario para agregar colaborador */}
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Correo Gmail"
          value={nuevoEmail}
          onChange={(e) => setNuevoEmail(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <ButtonInput
          onClick={handleAgregar}
          disabled={isLoading || !nuevoEmail}
          className="bg-green-600 text-white"
          loading={isLoading}
        >
          Añadir
        </ButtonInput>
      </div>

      {/* Tabla de colaboradores */}
      <TableList
        columns={columns}
        data={usuarios_empresas?.results || []}
        rowKey={(item) => item.id}
        emptyMessage="No hay colaboradores registrados."
      />
    </div>
  );
}