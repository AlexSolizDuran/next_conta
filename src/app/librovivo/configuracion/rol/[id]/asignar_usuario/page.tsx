"use client";
import { use, useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { mutate } from "swr";
import { RolEmpresaGet } from "@/types/empresa/rol_empresa";
import { UserEmpresaList } from "@/types/empresa/user_empresa";
import { PaginatedResponse } from "@/types/paginacion";

export default function RolUsuariosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // 🔹 1️⃣ Obtener datos del rol (con sus usuarios)
  const { data: rol, error: rolError } = useSWR<RolEmpresaGet>(
    `/api/empresa/rol_empresa/${id}/`,
    apiFetcher
  );

  // 🔹 2️⃣ Obtener lista completa de usuarios de la empresa
  const { data: usuarios, error: usersError } = useSWR<
    PaginatedResponse<UserEmpresaList>
  >(`/api/empresa/user_empresa/`, apiFetcher);

  // 🔹 3️⃣ Estado local para manejar los usuarios seleccionados del rol
  const [selected, setSelected] = useState<string[]>([]);

  // 🔹 Cargar usuarios actuales cuando llega el rol
  useEffect(() => {
    if (rol) {
      setSelected(rol.usuarios.map((u) => u.id));
    }
  }, [rol]);

  if (!rol || !usuarios) return <p>Cargando...</p>;

  const handleToggle = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      await apiFetcher(`/api/empresa/rol_empresa/${rol.id}/`, {
        method: "PATCH", // update parcial
        body: JSON.stringify({
          nombre: rol.nombre, // puedes permitir cambiar el nombre si quieres
          usuarios: selected, // array de IDs de UserEmpresa
        }),
      });
      mutate(`/api/empresa/rol_empresa/${rol.id}/`);
      alert("actualizado"); // refresca datos del rol
    } catch (err) {
      console.error("Error al actualizar rol:", err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        Editar usuarios del rol: {rol.nombre}
      </h1>

      <table className="border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Usuario</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Asignado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.results.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.usuario.persona.nombre}</td>
              <td className="border p-2">{u.usuario.email}</td>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(u.id)}
                  onChange={() => handleToggle(u.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4">
        <button
          onClick={() => history.back()}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
        >
          Atrás
        </button>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
