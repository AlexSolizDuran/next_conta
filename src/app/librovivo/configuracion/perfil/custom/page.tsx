"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { CustomGet } from "@/types/empresa/custom";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";
import { useColores } from "@/context/ColoresContext";

export default function CustomColorsPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { recargarColores } = useColores();

  const url = `/api/empresa/custom/?page=${page}`;
  const {
    data: custom,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<CustomGet>>(url, apiFetcher);

  const handleSelect = async (id: string) => {
    setSelectedId(id);

    const userString = localStorage.getItem("user");
    const user: UserEmpresaData = JSON.parse(userString || "");
    const userEmpresaId = user.user_empresa;
    console.log("el id es " , userEmpresaId)
    console.log("el custom es " , id)
    try {
      await apiFetcher(`/api/empresa/user_empresa/${userEmpresaId}/`, {
        method: "PUT",
        body: JSON.stringify({ custom: id }),
      });
      user.custom.id = id;
      localStorage.setItem("user", JSON.stringify(user));

      recargarColores();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert("Error al actualizar el color.");
    }
  };

  if (isLoading) return <div className="p-6">Cargando colores...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error al cargar los colores</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Colores Disponibles</h1>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Primario</th>
            <th className="border border-gray-300 px-4 py-2">Secundario</th>
            <th className="border border-gray-300 px-4 py-2">Terciario</th>
            <th className="border border-gray-300 px-4 py-2">Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {custom?.results.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{item.id}</td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: item.color_primario }}
                  />
                  
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: item.color_secundario }}
                  />
                  
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex items-center  gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: item.color_terciario }}
                  />
                  
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleSelect(item.id)}
                  className={`px-3 py-1 rounded ${
                    selectedId === item.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-200"
                  } hover:bg-green-500 hover:text-white transition`}
                >
                  {selectedId === item.id ? "Seleccionado" : "Seleccionar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!custom?.previous}
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={!custom?.next}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
