"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { CuentaList } from "@/types/cuenta/cuenta";
import { MovimientoGet, MovimientoSet } from "@/types/asiento/movimiento";
import { AsientoSet } from "@/types/asiento/asiento";

const createInitialFormData = () => ({
  descripcion: "",
  movimientos: [
    {
      id: `mov-form-${Date.now()}-1`,
      referencia: "",
      cuenta: { id: "", codigo: "", nombre: "" },
      debe: 0,
      haber: 0,
    },
    {
      id: `mov-form-${Date.now()}-2`,
      referencia: "",
      cuenta: { id: "", codigo: "", nombre: "" },
      debe: 0,
      haber: 0,
    },
  ],
});

export default function CrearAsientoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const url = `/api/asiento_contable/asiento/`;
  const cuentaUrl = "/api/cuenta_contable/cuenta/";
  // --- Carga de Datos ---
  // al cargar datos que harba un modal con la lista delas cuentas
  //como si fuera el lde la vista de listar cuentas
  const {
    data: cuentas,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<CuentaList>>(cuentaUrl, apiFetcher);

  // --- Lógica del Formulario ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMovimientoFieldChange = (
    id: string,
    field: "referencia" | "debe" | "haber",
    value: string
  ) => {
    const updatedMovimientos = formData.movimientos.map((mov) => {
      if (mov.id === id) {
        const numericValue =
          field === "debe" || field === "haber"
            ? parseFloat(value) || 0
            : value;
        return { ...mov, [field]: numericValue as any };
      }
      return mov;
    });
    setFormData((prev) => ({ ...prev, movimientos: updatedMovimientos }));
  };

  const handleCuentaChange = (movimientoId: string, selectedId: string) => {
    // Se compara convirtiendo el ID de la lista a string para evitar problemas de tipo (ej: número vs string)
    const selectedCuenta = cuentas?.results.find(
      (c) => String(c.id) === selectedId
    );
    if (!selectedCuenta) return;
    setFormData((prev) => ({
      ...prev,
      movimientos: prev.movimientos.map((mov) =>
        mov.id === movimientoId ? { ...mov, cuenta: selectedCuenta } : mov
      ),
    }));
  };

  const addMovimiento = () => {
    const newMovimiento: MovimientoGet = {
      id: `mov-form-${Date.now()}`,
      referencia: "",
      cuenta: { id: "", codigo: "", nombre: "", estado: "" },
      debe: 0,
      haber: 0,
    };
    setFormData((prev) => ({
      ...prev,
      movimientos: [...prev.movimientos, newMovimiento],
    }));
  };

  const removeMovimiento = (id: string) => {
    if (formData.movimientos.length <= 2) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      movimientos: prev.movimientos.filter((mov) => mov.id !== id),
    }));
  };

  const { totalDebe, totalHaber, isBalanced } = useMemo(() => {
    const debe = formData.movimientos.reduce((sum, mov) => sum + mov.debe, 0);
    const haber = formData.movimientos.reduce((sum, mov) => sum + mov.haber, 0);
    return {
      totalDebe: debe,
      totalHaber: haber,
      isBalanced: debe === haber && debe > 0,
    };
  }, [formData.movimientos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || formData.movimientos.some((mov) => !mov.cuenta.id)) {
      return;
    }

    setIsSubmitting(true);

    const payload: AsientoSet = {
      descripcion: formData.descripcion,
      movimientos: formData.movimientos.map((mov) => ({
        referencia: mov.referencia,
        debe: mov.debe,
        haber: mov.haber,
        cuenta: mov.cuenta.id,
      })),
    };
    console.log(payload);
    try {
      await apiFetcher(url, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/librovivo/asiento_contable/asiento"); // Redirigir a la lista principal
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderizado ---
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Crear Nuevo Asiento Contable
          </h1>
          <Link
            href="/librovivo/asiento_contable/asiento"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; Volver a la lista
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción del Asiento
              </label>
              <input
                type="text"
                name="descripcion"
                id="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-700">Movimientos</h4>
              <button
                type="button"
                onClick={addMovimiento}
                className="text-sm bg-green-100 text-green-800 hover:bg-green-200 font-semibold py-1 px-3 rounded-md"
              >
                + Añadir Fila
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                {/* ... Encabezados de la tabla ... */}
                <tbody>
                  {formData.movimientos.map((mov) => (
                    <tr key={mov.id}>
                      <td>
                        <input
                          type="text"
                          value={mov.referencia}
                          onChange={(e) =>
                            handleMovimientoFieldChange(
                              mov.id,
                              "referencia",
                              e.target.value
                            )
                          }
                          className="w-full border-gray-300 rounded-md text-sm p-2"
                        />
                      </td>
                      <td className="min-w-[250px]">
                        <select
                          value={mov.cuenta.id}
                          onChange={(e) =>
                            handleCuentaChange(mov.id, e.target.value)
                          }
                          required
                          className="w-full border-gray-300 rounded-md text-sm p-2"
                        >
                          <option value="" disabled>
                            Seleccione una cuenta
                          </option>
                          {isLoading ? (
                            <option>Cargando...</option>
                          ) : (
                            cuentas?.results.map((cuenta) => (
                              <option key={cuenta.id} value={cuenta.id}>
                                {cuenta.codigo} - {cuenta.nombre}
                              </option>
                            ))
                          )}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={mov.debe}
                          onChange={(e) =>
                            handleMovimientoFieldChange(
                              mov.id,
                              "debe",
                              e.target.value
                            )
                          }
                          className="w-full border-gray-300 rounded-md text-sm p-2"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={mov.haber}
                          onChange={(e) =>
                            handleMovimientoFieldChange(
                              mov.id,
                              "haber",
                              e.target.value
                            )
                          }
                          className="w-full border-gray-300 rounded-md text-sm p-2"
                        />
                      </td>
                      <td>
                        {formData.movimientos.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeMovimiento(mov.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            &times;
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-6 border-t bg-gray-50 rounded-b-lg">
            {error && (
              <div className="text-red-600 text-sm text-center mb-4">
                {error}
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p>
                  Total Debe:{" "}
                  <span className="font-bold">
                    ${totalDebe.toLocaleString("es-CO")}
                  </span>
                </p>
                <p>
                  Total Haber:{" "}
                  <span className="font-bold">
                    ${totalHaber.toLocaleString("es-CO")}
                  </span>
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-bold rounded-full ${
                  isBalanced
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isBalanced ? "Balanceado" : "Desbalanceado"}
              </span>
            </div>
            <div className="flex justify-end space-x-3">
              <Link
                href="/asientos-contables"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={!isBalanced || isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Guardando..." : "Guardar Asiento"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
