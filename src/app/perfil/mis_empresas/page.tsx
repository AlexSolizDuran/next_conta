"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaList } from "@/types/empresa/empresa";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";
import { LoginEmpresa } from "@/types/empresa/login_empresa";
import CrearEmpresaModal from "@/components/modals/EmpresaModal";
import ButtonInput from "@/components/ButtonInput";

export default function EmpresasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const url = '/api/empresa/mis_empresas'
  
  // Obtener lista de empresas del usuario autenticado
  const {
    data: empresas,
    error: empresasError,
    isLoading: empresasLoading,
  } = useSWR<EmpresaList[]>(url, apiFetcher);

  const handleCreated = () => {
    mutate(url); // SWR vuelve a hacer fetch de /api/empresas
  };

  const handleSelectEmpresa = async (empresaId: string) => {
    setLoadingId(empresaId);
    setError("");

    try {
      const payload: LoginEmpresa = { empresa_id: empresaId };

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
      console.log(result)
      // Redirigir al dashboard
      router.push("/librovivo/dashboard");
    } catch (err: any) {
      console.error("Error seleccionando empresa:", err);
      setError(err.message || "Error de conexión");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <ButtonInput
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 mb-2"
          >
            Nueva Empresa
          </ButtonInput>

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
          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200 border rounded-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empresas.map((emp) => (
                  <tr key={emp.id}>
                    <td className="px-4 py-2">{emp.nombre}</td>
                    <td className="px-4 py-2 text-right">
                      <ButtonInput
                        type="button"
                        onClick={() => handleSelectEmpresa(emp.id)}
                        loading={loadingId === emp.id}
                        className="w-full"
                      >
                        Ingresar
                      </ButtonInput>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {error && (
              <div className="text-red-600 text-sm text-center mt-2">{error}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}