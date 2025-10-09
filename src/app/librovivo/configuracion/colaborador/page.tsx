"use client";

import { useState, useEffect, use } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { UserEmpresaList } from "@/types/empresa/user_empresa";
import useSWR, { mutate } from "swr";
import { PaginatedResponse } from "@/types/paginacion";

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
        <button
          onClick={handleAgregar}
          disabled={isLoading || !nuevoEmail}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Cargando..." : "Añadir"}
        </button>
      </div>

      {/* Tabla de colaboradores */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Nombre
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Correo
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Rol
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios_empresas?.results.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {c.usuario.persona.nombre} {c.usuario.persona.apellido}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {c.usuario.email}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {c.roles?.length
                    ? c.roles.map((r: any) => r.nombre).join(", ")
                    : "Colaborador"}
                </td>
                <td className="border border-gray-300 px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEliminar(c.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                  {/* Si quieres mostrar más info, puedes agregar otro botón aquí */}
                  <button
                    onClick={() => alert(JSON.stringify(c, null, 2))}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Info
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && usuarios_empresas?.results.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No hay colaboradores registrados.
        </div>
      )}
    </div>
  );
}
