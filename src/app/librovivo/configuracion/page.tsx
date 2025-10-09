import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-8 text-gray-800">
        Configuración del Sistema
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        <Link
          href="/librovivo/configuracion/colaborador/"
          className="block bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 hover:border-green-400"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Gestion de Colaboradores
          </h2>
          
        </Link>
        <Link
          href="/librovivo/configuracion/perfil/custom"
          className="block bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 hover:border-green-400"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Configuración de Perfil
          </h2>
          <p className="text-sm text-gray-500">
            Administra tu información personal y preferencias de usuario.
          </p>
        </Link>

        <Link
          href="/librovivo/configuracion/rol"
          className="block bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 hover:border-blue-400"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Configuración de Roles
          </h2>
          <p className="text-sm text-gray-500">
            Gestiona los roles y permisos del sistema.
          </p>
        </Link>
      </div>
    </div>
  );
}
