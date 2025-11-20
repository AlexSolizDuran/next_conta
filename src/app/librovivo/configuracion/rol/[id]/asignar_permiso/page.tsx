"use client";

import { useState, useEffect, use } from "react";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { RolEmpresaGet } from "@/types/empresa/rol_empresa";
import { PermisoDetail } from "@/types/empresa/permiso";
import { PaginatedResponse } from "@/types/paginacion";

export default function RolPermisosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // SWR para rol
  const rolUrl = `/api/empresa/rol_empresa/${id}/`;
  const { data: rol, error: rolError } = useSWR<RolEmpresaGet>(
    rolUrl,
    apiFetcher
  );

  // SWR para permisos disponibles
  const permisosUrl = `/api/empresa/permiso/`;
  const { data: permisosPage } = useSWR<PaginatedResponse<PermisoDetail>>(
    permisosUrl,
    apiFetcher
  );
  const permisosDisponibles = permisosPage?.results ?? [];

  // Estados
  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar selectedPermisos cuando rol se carga
  useEffect(() => {
    if (rol && rol.permisos) {
      setSelectedPermisos(rol.permisos.map((p) => p.id));
    }
  }, [rol]);

  if (rolError)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar el rol
      </div>
    );
  if (!rol) return <div className="text-center p-10">Cargando rol...</div>;

  // Manejar toggle de checkbox
  const handlePermisoToggle = (permisoId: string) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  // Guardar cambios (PATCH)
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await fetch(rolUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permisos: selectedPermisos,
        }),
      });
      mutate(rolUrl); // refresca los datos
      alert("actulizado");
    } catch (err) {
      console.error("Error al actualizar permisos:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Editar Permisos del Rol: {rol.nombre}
      </h1>

      <div className="mb-4 overflow-x-auto shadow rounded-2xl">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Seleccionar
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Nombre Permiso
              </th>
            </tr>
          </thead>
          <tbody>
            {permisosDisponibles.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedPermisos.includes(p.id)}
                    onChange={() => handlePermisoToggle(p.id)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {p.descripcion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => history.back()}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
        >
          Atrás
        </button>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
