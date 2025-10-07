"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { ClaseCuentaGet } from "@/types/cuenta/clase_cuenta";

export default function ClaseCuentaPage() {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<ClaseCuentaGet | null>(null);
  const [formData, setFormData] = useState({ codigo: "", nombre: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const url = `/api/cuenta_contable/clase_cuenta/?page=${page}`;
  const { data: clases, error, isLoading } = useSWR<PaginatedResponse<ClaseCuentaGet>>(url, apiFetcher);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta clase de cuenta?")) return;
    try {
      await apiFetcher(`/api/cuenta_contable/clase_cuenta/${id}/`, { method: "DELETE" });
      mutate(url);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la clase de cuenta");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await apiFetcher(`/api/cuenta_contable/clase_cuenta/`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setShowCreateModal(false);
      setFormData({ codigo: "", nombre: "" });
      mutate(url);
    } catch (err) {
      console.error(err);
      alert("Error al crear la clase de cuenta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!showEditModal) return;
    setIsSubmitting(true);
    try {
      await apiFetcher(`/api/cuenta_contable/clase_cuenta/${showEditModal.id}/`, {
        method: "PUT",
        body: JSON.stringify({ codigo: formData.codigo, nombre: formData.nombre }),
      });
      setShowEditModal(null);
      setFormData({ codigo: "", nombre: "" });
      mutate(url);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la clase de cuenta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (clase: ClaseCuentaGet) => {
    setShowEditModal(clase);
    setFormData({ codigo: clase.codigo, nombre: clase.nombre });
  };

  if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error al cargar las clases de cuenta: {error.message}
      </div>
    );

  if (!clases)
    return <div className="text-center p-10">Cargando clases de cuenta...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Gestión de Clases de Cuenta</h1>

      {/* Botón Crear */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Añadir Clase de Cuenta
      </button>

      <div className="overflow-x-auto shadow rounded-2xl">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Código</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Padre</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clases.results.map((clase) => (
              <tr key={clase.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{clase.codigo}</td>
                <td className="border border-gray-300 px-4 py-2">{clase.nombre}</td>
                <td className="border border-gray-300 px-4 py-2">{clase.padre?.nombre || "—"}</td>
                <td className="border border-gray-300 px-4 py-2 flex gap-2">
                  <button
                    onClick={() => openEditModal(clase)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(clase.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensaje si no hay resultados */}
      {!isLoading && clases.results.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">No se encontraron clases de cuenta registradas.</p>
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!clases.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!clases.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Crear Clase de Cuenta</h2>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                name="codigo"
                placeholder="Código"
                value={formData.codigo}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
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
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !formData.codigo || !formData.nombre}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Editar Clase de Cuenta</h2>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                name="codigo"
                placeholder="Código"
                value={formData.codigo}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
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
              <button
                onClick={handleEdit}
                disabled={isSubmitting || !formData.codigo || !formData.nombre}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
