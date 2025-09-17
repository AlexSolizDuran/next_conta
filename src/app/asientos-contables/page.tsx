'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AsientoContable {
  id: string;
  fecha: string;
  numero: string;
  descripcion: string;
  partidas: PartidaContable[];
  totalDebe: number;
  totalHaber: number;
}

interface PartidaContable {
  id: string;
  cuenta: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export default function AsientosContablesPage() {
  const [asientos, setAsientos] = useState<AsientoContable[]>([
    {
      id: '1',
      fecha: '2024-01-15',
      numero: 'AS-001',
      descripcion: 'Venta de mercadería al contado',
      totalDebe: 100000,
      totalHaber: 100000,
      partidas: [
        {
          id: '1-1',
          cuenta: '1101 - Caja',
          descripcion: 'Ingreso por venta',
          debe: 100000,
          haber: 0
        },
        {
          id: '1-2',
          cuenta: '4101 - Ventas',
          descripcion: 'Venta de mercadería',
          debe: 0,
          haber: 100000
        }
      ]
    },
    {
      id: '2',
      fecha: '2024-01-16',
      numero: 'AS-002',
      descripcion: 'Compra de mercadería a crédito',
      totalDebe: 75000,
      totalHaber: 75000,
      partidas: [
        {
          id: '2-1',
          cuenta: '1201 - Mercaderías',
          descripcion: 'Compra de inventario',
          debe: 75000,
          haber: 0
        },
        {
          id: '2-2',
          cuenta: '2101 - Cuentas por Pagar',
          descripcion: 'Deuda con proveedor',
          debe: 0,
          haber: 75000
        }
      ]
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    numero: '',
    descripcion: '',
    partidas: [
      { id: '1', cuenta: '', descripcion: '', debe: 0, haber: 0 },
      { id: '2', cuenta: '', descripcion: '', debe: 0, haber: 0 }
    ] as PartidaContable[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePartidaChange = (partidaId: string, field: keyof PartidaContable, value: string | number) => {
    setFormData({
      ...formData,
      partidas: formData.partidas.map(partida =>
        partida.id === partidaId
          ? { ...partida, [field]: value }
          : partida
      )
    });
  };

  const addPartida = () => {
    const newId = (formData.partidas.length + 1).toString();
    setFormData({
      ...formData,
      partidas: [...formData.partidas, { id: newId, cuenta: '', descripcion: '', debe: 0, haber: 0 }]
    });
  };

  const removePartida = (partidaId: string) => {
    if (formData.partidas.length > 2) {
      setFormData({
        ...formData,
        partidas: formData.partidas.filter(partida => partida.id !== partidaId)
      });
    }
  };

  const calculateTotals = () => {
    const totalDebe = formData.partidas.reduce((sum, partida) => sum + (partida.debe || 0), 0);
    const totalHaber = formData.partidas.reduce((sum, partida) => sum + (partida.haber || 0), 0);
    return { totalDebe, totalHaber };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { totalDebe, totalHaber } = calculateTotals();
    
    if (totalDebe !== totalHaber) {
      alert('El asiento debe estar balanceado (Total Debe = Total Haber)');
      return;
    }

    const nuevoAsiento: AsientoContable = {
      id: Date.now().toString(),
      ...formData,
      totalDebe,
      totalHaber
    };

    setAsientos([...asientos, nuevoAsiento]);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      numero: '',
      descripcion: '',
      partidas: [
        { id: '1', cuenta: '', descripcion: '', debe: 0, haber: 0 },
        { id: '2', cuenta: '', descripcion: '', debe: 0, haber: 0 }
      ]
    });
    setShowModal(false);
  };

  const { totalDebe, totalHaber } = calculateTotals();
  const isBalanced = totalDebe === totalHaber;

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
                Asientos Contables
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Nuevo Asiento
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
              className="text-white hover:bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
            >
              Cuentas
            </Link>
            <Link
              href="/asientos-contables"
              className="text-white bg-indigo-700 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
            >
              Asientos
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {asientos.map((asiento) => (
              <div key={asiento.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {asiento.numero} - {asiento.descripcion}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Fecha: {new Date(asiento.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Debe: <span className="font-medium">${asiento.totalDebe.toLocaleString()}</span></p>
                      <p className="text-sm text-gray-500">Total Haber: <span className="font-medium">${asiento.totalHaber.toLocaleString()}</span></p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        asiento.totalDebe === asiento.totalHaber 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {asiento.totalDebe === asiento.totalHaber ? 'Balanceado' : 'Desbalanceado'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  {/* Vista de escritorio */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cuenta
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Debe
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Haber
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {asiento.partidas.map((partida) => (
                          <tr key={partida.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {partida.cuenta}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {partida.descripcion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {partida.debe > 0 ? `$${partida.debe.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {partida.haber > 0 ? `$${partida.haber.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="px-6 py-3 text-sm font-medium text-gray-900">
                            TOTALES
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                            ${asiento.totalDebe.toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                            ${asiento.totalHaber.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Vista móvil */}
                  <div className="md:hidden">
                    {asiento.partidas.map((partida) => (
                      <div key={partida.id} className="border-b border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{partida.cuenta}</p>
                            <p className="text-xs text-gray-500">{partida.descripcion}</p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm">
                            <span className="text-gray-500">Debe: </span>
                            <span className="font-medium text-gray-900">
                              {partida.debe > 0 ? `$${partida.debe.toLocaleString()}` : '-'}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Haber: </span>
                            <span className="font-medium text-gray-900">
                              {partida.haber > 0 ? `$${partida.haber.toLocaleString()}` : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gray-50 p-4 border-t-2 border-gray-300">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-900">TOTALES</div>
                        <div className="text-sm">
                          <div>Debe: <span className="font-medium">${asiento.totalDebe.toLocaleString()}</span></div>
                          <div>Haber: <span className="font-medium">${asiento.totalHaber.toLocaleString()}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal para nuevo asiento */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 md:top-10 mx-auto p-4 md:p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nuevo Asiento Contable
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número
                    </label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="AS-003"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Descripción del asiento"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Partidas del Asiento</h4>
                    <button
                      type="button"
                      onClick={addPartida}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      + Agregar Partida
                    </button>
                  </div>
                  
                  {/* Vista de escritorio para el formulario */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cuenta</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debe</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Haber</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.partidas.map((partida) => (
                          <tr key={partida.id}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={partida.cuenta}
                                onChange={(e) => handlePartidaChange(partida.id, 'cuenta', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="1101 - Caja"
                                required
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={partida.descripcion}
                                onChange={(e) => handlePartidaChange(partida.id, 'descripcion', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Descripción"
                                required
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={partida.debe || ''}
                                onChange={(e) => handlePartidaChange(partida.id, 'debe', parseFloat(e.target.value) || 0)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                                placeholder="0"
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={partida.haber || ''}
                                onChange={(e) => handlePartidaChange(partida.id, 'haber', parseFloat(e.target.value) || 0)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                                placeholder="0"
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formData.partidas.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removePartida(partida.id)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  Eliminar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista móvil para el formulario */}
                  <div className="md:hidden space-y-4">
                    {formData.partidas.map((partida) => (
                      <div key={partida.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cuenta</label>
                            <input
                              type="text"
                              value={partida.cuenta}
                              onChange={(e) => handlePartidaChange(partida.id, 'cuenta', e.target.value)}
                              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              placeholder="1101 - Caja"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                            <input
                              type="text"
                              value={partida.descripcion}
                              onChange={(e) => handlePartidaChange(partida.id, 'descripcion', e.target.value)}
                              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              placeholder="Descripción"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Debe</label>
                              <input
                                type="number"
                                value={partida.debe || ''}
                                onChange={(e) => handlePartidaChange(partida.id, 'debe', parseFloat(e.target.value) || 0)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="0"
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Haber</label>
                              <input
                                type="number"
                                value={partida.haber || ''}
                                onChange={(e) => handlePartidaChange(partida.id, 'haber', parseFloat(e.target.value) || 0)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="0"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          </div>
                          {formData.partidas.length > 2 && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => removePartida(partida.id)}
                                className="w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 px-3 rounded-md text-sm font-medium"
                              >
                                Eliminar Partida
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Debe: <span className="font-medium">${totalDebe.toLocaleString()}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Haber: <span className="font-medium">${totalHaber.toLocaleString()}</span>
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isBalanced 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isBalanced ? 'Balanceado' : 'Desbalanceado'}
                    </div>
                  </div>
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
                    disabled={!isBalanced}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Crear Asiento
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
