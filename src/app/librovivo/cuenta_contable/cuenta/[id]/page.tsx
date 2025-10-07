"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { CuentaGet } from "@/types/cuenta/cuenta";
import Link from "next/link";
import { use } from "react";

export default function CuentaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const url = `/api/cuenta_contable/cuenta/${id}/`;

  const { data: cuenta, error, isLoading } = useSWR<CuentaGet>(url, apiFetcher);

  const handleDelete = async () => {
    if (!confirm("¿Deseas eliminar esta cuenta?")) return;

    try {
      const res = await fetch(`/api/cuenta_contable/cuenta/${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar la cuenta");

      router.push("/librovivo/cuenta_contable/cuenta"); // Redirige al listado
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar la cuenta");
    }
  };

  if (isLoading) return <p className="text-center mt-10">Cargando cuenta...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-500">
        Error al cargar la cuenta: {error.message}
      </p>
    );

  if (!cuenta)
    return <p className="text-center mt-10 text-gray-500">Cuenta no encontrada.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Detalle de la Cuenta</h1>
        <Link
          href="/librovivo/cuenta_contable/cuenta"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; Volver a la lista
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Código:</span>
          <span className="text-gray-900">{cuenta.codigo}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Nombre:</span>
          <span className="text-gray-900">{cuenta.nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Estado:</span>
          <span className="text-gray-900">{cuenta.estado}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Clase de Cuenta:</span>
          <span className="text-gray-900">
            {cuenta.clase_cuenta ? `${cuenta.clase_cuenta.codigo} - ${cuenta.clase_cuenta.nombre}` : "—"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Link
          href={`/librovivo/cuenta_contable/cuenta/${cuenta.id}/editar`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Editar
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
