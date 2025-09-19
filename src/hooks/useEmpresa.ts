'use client';

import { useState, useEffect } from 'react';

interface Empresa {
  id: string;
  nombre: string;
  usuario: string;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const verificarEmpresa = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }
      console.log(token)
      const response = await fetch(`${apiUrl}/empresas/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        
      });
      
      if (response.ok) {
        const empresas = await response.json();
        // Si hay empresas, tomar la primera
        if (empresas && empresas.length > 0) {
          setEmpresa(empresas[0]);
        } else {
          setEmpresa(null);
        }
      } else if (response.status === 404) {
        // No hay empresas
        setEmpresa(null);
      } else {
        setError('Error al verificar empresas');
      }
    } catch (err) {
      console.error('Error verificando empresa:', err);
      setError('Error de conexión al verificar empresa');
    } finally {
      setLoading(false);
    }
  };

  const crearEmpresa = async (nombre: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${apiUrl}/empresas/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
      });

      if (response.ok) {
        const nuevaEmpresa = await response.json();
        setEmpresa(nuevaEmpresa);
        return nuevaEmpresa;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear empresa');
      }
    } catch (err) {
      console.error('Error creando empresa:', err);
      throw err;
    }
  };

  useEffect(() => {
    verificarEmpresa();
  }, []);

  return {
    empresa,
    loading,
    error,
    verificarEmpresa,
    crearEmpresa,
    tieneEmpresa: !!empresa,
  };
}
