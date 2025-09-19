"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import ProtectedRoute from "../../components/ProtectedRoute";
import ClaseCuentaModal from "@/components/ClaseCuentaModal";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface CuentaContable {
  id: string;
  codigo: string;
  nombre: string;
  tipo?: string;
}
interface ClaseCuenta {
  id: string;
  codigo: string;
  nombre: string;
}
export default function CuentasContablesPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clases, setClases] = useState<ClaseCuenta[]>([]);

  const handleClose = () => setIsModalOpen(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
  });
  //FUNCION PARA OBTENER EL TIPO DE CUENTA
  const getTipoCuenta = (codigo: string): string => {
    const codigoStr = String(codigo);
    switch (codigoStr.charAt(0)) {
      case "1":
        return "Activo";
      case "2":
        return "Pasivo";
      case "3":
        return "Patrimonio";
      case "4":
        return "Ingreso";
      case "5":
        return "Gasto";
      default:
        return "Otros";
    }
  };
  // EVENTO PARA OBTENER LAS CUENTAS
  const fetchCuentas = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/cuentas/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener las cuentas contables.");
      }
      const data = await response.json();
      console.log(data);

      setCuentas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // EVENTO PARA QUE AL ENTRAR A LA PESTAÑA SE OBTENGA LAS CUENTAS
  useEffect(() => {
    if (!authLoading) {
      fetchCuentas();
    }
  }, [authLoading]);

  // EVENTO PARA QUE EL FORMULARIO PUEDA ESCRIBIR
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // EVENTO PARA CREAR CUENTA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/cuentas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "No se pudo crear la cuenta.");
      }
      setShowModal(false);
      setFormData({
        // Resetear el formulario
        codigo: "",
        nombre: "",
      });
      fetchCuentas(); // Recargar la lista de cuentas
    } catch (err: any) {
      setError(err.message);
    }
  };

  // EVENTO PARA BORRAR CUENTA
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cuenta?")) {
      return;
    }

    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/cuentas/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204 || response.ok) {
        // 204 No Content es una respuesta común para DELETE exitoso
        fetchCuentas(); // Recargar la lista de cuentas
      } else {
        throw new Error("No se pudo eliminar la cuenta.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="text-indigo-600 hover:text-indigo-500 mr-4"
                >
                  ← Volver al Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Cuentas Contables
                </h1>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md  "
              >
                Nueva Clase de Cuenta
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Nueva Cuenta
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap space-x-2 md:space-x-8">
              <Link
                href="/dashboard"
                className="text-white hover:bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/cuentas-contables"
                className="text-white bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
              >
                Cuentas
              </Link>
              <Link
                href="/asientos-contables"
                className="text-white hover:bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
              >
                Asientos
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Lista de Cuentas Contables
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Gestiona todas las cuentas del plan contable
                </p>
              </div>
              {/* Vista de escritorio */}
              <div className="hidden md:block">
                <ul className="divide-y divide-gray-200">
                  {cuentas.map((cuenta) => (
                    <li key={cuenta.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100">
                              <span className="text-sm font-medium text-indigo-600">
                                {cuenta.codigo}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cuenta.nombre}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              ({getTipoCuenta(cuenta.codigo)})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex space-x-2">
                            <Link href={`/cuentas-contables/${cuenta.id}`}>
                              <span className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold py-1 px-2 rounded cursor-pointer">
                                Ver Movimientos
                              </span>
                            </Link>
                            <button
                              onClick={() => handleDelete(cuenta.id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vista móvil */}
              <div className="md:hidden">
                <div className="space-y-4">
                  {cuentas.map((cuenta) => (
                    <div
                      key={cuenta.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 mr-3">
                            <span className="text-xs font-medium text-indigo-600">
                              {cuenta.codigo}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cuenta.nombre}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              ({getTipoCuenta(cuenta.codigo)})
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-3">
                          <Link
                            href={`/cuentas-contables/${cuenta.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleDelete(cuenta.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal para nueva cuenta */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 md:top-20 mx-auto p-4 md:p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Nueva Cuenta Contable
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Código
                    </label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ej: 1101"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ej: Caja"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Crear Cuenta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <ClaseCuentaModal isOpen={isModalOpen} onClose={handleClose} />
    </ProtectedRoute>
  );
}
