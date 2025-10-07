"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { CuentaGet } from "@/types/cuenta/cuenta";

export default function EditCuentaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Obtener la cuenta usando SWR
  const { data: cuenta, error, isLoading, mutate } = useSWR<CuentaGet>(
    id ? `/api/cuenta_contable/cuenta/${id}/` : null,
    apiFetcher
  );

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    estado: "ACTIVO",
  });

  // Actualizar formData cuando se carga la cuenta
  useEffect(() => {
    if (cuenta) {
      setFormData({
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        estado: cuenta.estado,
      });
    }
  }, [cuenta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta) return;

    setSaving(true);
    try {
      await apiFetcher(`/api/cuenta_contable/cuenta/${id}/`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      mutate(); // actualizar cache de SWR
      router.push("/librovivo/cuenta_contable/cuenta");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-center text-gray-500 mt-10">Cargando cuenta...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error al cargar la cuenta</p>;
  if (!cuenta) return <p className="text-center text-red-500 mt-10">Cuenta no encontrada</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">Editar Cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Código</label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="CERRADO">CERRADO</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => router.push("/librovivo/cuenta_contable/cuenta")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
