"use client";

import { use, useState } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import { AsientoGet } from "@/types/asiento/asiento";
import { apiFetcher } from "@/lib/apiFetcher";
import Link from "next/link";

export default function AsientoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const url = `/api/asiento_contable/asiento/${id}/`;

  const {
    data: asiento,
    error,
    isLoading,
  } = useSWR<AsientoGet>(id ? url : null, apiFetcher);

  // --- Eliminar asiento ---
  const handleDelete = async () => {
    if (!confirm("¿Deseas eliminar este asiento?")) return;
    setDeleting(true);
    try {
      await apiFetcher(url, { method: "DELETE" });
      mutate(`/api/asiento_contable/asiento/`); // refresca la lista general
      router.push("/librovivo/asiento_contable/asiento");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el asiento");
      setDeleting(false);
    }
  };

  // --- Estados de carga / error ---
  if (isLoading) return <p className="text-center text-gray-500">Cargando...</p>;
  if (error) return <p className="text-center text-red-500">Error al cargar el asiento</p>;
  if (!asiento) return <p className="text-center text-red-500">Asiento no encontrado</p>;

  // --- Render principal ---
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">
        Asiento #{asiento.numero} — {asiento.estado}
      </h1>

      <div className="flex gap-2 mb-4">
        <Link
          href={`/librovivo/asiento_contable/asiento/${asiento.id}/editar`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Editar
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>

      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Descripción:</span> {asiento.descripcion}
      </p>
      <p className="text-gray-600 mb-6">
        <span className="font-semibold">Fecha:</span>{" "}
        {new Date(asiento.fecha).toLocaleString()}
      </p>

      <h2 className="text-lg font-semibold mb-3">Movimientos</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border-b">Cuenta</th>
              <th className="p-3 border-b text-right">Debe</th>
              <th className="p-3 border-b text-right">Haber</th>
              <th className="p-3 border-b">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {asiento.movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">
                  {m.cuenta.codigo} {m.cuenta.nombre}
                </td>
                <td className="p-3 border-b text-right">{m.debe}</td>
                <td className="p-3 border-b text-right">{m.haber}</td>
                <td className="p-3 border-b">{m.referencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
