"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { MovimientoGet, MovimientoSet } from "@/types/asiento/movimiento";
import { CuentaList } from "@/types/cuenta/cuenta";
import { AsientoGet } from "@/types/asiento/asiento";

export default function EditAsientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const urlBase = "/api/asiento_contable/asiento/"; // ajustar si tu endpoint es distinto
  const fetchUrl = `${urlBase}/${id}/`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<"BORRADOR" | "APROBADO" | "CANCELADO">(
    "BORRADOR"
  );
  const [fecha, setFecha] = useState("");
  const [movimientos, setMovimientos] = useState<MovimientoGet[]>([]);

  // Cargar cuentas para los selects (primera página)
  const { data: cuentasData } = useSWR<{ results: CuentaList[] }>(
    "/api/cuenta_contable/cuenta/",
    apiFetcher
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetcher<AsientoGet>(fetchUrl);
        if (!mounted) return;
        setDescripcion(data.descripcion || "");
        setEstado((data.estado as any) || "BORRADOR");
        setFecha(data.fecha || "");
        // Normalizar movimientos al formato del formulario
        const movs: MovimientoGet[] = (data.movimientos || []).map(
          (m, idx) => ({
            id: m.id || `tmp-${Date.now()}-${idx}`,
            referencia: (m as any).referencia || "",
            cuenta:
              typeof m.cuenta === "string"
                ? { id: m.cuenta }
                : (m.cuenta as any),
            debe: Number((m as any).debe || 0),
            haber: Number((m as any).haber || 0),
          })
        );
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Error cargando el asiento");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fetchUrl]);

  const addMovimiento = () => {
    setMovimientos((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        referencia: "",
        cuenta: { id: "", codigo: "", nombre: "" ,estado:''},
        debe: 0,
        haber: 0,
      },
    ]);
  };

  const removeMovimiento = (movId: string) => {
    if (movimientos.length <= 2) return; // mantener al menos 2 filas si quieres
    setMovimientos((prev) => prev.filter((m) => m.id !== movId));
  };

  const updateMovimientoField = (
    movId: string,
    field: keyof Omit<MovimientoGet, "id" | "cuenta"> | "cuenta",
    value: any
  ) => {
    setMovimientos((prev) =>
      prev.map((m) =>
        m.id === movId
          ? {
              ...m,
              [field]:
                field === "debe" || field === "haber"
                  ? Number(value) || 0
                  : field === "cuenta"
                  ? {
                      ...(value as {
                        id: string;
                        codigo?: string;
                        nombre?: string;
                      }),
                    }
                  : value,
            }
          : m
      )
    );
  };

  const { totalDebe, totalHaber, isBalanced } = useMemo(() => {
    const debe = movimientos.reduce((s, m) => s + Number(m.debe || 0), 0);
    const haber = movimientos.reduce((s, m) => s + Number(m.haber || 0), 0);
    return {
      totalDebe: debe,
      totalHaber: haber,
      isBalanced: debe === haber && debe > 0,
    };
  }, [movimientos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!descripcion.trim()) {
      setError("La descripción no puede estar vacía");
      return;
    }
    if (!isBalanced) {
      setError("El asiento no está balanceado (total debe !== total haber)");
      return;
    }
    if (movimientos.some((m) => !m.cuenta?.id)) {
      setError("Todas las filas deben tener una cuenta seleccionada");
      return;
    }

    const payload = {
      descripcion: descripcion.trim(),
      estado,
      movimientos: movimientos.map((m) => ({
        referencia: m.referencia,
        cuenta: m.cuenta.id,
        debe: m.debe,
        haber: m.haber,
      })),
    };

    setSaving(true);
    try {
      await apiFetcher(fetchUrl, {
        method: "PUT", // o PATCH según tu API
        body: JSON.stringify(payload),
      });
      // opcional: invalidar caches relacionados con SWR si los usas
      router.push("/librovivo/asiento_contable/asiento"); // ajustar ruta de lista
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error guardando el asiento");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center">Cargando asiento...</div>;
  if (error && !saving)
    return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Editar Asiento #{/*numero*/}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <input
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 p-2"
            >
              <option value="BORRADOR">BORRADOR</option>
              <option value="APROBADO">APROBADO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha (creado)
            </label>
            <input
              value={fecha ? new Date(fecha).toLocaleString() : ""}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-200 p-2 bg-gray-50"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Movimientos</h2>
            <button
              type="button"
              onClick={addMovimiento}
              className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded"
            >
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
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={mov.referencia}
                        onChange={(e) =>
                          updateMovimientoField(
                            mov.id,
                            "referencia",
                            e.target.value
                          )
                        }
                        className="w-full p-1 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-2 border min-w-[220px]">
                      <select
                        value={mov.cuenta.id}
                        onChange={(e) => {
                          const selected = cuentasData?.results.find(
                            (c) => String(c.id) === e.target.value
                          );
                          updateMovimientoField(
                            mov.id,
                            "cuenta",
                            selected
                              ? {
                                  id: selected.id,
                                  codigo: selected.codigo,
                                  nombre: selected.nombre,
                                }
                              : { id: e.target.value }
                          );
                        }}
                        className="w-full p-1 rounded border-gray-300"
                        required
                      >
                        <option value="" disabled>
                          Seleccione una cuenta
                        </option>
                        {cuentasData?.results?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.codigo} - {c.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={mov.debe}
                        onChange={(e) =>
                          updateMovimientoField(mov.id, "debe", e.target.value)
                        }
                        className="w-full p-1 rounded border-gray-300 text-right"
                      />
                    </td>
                    <td className="p-2 border text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={mov.haber}
                        onChange={(e) =>
                          updateMovimientoField(mov.id, "haber", e.target.value)
                        }
                        className="w-full p-1 rounded border-gray-300 text-right"
                      />
                    </td>
                    <td className="p-2 border text-center">
                      {movimientos.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeMovimiento(mov.id)}
                          className="text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <p>
                Total Debe: <span className="font-semibold">{totalDebe}</span>
              </p>
              <p>
                Total Haber: <span className="font-semibold">{totalHaber}</span>
              </p>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full font-bold ${
                  isBalanced
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isBalanced ? "Balanceado" : "Desbalanceado"}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isBalanced || saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
