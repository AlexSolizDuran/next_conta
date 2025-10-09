"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { CuentaList } from "@/types/cuenta/cuenta";
import { ArbolCuenta } from "@/types/cuenta/arbol_cuenta";
import ArbolCuentas from "@/components/ArbolCuenta";

export default function CuentaPage() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const [newCuenta, setNewCuenta] = useState({
    codigo: "",
    nombre: "",
    estado: "ACTIVO",
  });
  const [claseSeleccionada, setClaseSeleccionada] =
    useState<ArbolCuenta | null>(null);

  // URL de SWR con filtro por clase seleccionada
  const url = mostrarTodas
    ? `/api/cuenta_contable/cuenta/?page=${page}` // ignorar filtro
    : `/api/cuenta_contable/cuenta/?page=${page}${
        claseSeleccionada ? `&clase_id=${claseSeleccionada.id}` : ""
      }`;

  const {
    data: cuentas,
    error: cuentaError,
    isLoading: cuentaLoading,
  } = useSWR<PaginatedResponse<CuentaList>>(url, apiFetcher);

  const arbolUrl = "/api/cuenta_contable/clase_cuenta/arbol_cuenta";
  const {
    data: arbol,
    error: arbolError,
    isLoading: arbolLoading,
  } = useSWR<ArbolCuenta[]>(arbolUrl, apiFetcher);
  // --- Manejar cambios del formulario ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewCuenta((prev) => ({ ...prev, [name]: value }));
  };

  // --- Crear nueva cuenta ---
  const handleCreate = async () => {
    try {
      await apiFetcher(`/api/cuenta_contable/cuenta/`, {
        method: "POST",
        body: JSON.stringify(newCuenta),
      });
      mutate(url); // refrescar la lista
      setShowModal(false);
      setNewCuenta({ codigo: "", nombre: "", estado: "ACTIVO" });
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Gestión de Cuentas
      </h1>

      {/* Árbol de clases de cuenta */}
      <div className="mb-4 p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">Filtrar por Clase de Cuenta</h2>
        <button
          className="px-3 py-1 cursor-pointer"
          onClick={() => {
            setMostrarTodas(true);
            setClaseSeleccionada(null);
            setPage(1); // resetear paginación
          }}
        >
          Todos
        </button>
        <ArbolCuentas
          cuentas={arbol || []}
          onSelect={(clase) => {
            setClaseSeleccionada(clase); // aplicamos filtro directamente
            setMostrarTodas(false); // desactivamos "mostrar todas"
            setPage(1); // resetear paginación
          }}
        />

        {claseSeleccionada && (
          <div className="mt-2 text-sm text-gray-700">
            Filtrando por:{" "}
            <strong>
              {claseSeleccionada.nombre} ({claseSeleccionada.codigo})
            </strong>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Añadir Cuenta
      </button>

      {/* Tabla de cuentas */}
      <div className="overflow-x-auto shadow rounded-2xl">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Código
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Nombre
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Estado
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {cuentas?.results.map((cuenta) => (
              <tr key={cuenta.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {cuenta.codigo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {cuenta.nombre}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {cuenta.estado}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <a
                    href={`/librovivo/cuenta_contable/cuenta/${cuenta.id}`}
                    className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!cuentas?.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!cuentas?.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Crear Nueva Cuenta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={newCuenta.codigo}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={newCuenta.nombre}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  name="estado"
                  value={newCuenta.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                  <option value="CERRADO">CERRADO</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={handleCreate}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
