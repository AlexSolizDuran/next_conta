'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Login } from '@/types/auth/login';
import { apiFetcher } from '@/lib/apiFetcher';
import { User } from '@/types/auth/user';
import FormInput from '@/components/FormInput';
import ButtonInput from '@/components/ButtonInput';

export default function LoginPage() {
  const [loginData, setLoginData] = useState<Login>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiFetcher<User>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      localStorage.setItem("user", JSON.stringify(result));

      router.push('/perfil/mis_empresas');
    } catch (err: any) {
      console.error('Error en el login:', err);

      if (err.message) {
        setError(err.message);
      } else {
        setError('Error de conexión. Verifica que el servidor esté funcionando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu sistema de contabilidad
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <FormInput
              label="Usuario"
              name="username"
              type="text"
              value={loginData.username}
              onChange={handleChange}
              placeholder="Usuario"
              required
              error={error && !loginData.username ? error : undefined}
            />
            <FormInput
              label="Contraseña"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
              error={error && !loginData.password ? error : undefined}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <ButtonInput
              type="submit"
              loading={loading}
              className="w-full flex justify-center"
            >
              Iniciar Sesión
            </ButtonInput>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}