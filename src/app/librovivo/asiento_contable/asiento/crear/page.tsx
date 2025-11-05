"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetcher } from "@/lib/apiFetcher";
import { CuentaList } from "@/types/cuenta/cuenta";
import { AsientoSet } from "@/types/asiento/asiento";
import { MovimientoGet } from "@/types/asiento/movimiento";
import CuentaSearchableSelect from "@/components/buttons/CuentaSearchableSelect";
import { AiPrediction } from "@/types/ia/asiento_prediccion";
import { PaginatedResponse } from "@/types/paginacion";
const EPSILON = 0.0001;

// --- DEFINICIONES DE TIPOS AUXILIARES ---
// Asumo que estos tipos vienen de tus archivos TS
type MovimientoForm = MovimientoGet & { cuenta: CuentaList };

const createInitialFormData = () => ({
  descripcion: "",
  apiError: null as string | null, // Añadido para feedback de API
  movimientos: [
    {
      id: `mov-form-${Date.now()}-1`,
      referencia: "",
      cuenta: { id: "", codigo: "", nombre: "" } as CuentaList,
      debe: 0,
      haber: 0,
    },
    {
      id: `mov-form-${Date.now()}-2`,
      referencia: "",
      cuenta: { id: "", codigo: "", nombre: "" } as CuentaList,
      debe: 0,
      haber: 0,
    },
  ] as MovimientoForm[],
});

export default function CrearAsientoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // Estado para errores de API/Backend

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const url = `/api/asiento_contable/asiento/`;
  const cuentaUrl = "/api/cuenta_contable/cuenta/";
  const aiPredictUrl = "/api/ia/asiento_ia/";
  // --- Lógica del Formulario ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchAccountByCode = useCallback(
    async (code: string): Promise<CuentaList | undefined> => {
      // 1. Llama a la API con el filtro de búsqueda. Esto anula la paginación para la búsqueda precisa.
      const searchUrl = `${cuentaUrl}?search=${code}`;

      try {
        const result = await apiFetcher<PaginatedResponse<CuentaList>>(searchUrl, { method: "GET" });
        // 2. Retorna el primer resultado, que debe ser la cuenta exacta
        return result?.results?.[0];
      } catch (error) {
        console.error(`Error fetching account for code ${code}:`, error);
        return undefined;
      }
    },
    [cuentaUrl]
  );

  const handleMovimientoFieldChange = (
    id: string,
    field: "referencia" | "debe" | "haber",
    value: string
  ) => {
    const updatedMovimientos = formData.movimientos.map((mov) => {
      if (mov.id === id) {
        let numericValue: string | number = value;

        if (field === "debe" || field === "haber") {
          // Permite comas o puntos, luego convierte a punto decimal para JS
          const cleanValue = value.replace(",", ".");
          numericValue = parseFloat(cleanValue) || 0;
        }

        return { ...mov, [field]: numericValue as any };
      }
      return mov;
    });
    setFormData((prev) => ({ ...prev, movimientos: updatedMovimientos }));
  };

  const handleCuentaChange = (
    movimientoId: string,
    selectedCuenta: CuentaList
  ) => {
    // Ya no necesitas buscar la cuenta con .find()
    if (!selectedCuenta) return;

    setFormData((prev) => ({
      ...prev,
      movimientos: prev.movimientos.map((mov) =>
        // Usa el objeto completo recibido
        mov.id === movimientoId ? { ...mov, cuenta: selectedCuenta } : mov
      ),
    }));
  };

  // Uso de useCallback para optimizar el handler de la IA (futuro)
  const addMovimiento = useCallback(() => {
    const newMovimiento: MovimientoForm = {
      id: `mov-form-${Date.now()}`,
      referencia: "",
      cuenta: { id: "", codigo: "", nombre: "", estado: "" } as CuentaList,
      debe: 0,
      haber: 0,
    };
    setFormData((prev) => ({
      ...prev,
      movimientos: [...prev.movimientos, newMovimiento],
    }));
  }, []);

  const removeMovimiento = (id: string) => {
    if (formData.movimientos.length <= 2) {
      // UX: No permitir menos de dos filas (partida doble)
      return;
    }
    setFormData((prev) => ({
      ...prev,
      movimientos: prev.movimientos.filter((mov) => mov.id !== id),
    }));
  };

  // --- Lógica de Balance (Corrección 1: Precisión Decimal) ---
  const { totalDebe, totalHaber, isBalanced } = useMemo(() => {
    const debe = formData.movimientos.reduce((sum, mov) => sum + mov.debe, 0);
    const haber = formData.movimientos.reduce((sum, mov) => sum + mov.haber, 0);

    // Usar Math.abs y EPSILON para la comparación financiera
    const isBalanced = Math.abs(debe - haber) < EPSILON && debe > 0;

    return {
      totalDebe: debe,
      totalHaber: haber,
      isBalanced: isBalanced,
    };
  }, [formData.movimientos]);

  const handleAISuggestion = useCallback(async () => {
    const descripcion = formData.descripcion.trim();
    if (!descripcion || aiLoading) return;



    setAiLoading(true);
    setApiError(null);
    setAiError(null);
    console.log(descripcion)
    try {
      // 1. Llamada al endpoint de predicción de Django
      const response: AiPrediction = await apiFetcher(aiPredictUrl, {
        method: "POST",
        body: JSON.stringify({ descripcion }),
      });

      if (
        response.success &&
        response.debe &&
        response.haber &&
        response.monto
      ) {
        // 2. 💡 LLAMADA ASÍNCRONA PARA OBTENER OBJETOS DE CUENTA COMPLETOS (Bypass Paginación)
        const [cuentaDebe, cuentaHaber] = await Promise.all([
          fetchAccountByCode(response.debe),
          fetchAccountByCode(response.haber),
        ]);

        // Asegúrate de que el monto se parseé correctamente, el backend lo envía como string
        const montoDecimal = parseFloat(response.monto);

        if (cuentaDebe && cuentaHaber) {
          // 3. Reemplaza las filas existentes con la predicción de la IA
          setFormData((prev) => ({
            ...prev,
            movimientos: [
              // Fila 1: DEBE
              {
                id: `mov-ai-debe-${Date.now()}`,
                referencia: `IA Sugiere: ${descripcion}`,
                cuenta: cuentaDebe,
                debe: montoDecimal,
                haber: 0,
              },
              // Fila 2: HABER
              {
                id: `mov-ai-haber-${Date.now() + 1}`,
                referencia: `IA Sugiere: ${descripcion}`,
                cuenta: cuentaHaber,
                debe: 0,
                haber: montoDecimal,
              },
            ],
          }));
        } else {
          setAiError(
            `Error: La IA sugirió códigos (${response.debe}, ${response.haber}) pero no se pudieron encontrar en la base de datos (códigos no válidos o inactivos).`
          );
        }
      } else {
        setAiError(
          response.error ||
            "La IA no pudo predecir el asiento (confianza baja )."
        );
      }
    } catch (err: any) {
      setApiError(
        err.detail || err.message || "Error de conexión con el servicio de IA."
      );
    } finally {
      setAiLoading(false);
    }
  }, [formData.descripcion, aiLoading, aiPredictUrl, fetchAccountByCode]);
  // --- Manejo de Envío (Corrección 3: Feedback de Errores) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); // Limpiar errores previos

    if (!isBalanced || formData.movimientos.some((mov) => !mov.cuenta.id)) {
      setApiError(
        "El asiento debe estar balanceado y todas las cuentas deben estar seleccionadas."
      );
      return;
    }

    setIsSubmitting(true);

    const payload: AsientoSet = {
      descripcion: formData.descripcion,
      movimientos: formData.movimientos.map((mov) => ({
        referencia: mov.referencia,
        debe: mov.debe,
        haber: mov.haber,
        cuenta: mov.cuenta.id as string, // El payload debe enviar el ID
      })),
    };

    try {
      await apiFetcher(url, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/librovivo/asiento_contable/asiento");
    } catch (err: any) {
      // Implementación robusta del error de la API
      const errorMessage =
        err.detail ||
        (err.errors ? JSON.stringify(err.errors) : null) ||
        "Error desconocido al guardar el asiento.";
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderizado (Mejoras Visuales) ---
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-white rounded-t-lg">
          <h1 className="text-3xl font-extrabold text-indigo-800">
            Crear Nuevo Asiento
          </h1>
          <Link
            href="/librovivo/asiento_contable/asiento"
            className="text-sm text-gray-500 hover:text-indigo-600 transition duration-150"
          >
            &larr; Volver a la lista
          </Link>
        </div>

        {apiError && (
          <div className="p-4 bg-red-100 text-red-700 font-medium border-l-4 border-red-500">
            Error de Envío: {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* --- ZONA DE DESCRIPCIÓN INTELIGENTE (Preparación para IA) --- */}
            <div className="border border-gray-300 rounded-lg p-4 bg-yellow-50/50">
              <label
                htmlFor="descripcion"
                className="block text-lg font-bold text-gray-700 mb-2"
              >
                Descripción del Asiento
              </label>
              {/* CAMBIO: Usamos Textarea para descripciones más largas */}
              <textarea
                name="descripcion"
                id="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                rows={3} // Más espacio para el prompt de IA
                placeholder="Ej: Pago de sueldos y aportes sociales del mes de Octubre con transferencia bancaria por 4500.50 BOB"
                className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm resize-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAISuggestion}
                disabled={!formData.descripcion || aiLoading}
                className={`w-40 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  aiLoading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                } disabled:opacity-50`}
                title="Genera el asiento automáticamente con IA"
              >
                {aiLoading ? "Analizando..." : "Sugerir con IA 🧠"}
              </button>{" "}
            </div>

            <div className="flex justify-between items-center pt-4">
              <h4 className="text-xl font-semibold text-gray-800">
                Detalle de Movimientos
              </h4>
              <button
                type="button"
                onClick={addMovimiento}
                className="text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-semibold py-2 px-4 rounded-lg transition duration-150"
              >
                + Añadir Fila
              </button>
            </div>

            {/* --- TABLA DE MOVIMIENTOS --- */}
            <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Referencia
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[300px]">
                      Cuenta (Código - Nombre)
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                      Debe
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                      Haber
                    </th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.movimientos.map((mov, index) => (
                    <tr
                      key={mov.id}
                      className={`relative ${index === 0 ? "z-20" : "z-10"}`}
                    >
                      {/* Referencia */}
                      <td className="p-2">
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
                          placeholder="Glosa/Referencia del Movimiento"
                          className="w-full border-gray-300 rounded-md text-sm p-2"
                        />
                      </td>
                      {/* Cuenta */}
                      <td
                        className="p-2 relative"
                        // 💡 Solución al problema de apilamiento y recorte
                        // zIndex alto para la fila superior, overflow: visible para la celda
                        style={{ overflow: "visible", zIndex: 30 }}
                      >
                        <CuentaSearchableSelect
                          movementId={mov.id}
                          selectedCuenta={mov.cuenta}
                          onSelectCuenta={handleCuentaChange}
                          apiFetcher={apiFetcher}
                        />
                      </td>
                      {/* Debe */}
                      <td className="p-2 w-24">
                        <input
                          type="text"
                          inputMode="decimal"
                          // CORRECCIÓN 2: Permitir decimales
                          value={
                            mov.debe === 0
                              ? ""
                              : mov.debe.toString().replace(".", ",")
                          } // Formato para mostrar coma decimal
                          onChange={(e) =>
                            handleMovimientoFieldChange(
                              mov.id,
                              "debe",
                              e.target.value
                            )
                          }
                          className="w-full border-gray-300 rounded-md text-sm p-2 text-right bg-green-50 focus:bg-green-100"
                        />
                      </td>
                      {/* Haber */}
                      <td className="p-2 w-24">
                        <input
                          type="text"
                          inputMode="decimal"
                          // CORRECCIÓN 2: Permitir decimales
                          value={
                            mov.haber === 0
                              ? ""
                              : mov.haber.toString().replace(".", ",")
                          } // Formato para mostrar coma decimal
                          onChange={(e) =>
                            handleMovimientoFieldChange(
                              mov.id,
                              "haber",
                              e.target.value
                            )
                          }
                          className="w-full border-gray-300 rounded-md text-sm p-2 text-right bg-red-50 focus:bg-red-100"
                        />
                      </td>
                      {/* Eliminar */}
                      <td className="p-2 text-center w-10">
                        {formData.movimientos.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeMovimiento(mov.id)}
                            className="text-red-500 hover:text-red-700 text-lg"
                            title="Eliminar fila"
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

            {/* --- ZONA DE BALANCE Y BOTONES --- */}
            <div className="p-6 border-t bg-white rounded-b-lg flex justify-between items-end">
              {/* Totales y Balance */}
              <div className="text-lg font-medium space-y-1">
                <p>
                  Total Debe:{" "}
                  <span className="text-green-600">
                    {totalDebe.toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </p>
                <p>
                  Total Haber:{" "}
                  <span className="text-red-600">
                    {totalHaber.toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </p>

                {/* Indicador de Balance (Mejora Visual) */}
                <span
                  className={`px-3 py-1 text-base font-bold rounded-full ${
                    isBalanced
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-red-500 text-white shadow-lg animate-pulse"
                  }`}
                >
                  {isBalanced ? "Balanceado" : "Desbalanceado"}
                </span>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/librovivo/asiento_contable/asiento"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-150"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={!isBalanced || isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Asiento"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
