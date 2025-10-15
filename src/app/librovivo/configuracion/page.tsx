import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className=" font-semibold mb-8 text-gray-800">
        Configuración del Sistema
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        <Link
          href="/librovivo/configuracion/colaborador/"
          className="block bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 hover:border-green-400"
        >
          <h2 className=" font-medium text-gray-800 mb-2">
            Gestion de Colaboradores
          </h2>
          
        </Link>
        <Link
          href="/librovivo/configuracion/perfil/custom"
          className="block bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 hover:border-green-400"
        >
          <h2 className="font-medium text-gray-800 mb-2">
            Configuración de Colores
          </h2>
          
        </Link>
        <Link
          href="/librovivo/configuracion/perfil/texto"
          className="block bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 hover:border-green-400"
        >
          <h2 className="font-medium text-gray-800 mb-2">
            Configuración de Texto
          </h2>
          
        </Link>
        <Link
          href="/librovivo/configuracion/rol"
          className="block bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 hover:border-blue-400"
        >
          <h2 className=" font-medium text-gray-800 mb-2">
            Configuración de Roles
          </h2>
          
        </Link>
      </div>
    </div>
  );
}
