'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { Login } from '@/types/auth/login';
import { apiFetcher } from '@/lib/apiFetcher';
import { User } from '@/types/auth/user';
import FormInput from '@/components/FormInput';
import ButtonInput from '@/components/ButtonInput';

// Site Key de reCAPTCHA - Configurada en .env.local
// Variable: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
const RECAPTCHA_SITE_KEY = "6LdDrfwrAAAAAHjLJe4zzSV2OiC16bU05UkqV8HL";

export default function LoginPage() {
  const [loginData, setLoginData] = useState<Login>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // Callback cuando el usuario completa el reCAPTCHA
  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar reCAPTCHA
    /*
    if (!recaptchaToken) {
      setError('Por favor, completa el reCAPTCHA');
      setLoading(false);
      return;
    }
*/
    try {
      const result = await apiFetcher<User>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          ...loginData,
          recaptcha_token: recaptchaToken,
        }),
      });
      localStorage.setItem("usuario", JSON.stringify(result));
      console.log(result)
      router.push('/perfil/mis_empresas');
    } catch (err: any) {
      console.error('Error en el login:', err);

      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError('Error de conexión. Verifica que el servidor esté funcionando.');
      }

      // Resetear reCAPTCHA en caso de error para que el usuario pueda intentar de nuevo
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken(null);
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

          {/* Widget de reCAPTCHA - Checkbox "No soy un robot" */}
          <div className="flex justify-center">
            {RECAPTCHA_SITE_KEY ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            ) : (
              <div className="text-yellow-600 text-xs text-center">
                reCAPTCHA no configurado (falta NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
              </div>
            )}
          </div>

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