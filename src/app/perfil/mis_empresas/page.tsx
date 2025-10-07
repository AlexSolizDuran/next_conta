"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaList } from "@/types/empresa/empresa";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";
import { LoginEmpresa } from "@/types/empresa/login_empresa";
import CrearEmpresaModal from "@/components/modals/EmpresaModal";

export default function EmpresasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const url = '/api/empresa/mis_empresas'
  
  // Obtener lista de empresas del usuario autenticado
  const {
    data: empresas,
    error: empresasError,
    isLoading: empresasLoading,
  } = useSWR<EmpresaList[]>(url, apiFetcher);

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmpresaId(e.target.value);
  };
  const handleCreated = () => {
    mutate(url); // SWR vuelve a hacer fetch de /api/empresas
  };
  const handleSelectEmpresa = async () => {
    if (!selectedEmpresaId) {
      setError("Selecciona una empresa para continuar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload: LoginEmpresa = { empresa_id: selectedEmpresaId };

      // POST al login de la empresa enviando ID en el body
      const result = await apiFetcher<UserEmpresaData>(
        "/api/empresa/login",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      // Guardar UserEmpresaData completo en localStorage
      localStorage.setItem("user", JSON.stringify(result));

      // Redirigir al dashboard
      router.push("/librovivo/dashboard");
    } catch (err: any) {
      console.error("Error seleccionando empresa:", err);
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Nueva Empresa
          </button>

          <CrearEmpresaModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onCreated={handleCreated}
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Selecciona la Empresa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escoge la empresa con la que deseas trabajar
          </p>
        </div>

        {empresasLoading && (
          <p className="text-sm text-gray-500 text-center">
            Cargando empresas...
          </p>
        )}
        {empresasError && (
          <p className="text-sm text-red-500 text-center">
            Error al cargar empresas
          </p>
        )}

        {empresas && empresas.length > 0 && (
          <div className="mt-4 space-y-4">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={selectedEmpresaId || ""}
              onChange={handleEmpresaChange}
            >
              <option value="" disabled>
                -- Selecciona --
              </option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              onClick={handleSelectEmpresa}
              disabled={!selectedEmpresaId || loading}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Cargando..." : "Entrar a la empresa"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
