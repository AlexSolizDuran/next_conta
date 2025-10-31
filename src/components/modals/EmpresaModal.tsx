"use client";

import { useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaSet } from "@/types/empresa/empresa";
import FormInput from "@/components/FormInput";
import ButtonInput from "@/components/ButtonInput";

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

      setEmpresa({ nombre: "" });
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
          <FormInput
            label="Nombre de la empresa"
            name="nombre"
            type="text"
            value={empresa.nombre}
            onChange={handleChange}
            required
            placeholder="Nombre de la empresa"
            error={error && !empresa.nombre ? error : undefined}
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <ButtonInput
              type="submit"
              loading={loading}
              className="px-4 py-2"
            >
              Crear
            </ButtonInput>
          </div>
        </form>
      </div>
    </div>
  );
}