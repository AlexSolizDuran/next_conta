"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { RolEmpresaList, RolEmpresaSet } from "@/types/empresa/rol_empresa";
import Link from "next/link";
import ButtonInput from "@/components/ButtonInput";
import ButtonEdit from "@/components/ButtonEdit";
import ButtonDelete from "@/components/ButtonDelete";
import TableList from "@/components/TableList";

export default function rolCuentaPage() {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<RolEmpresaSet | null>(null);
  const [formData, setFormData] = useState({ nombre: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const url = `/api/empresa/rol_empresa`;
  const urlPage = `${url}/?page=${page}`;

  const { data: roles, error, isLoading } = useSWR<PaginatedResponse<RolEmpresaList>>(urlPage, apiFetcher);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta rol de cuenta?")) return;
    try {
      await apiFetcher(`${url}/${id}/`, { method: "DELETE" });
      mutate(urlPage);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el Rol");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await apiFetcher(`${url}/`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setShowCreateModal(false);
      setFormData({ nombre: "" });
      mutate(urlPage);
    } catch (err) {
      console.error(err);
      alert("Error al crear el Rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!showEditModal) return;
    setIsSubmitting(true);
    try {
      await apiFetcher(`${url}/${showEditModal.id}/`, {
        method: "PUT",
        body: JSON.stringify({ nombre: formData.nombre }),
      });
      setShowEditModal(null);
      setFormData({ nombre: "" });
      mutate(urlPage);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el Rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (rol: RolEmpresaSet) => {
    setShowEditModal(rol);
    setFormData({ nombre: rol.nombre });
  };

  if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar los Roles: {error.message}
      </div>
    );

  if (!roles)
    return <div className="text-center p-10">Cargando Roles...</div>;

  // Columnas para TableList
  const columns = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (rol: RolEmpresaList) => (
        <div className="flex gap-2">
          <ButtonEdit onClick={() => openEditModal(rol)}>
            Editar
          </ButtonEdit>
          <ButtonDelete onClick={() => handleDelete(rol.id)}>
            Eliminar
          </ButtonDelete>
          <Link
            href={`/librovivo/configuracion/rol/${rol.id}/asignar_usuario/`}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Asignar rol
          </Link>
          <Link
            href={`/librovivo/configuracion/rol/${rol.id}/asignar_permiso/`}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Asignar permiso
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Gestión de Roles</h1>

      {/* Botón Crear */}
      <ButtonInput
        onClick={() => setShowCreateModal(true)}
        className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Añadir Rol
      </ButtonInput>

      <TableList
        columns={columns}
        data={roles.results}
        rowKey={(item) => item.id}
        emptyMessage="No se encontraron roles de cuenta registradas."
      />

   
      

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!roles.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!roles.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Crear rol </h2>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <ButtonInput
                onClick={handleCreate}
                disabled={isSubmitting || !formData.nombre}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </ButtonInput>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Editar rol de Cuenta</h2>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(null)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <ButtonInput
                onClick={handleEdit}
                disabled={isSubmitting || !formData.nombre}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </ButtonInput>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}