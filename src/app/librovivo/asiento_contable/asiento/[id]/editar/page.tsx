"use client";

import { use, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { CuentaList } from "@/types/cuenta/cuenta";
import { AsientoGet } from "@/types/asiento/asiento";
import { MovimientoGet } from "@/types/asiento/movimiento";

export default function EditAsientoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fetchUrl = `/api/asiento_contable/asiento/${id}/`;

  // --- SWR para cargar todo el asiento (incluye movimientos) ---
  const { data: asiento, error, mutate } = useSWR<AsientoGet>(
    id ? fetchUrl : null,
    apiFetcher
  );

  // --- SWR para cargar cuentas ---
  const { data: cuentasData } = useSWR<{ results: CuentaList[] }>(
    "/api/cuenta_contable/cuenta/",
    apiFetcher
  );

  // --- Funciones de actualización local ---
  const updateField = <K extends keyof AsientoGet>(field: K, value: AsientoGet[K]) => {
    if (!asiento) return;
    mutate({ ...asiento, [field]: value }, false);
  };

  const updateMovimiento = (movId: string, field: keyof MovimientoGet | "cuenta", value: any) => {
    if (!asiento) return;
    const nuevosMovs = asiento.movimientos.map((m) =>
      m.id === movId
        ? {
            ...m,
            [field]:
              field === "debe" || field === "haber"
                ? Number(value) || 0
                : field === "cuenta"
                ? { ...value }
                : value,
          }
        : m
    );
    mutate({ ...asiento, movimientos: nuevosMovs }, false);
  };

  const addMovimiento = () => {
    if (!asiento) return;
    const nuevo: MovimientoGet = {
      id: `tmp-${Date.now()}`,
      referencia: "",
      cuenta: { id: "", codigo: "", nombre: "", estado: "" },
      debe: 0,
      haber: 0,
    };
    mutate({ ...asiento, movimientos: [...asiento.movimientos, nuevo] }, false);
  };

  const removeMovimiento = (movId: string) => {
    if (!asiento || asiento.movimientos.length <= 2) return;
    const nuevosMovs = asiento.movimientos.filter((m) => m.id !== movId);
    mutate({ ...asiento, movimientos: nuevosMovs }, false);
  };

  // --- Totales y balance ---
  const { totalDebe, totalHaber, isBalanced } = useMemo(() => {
    if (!asiento) return { totalDebe: 0, totalHaber: 0, isBalanced: false };
    const debe = asiento.movimientos.reduce((s, m) => s + Number(m.debe || 0), 0);
    const haber = asiento.movimientos.reduce((s, m) => s + Number(m.haber || 0), 0);
    return { totalDebe: debe, totalHaber: haber, isBalanced: debe === haber && debe > 0 };
  }, [asiento]);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asiento) return;

    setFormError(null);

    // Validaciones
    if (!asiento.descripcion.trim()) {
      setFormError("La descripción no puede estar vacía");
      return;
    }
    if (!isBalanced) {
      setFormError("El asiento no está balanceado (total debe !== total haber)");
      return;
    }
    if (asiento.movimientos.some((m) => !m.cuenta?.id)) {
      setFormError("Todas las filas deben tener una cuenta seleccionada");
      return;
    }

    const payload = {
      descripcion: asiento.descripcion.trim(),
      estado: asiento.estado,
      movimientos: asiento.movimientos.map((m) => ({
        referencia: m.referencia,
        cuenta: m.cuenta.id,
        debe: m.debe,
        haber: m.haber,
      })),
    };

    setSaving(true);
    try {
      await apiFetcher(fetchUrl, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      router.push("/librovivo/asiento_contable/asiento");
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || "Error guardando el asiento");
    } finally {
      setSaving(false);
    }
  };

  if (!asiento) return <div className="p-6 text-center">Cargando asiento...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Editar Asiento #{asiento.numero}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <input
            value={asiento.descripcion}
            onChange={(e) => updateField("descripcion", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              value={asiento.estado}
              onChange={(e) => updateField("estado", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 p-2"
            >
              <option value="BORRADOR">BORRADOR</option>
              <option value="APROBADO">APROBADO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha (creado)</label>
            <input
              value={asiento.fecha ? new Date(asiento.fecha).toLocaleString() : ""}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-200 p-2 bg-gray-50"
            />
          </div>
        </div>

        {/* Movimientos */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Movimientos</h2>
            <button type="button" onClick={addMovimiento} className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded">
              + Añadir fila
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Referencia</th>
                  <th className="p-2 border">Cuenta</th>
                  <th className="p-2 border text-right">Debe</th>
                  <th className="p-2 border text-right">Haber</th>
                  <th className="p-2 border">Acción</th>
                </tr>
              </thead>
              <tbody>
                {asiento.movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={mov.referencia}
                        onChange={(e) => updateMovimiento(mov.id, "referencia", e.target.value)}
                        className="w-full p-1 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-2 border min-w-[220px]">
                      <select
                        value={mov.cuenta.id}
                        onChange={(e) => {
                          const selected = cuentasData?.results.find((c) => String(c.id) === e.target.value);
                          updateMovimiento(mov.id, "cuenta", selected ? selected : { id: e.target.value });
                        }}
                        className="w-full p-1 rounded border-gray-300"
                        required
                      >
                        <option value="" disabled>Seleccione una cuenta</option>
                        {cuentasData?.results?.map((c) => (
                          <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={mov.debe}
                        onChange={(e) => updateMovimiento(mov.id, "debe", e.target.value)}
                        className="w-full p-1 rounded border-gray-300 text-right"
                      />
                    </td>
                    <td className="p-2 border text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={mov.haber}
                        onChange={(e) => updateMovimiento(mov.id, "haber", e.target.value)}
                        className="w-full p-1 rounded border-gray-300 text-right"
                      />
                    </td>
                    <td className="p-2 border text-center">
                      {asiento.movimientos.length > 2 && (
                        <button type="button" onClick={() => removeMovimiento(mov.id)} className="text-red-600">×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <p>Total Debe: <span className="font-semibold">{totalDebe}</span></p>
              <p>Total Haber: <span className="font-semibold">{totalHaber}</span></p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full font-bold ${isBalanced ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {isBalanced ? "Balanceado" : "Desbalanceado"}
              </span>
            </div>
          </div>
        </div>

        {formError && <div className="text-red-600">{formError}</div>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
          <button type="submit" disabled={!isBalanced || saving} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
