"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { ClaseCuentaGet } from "@/types/cuenta/clase_cuenta";
import ButtonInput from "@/components/ButtonInput";
import ButtonDelete from "@/components/ButtonDelete";
import ButtonEdit from "@/components/ButtonEdit";
import TableList from "@/components/TableList";
import FormInput from "@/components/FormInput";
import { usePermisos } from "@/context/PermisoProvider";

export default function ClaseCuentaPage() {
  const { permisos, tienePermiso } = usePermisos();
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<ClaseCuentaGet | null>(
    null
  );
  const [formData, setFormData] = useState({ codigo: "", nombre: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const url = `/api/cuenta_contable/clase_cuenta/?page=${page}`;
  const {
    data: clases,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<ClaseCuentaGet>>(url, apiFetcher);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta clase de cuenta?")) return;
    setDeletingId(id);
    try {
      await apiFetcher(`/api/cuenta_contable/clase_cuenta/${id}/`, {
        method: "DELETE",
      });
      mutate(url);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la clase de cuenta");
    } finally {
      setDeletingId(null);
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
      await apiFetcher(
        `/api/cuenta_contable/clase_cuenta/${showEditModal.id}/`,
        {
          method: "PUT",
          body: JSON.stringify({
            codigo: formData.codigo,
            nombre: formData.nombre,
          }),
        }
      );
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

  // Definir columnas para TableList
  const columns = [
    {
      key: "codigo",
      header: "Código",
    },
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "padre",
      header: "Padre",
      render: (item: ClaseCuentaGet) =>
        item.padre ? `${item.padre.codigo} - ${item.padre.nombre}` : "—",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (item: ClaseCuentaGet) => (
        <div className="flex gap-2">
          {tienePermiso("editar_clase_cuenta") && (
            <ButtonEdit onClick={() => openEditModal(item)}></ButtonEdit>
          )}
          {tienePermiso("eliminar_clase_cuenta") && (
            <ButtonDelete
              onClick={() => handleDelete(item.id)}
              loading={deletingId === item.id}
            ></ButtonDelete>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Gestión de Clases de Cuenta
      </h1>
      {tienePermiso("crear_clase_cuenta") && (
        <ButtonInput
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-block mb-4"
        >
          Añadir Clase de Cuenta
        </ButtonInput>
      )}
      {/* Botón Crear */}

      <TableList
        columns={columns}
        data={clases.results}
        rowKey={(item) => item.id}
        emptyMessage="No se encontraron clases de cuenta registradas."
      />

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
              <FormInput
                label="Código"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                required
                placeholder="Código"
              />
              <FormInput
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Nombre"
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
                disabled={isSubmitting || !formData.codigo || !formData.nombre}
                className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
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
            <h2 className="text-lg font-bold mb-4">Editar Clase de Cuenta</h2>
            <div className="flex flex-col gap-3 mb-4">
              <FormInput
                label="Código"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                required
                placeholder="Código"
              />
              <FormInput
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Nombre"
              />
            </div>
            <div className="flex justify-end gap-2">
              {tienePermiso("eliminar_clase_cuenta") && (
                <button
                  onClick={() => setShowEditModal(null)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              )}
              {tienePermiso("editar_clase_cuenta") && (
                <ButtonInput
                  onClick={handleEdit}
                  disabled={
                    isSubmitting || !formData.codigo || !formData.nombre
                  }
                  className="bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </ButtonInput>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
