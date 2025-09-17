'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CuentaContable {
  id: string;
  codigo: string;
  nombre: string;
  tipo: 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto';
  saldo: number;
  descripcion: string;
}

export default function CuentasContablesPage() {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([
    {
      id: '1',
      codigo: '1101',
      nombre: 'Caja',
      tipo: 'Activo',
      saldo: 50000,
      descripcion: 'Dinero en efectivo disponible'
    },
    {
      id: '2',
      codigo: '1102',
      nombre: 'Banco',
      tipo: 'Activo',
      saldo: 150000,
      descripcion: 'Cuenta corriente bancaria'
    },
    {
      id: '3',
      codigo: '2101',
      nombre: 'Cuentas por Pagar',
      tipo: 'Pasivo',
      saldo: 25000,
      descripcion: 'Obligaciones con proveedores'
    },
    {
      id: '4',
      codigo: '3101',
      nombre: 'Capital Social',
      tipo: 'Patrimonio',
      saldo: 200000,
      descripcion: 'Aporte de los socios'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'Activo' as CuentaContable['tipo'],
    saldo: 0,
    descripcion: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'saldo' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevaCuenta: CuentaContable = {
      id: Date.now().toString(),
      ...formData
    };
    setCuentas([...cuentas, nuevaCuenta]);
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'Activo',
      saldo: 0,
      descripcion: ''
    });
    setShowModal(false);
  };

  const getTipoColor = (tipo: CuentaContable['tipo']) => {
    switch (tipo) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Pasivo': return 'bg-red-100 text-red-800';
      case 'Patrimonio': return 'bg-blue-100 text-blue-800';
      case 'Ingreso': return 'bg-yellow-100 text-yellow-800';
      case 'Gasto': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 mr-4">
                ← Volver al Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Cuentas Contables
              </h1>
            </div>
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
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {cuenta.nombre}
                            </p>
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(cuenta.tipo)}`}>
                              {cuenta.tipo}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {cuenta.descripcion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${cuenta.saldo.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Saldo actual</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
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
                  <div key={cuenta.id} className="border border-gray-200 rounded-lg p-4">
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(cuenta.tipo)}`}>
                            {cuenta.tipo}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {cuenta.descripcion}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          ${cuenta.saldo.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Saldo actual</p>
                      </div>
                      <div className="flex space-x-3">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Editar
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm font-medium">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pasivo">Pasivo</option>
                    <option value="Patrimonio">Patrimonio</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Gasto">Gasto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Saldo Inicial
                  </label>
                  <input
                    type="number"
                    name="saldo"
                    value={formData.saldo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Descripción de la cuenta"
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
  );
}
