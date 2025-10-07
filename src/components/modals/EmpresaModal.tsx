"use client";

import { useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaSet } from "@/types/empresa/empresa";

interface CrearEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback opcional al crear empresa
}

export default function CrearEmpresaModal({
  isOpen,
  onClose,
  onCreated,
}: CrearEmpresaModalProps) {
  const [empresa, setEmpresa] = useState<EmpresaSet>({
    nombre: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null; // no renderiza si no está abierto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {

      await apiFetcher("/api/empresa/empresa", {
        method: "POST",
        body: JSON.stringify(empresa),
      });

      setEmpresa({nombre:''});
      onClose();
      if (onCreated) onCreated();
    } catch (err: any) {
      console.error("Error creando empresa:", err);
      setError(err.message || "Error al crear empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Crear Nueva Empresa</h2>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre de la empresa
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={empresa.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
