'use client'
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold mb-4">
        Bienvenido a la aplicación de Contabilidad
      </h1>
      <p className="text-gray-700 mb-8">
        Administra tus finanzas de manera eficiente.
      </p>
      <Link href="/login">
        <button className="bg-primario hover:bg-secundario text-white font-bold py-2 px-4 rounded">
          Ir a Login
        </button>
      </Link>
    </div>
  );
}
