'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  username: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Función para obtener cookie por nombre
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!token) {
      setLoading(false);
      router.push('/login');
      return;
    }

    // Si hay token, verificar si también tenemos datos del usuario
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
      } catch (error) {
        console.error('Error parseando datos del usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
      }
    } else {
      // Si no hay datos del usuario pero sí hay token, crear usuario básico
      setUser({
        id: '1',
        username: 'Usuario',
        email: 'usuario@ejemplo.com'
      });
    }
    
    setLoading(false);
  }, [router]);

  const login = (token: string, userData: User) => {
    // Guardar token y datos del usuario en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Limpiar token y datos del usuario
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    
    // Intentar hacer logout en el backend (opcional)
    fetch(`${apiUrl}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.warn('Error en logout del backend:', error);
      // Continuar con el logout local aunque falle el backend
    });
    
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };
}
