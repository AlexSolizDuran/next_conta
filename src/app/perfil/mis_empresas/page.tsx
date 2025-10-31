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
  const url = "/api/empresa/mis_empresas";

  // Obtener lista de empresas del usuario autenticado
  const {
    data: empresas,
    error: empresasError,
    isLoading: empresasLoading,
  } = useSWR<EmpresaList[]>(url, apiFetcher);

  const handleCreated = () => mutate(url);

  const handleSelectEmpresa = async (empresaId: string) => {
    setLoadingId(empresaId);
    setError("");

    try {
      const payload: LoginEmpresa = { empresa_id: empresaId };
      const result = await apiFetcher<UserEmpresaData>("/api/empresa/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("user", JSON.stringify(result));
      router.push("/librovivo/dashboard");
    } catch (err: any) {
      console.error("Error seleccionando empresa:", err);
      setError(err.message || "Error de conexión");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex items-stretch justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
              Selecciona la Empresa
            </h2>
            <ButtonInput
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2"
            >
              Nueva Empresa
            </ButtonInput>
          </div>

          <CrearEmpresaModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onCreated={handleCreated}
          />

          <p className="text-sm text-gray-600 text-center mb-4">
            Escoge la empresa con la que deseas trabajar
          </p>

          {/* Loading / Error */}
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

          {/* Contenedor adaptable */}
          <div className="flex-1 overflow-y-auto">
            {empresas && empresas.length > 0 && (
              <div className="overflow-x-auto">
                {/* Tabla en pantallas grandes */}
                <table className="hidden sm:table w-full divide-y divide-gray-200 border rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Empresa
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {empresas.map((emp) => (
                      <tr key={emp.id}>
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {emp.nombre}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ButtonInput
                            type="button"
                            onClick={() => handleSelectEmpresa(emp.id)}
                            loading={loadingId === emp.id}
                            className="w-full sm:w-auto"
                          >
                            Ingresar
                          </ButtonInput>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tarjetas en móviles */}
                <div className="grid sm:hidden gap-4 mt-4">
                  {empresas.map((emp) => (
                    <div
                      key={emp.id}
                      className="bg-gray-100 p-4 rounded-xl shadow-sm flex flex-col items-start justify-between"
                    >
                      <p className="text-gray-800 font-semibold mb-3">
                        {emp.nombre}
                      </p>
                      <ButtonInput
                        type="button"
                        onClick={() => handleSelectEmpresa(emp.id)}
                        loading={loadingId === emp.id}
                        className="w-full"
                      >
                        Ingresar
                      </ButtonInput>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm text-center mt-3">{error}</div>
            )}

            {!empresasLoading && empresas?.length === 0 && (
              <p className="text-gray-500 text-center mt-6">
                Aún no tienes empresas registradas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
