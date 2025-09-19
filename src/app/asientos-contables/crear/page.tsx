'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// --- Interfaces ---
interface Cuenta {
  id: string;
  codigo: string;
  nombre: string;
}

interface MovimientoForm {
  id: string; // ID local para el manejo del formulario
  referencia: string;
  cuenta: Cuenta;
  debe: number;
  haber: number;
}

interface MovimientoPayload {
  referencia: string;
  id_cuenta: string; // Solo se envía el ID
  debe: number;
  haber: number;
}

interface AsientoContablePayload {
  descripcion: string;
  movimientos: MovimientoPayload[];
}

// --- Estado Inicial ---
const createInitialFormData = () => ({
  descripcion: '',
  movimientos: [
    { id: `mov-form-${Date.now()}-1`, referencia: '', cuenta: { id: '', codigo: '', nombre: '' }, debe: 0, haber: 0 },
    { id: `mov-form-${Date.now()}-2`, referencia: '', cuenta: { id: '', codigo: '', nombre: '' }, debe: 0, haber: 0 },
  ]
});

export default function CrearAsientoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createInitialFormData());
  const [error, setError] = useState<string | null>(null);
  const [listaCuentas, setListaCuentas] = useState<Cuenta[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Carga de Datos ---
  const fetchListaCuentas = useCallback(async () => {
    setLoadingCuentas(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/cuentas/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al obtener el plan de cuentas.');
        } else {
          throw new Error(`Error ${response.status}: La sesión puede haber expirado. Por favor, inicie sesión de nuevo.`);
        }
      }
      const data = await response.json();
      setListaCuentas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCuentas(false);
    }
  }, []);

  useEffect(() => {
    fetchListaCuentas();
  }, [fetchListaCuentas]);

  // --- Lógica del Formulario ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMovimientoFieldChange = (id: string, field: 'referencia' | 'debe' | 'haber', value: string) => {
    const updatedMovimientos = formData.movimientos.map(mov => {
      if (mov.id === id) {
        const numericValue = (field === 'debe' || field === 'haber') ? parseFloat(value) || 0 : value;
        return { ...mov, [field]: numericValue as any };
      }
      return mov;
    });
    setFormData(prev => ({ ...prev, movimientos: updatedMovimientos }));
  };

  const handleCuentaChange = (movimientoId: string, selectedId: string) => {
    // Se compara convirtiendo el ID de la lista a string para evitar problemas de tipo (ej: número vs string)
    const selectedCuenta = listaCuentas.find(c => String(c.id) === selectedId);
    if (!selectedCuenta) return;
    setFormData(prev => ({
      ...prev,
      movimientos: prev.movimientos.map(mov => mov.id === movimientoId ? { ...mov, cuenta: selectedCuenta } : mov)
    }));
  };

  const addMovimiento = () => {
    const newMovimiento: MovimientoForm = {
      id: `mov-form-${Date.now()}`,
      referencia: '',
      cuenta: { id: '', codigo: '', nombre: '' },
      debe: 0,
      haber: 0,
    };
    setFormData(prev => ({ ...prev, movimientos: [...prev.movimientos, newMovimiento] }));
  };

  const removeMovimiento = (id: string) => {
    if (formData.movimientos.length <= 2) {
      setError('Un asiento debe tener al menos dos movimientos.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setFormData(prev => ({ ...prev, movimientos: prev.movimientos.filter(mov => mov.id !== id) }));
  };

  const { totalDebe, totalHaber, isBalanced } = useMemo(() => {
    const debe = formData.movimientos.reduce((sum, mov) => sum + mov.debe, 0);
    const haber = formData.movimientos.reduce((sum, mov) => sum + mov.haber, 0);
    return { totalDebe: debe, totalHaber: haber, isBalanced: debe === haber && debe > 0 };
  }, [formData.movimientos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || formData.movimientos.some(mov => !mov.cuenta.id)) {
      setError('El asiento debe estar balanceado y todas las filas deben tener una cuenta seleccionada.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const payload: AsientoContablePayload = {
      descripcion: formData.descripcion,
      movimientos: formData.movimientos.map(mov => ({
        referencia: mov.referencia,
        debe: mov.debe,
        haber: mov.haber,
        id_cuenta: mov.cuenta.id,
      })),
    };
    console.log(payload)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/asiento_contable/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          // Loguear el error completo del backend para depuración
          console.error("Error del backend al crear asiento:", errorData);

          // Intentar dar un mensaje de error más específico
          let errorMessage = errorData.detail || 'No se pudo crear el asiento.';
          if (typeof errorData === 'object' && errorData !== null && !errorData.detail) {
            // Intentar parsear errores de validación de Django REST Framework
            const messages = Object.entries(errorData).map(([key, value]) => {
              if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
              return `${key}: ${String(value)}`;
            });
            if (messages.length > 0) {
              errorMessage = messages.join('; ');
            }
          }
          throw new Error(errorMessage);
        } else {
          // Es probable que sea HTML, lo que indica una redirección de autenticación o un error 500.
          throw new Error(`Error ${response.status}: La sesión puede haber expirado. Intente iniciar sesión de nuevo.`);
        }
      }
      router.push('/asientos-contables'); // Redirigir a la lista principal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderizado ---
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Asiento Contable</h1>
            <Link href="/asientos-contables" className="text-sm text-indigo-600 hover:text-indigo-800">
              &larr; Volver a la lista
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción del Asiento</label>
                <input type="text" name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-700">Movimientos</h4>
                <button type="button" onClick={addMovimiento} className="text-sm bg-green-100 text-green-800 hover:bg-green-200 font-semibold py-1 px-3 rounded-md">+ Añadir Fila</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  {/* ... Encabezados de la tabla ... */}
                  <tbody>
                    {formData.movimientos.map((mov) => (
                      <tr key={mov.id}>
                        <td><input type="text" value={mov.referencia} onChange={e => handleMovimientoFieldChange(mov.id, 'referencia', e.target.value)} className="w-full border-gray-300 rounded-md text-sm p-2" /></td>
                        <td className="min-w-[250px]">
                          <select value={mov.cuenta.id} onChange={e => handleCuentaChange(mov.id, e.target.value)} required className="w-full border-gray-300 rounded-md text-sm p-2">
                            <option value="" disabled>Seleccione una cuenta</option>
                            {loadingCuentas ? <option>Cargando...</option> : listaCuentas.map(cuenta => (
                              <option key={cuenta.id} value={cuenta.id}>{cuenta.codigo} - {cuenta.nombre}</option>
                            ))}
                          </select>
                        </td>
                        <td><input type="number" step="0.01" value={mov.debe} onChange={e => handleMovimientoFieldChange(mov.id, 'debe', e.target.value)} className="w-full border-gray-300 rounded-md text-sm p-2" /></td>
                        <td><input type="number" step="0.01" value={mov.haber} onChange={e => handleMovimientoFieldChange(mov.id, 'haber', e.target.value)} className="w-full border-gray-300 rounded-md text-sm p-2" /></td>
                        <td>{formData.movimientos.length > 2 && <button type="button" onClick={() => removeMovimiento(mov.id)} className="text-red-500 hover:text-red-700 p-1">&times;</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-lg">
              {error && <div className="text-red-600 text-sm text-center mb-4">{error}</div>}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p>Total Debe: <span className="font-bold">${totalDebe.toLocaleString('es-CO')}</span></p>
                  <p>Total Haber: <span className="font-bold">${totalHaber.toLocaleString('es-CO')}</span></p>
                </div>
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isBalanced ? 'Balanceado' : 'Desbalanceado'}</span>
              </div>
              <div className="flex justify-end space-x-3">
                <Link href="/asientos-contables" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</Link>
                <button type="submit" disabled={!isBalanced || isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Guardando...' : 'Guardar Asiento'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}