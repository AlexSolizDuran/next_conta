// Puedes poner esta lógica en un nuevo archivo o en la parte superior del archivo principal

import { PaginatedResponse } from "@/types/paginacion";
import { useState } from "react";
import useSWR from "swr";

interface CuentaList {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
}

interface CuentaSearchableSelectProps {
  movementId: string;
  selectedCuenta: CuentaList;
  // La función callback DEBE esperar el objeto CuentaList, NO un string
  onSelectCuenta: (movementId: string, selectedCuenta: CuentaList) => void; // <--- ESTO DEBE SER ASÍ
  apiFetcher: (url: string) => Promise<any>;
}

const CuentaSearchableSelect: React.FC<CuentaSearchableSelectProps> = ({
  movementId,
  selectedCuenta,
  onSelectCuenta,
  apiFetcher,
}) => {
  const [searchTerm, setSearchTerm] = useState(
    selectedCuenta.nombre
      ? `${selectedCuenta.codigo} - ${selectedCuenta.nombre}`
      : ""
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Limpiamos el término de búsqueda para la API
  const cleanSearchTerm = searchTerm.split(" - ")[0].trim();

  // 1. LLAMADA DINÁMICA A LA API CON TÉRMINO DE BÚSQUEDA
  // Usamos el 'search' query parameter que tu API de Django debe soportar
  const cuentaUrl = `/api/cuenta_contable/cuenta/?search=${cleanSearchTerm}`;

  // Solo hacemos la búsqueda si el término es de 3 o más caracteres
  const { data: searchResults, isLoading } = useSWR<
    PaginatedResponse<CuentaList>
  >(cleanSearchTerm.length > 2 ? cuentaUrl : null, apiFetcher);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleSelect = (cuenta: CuentaList) => {
    // El error de TypeScript desaparecerá porque la función 'onSelectCuenta'
    // ahora acepta 'cuenta' (el objeto CuentaList) como su segundo argumento.
    onSelectCuenta(movementId, cuenta);

    setSearchTerm(`${cuenta.codigo} - ${cuenta.nombre}`);
    setIsDropdownOpen(false);
  };

  const handleFocus = () => {
    if (searchTerm.length > 2) {
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    // Retrasar el cierre para permitir el clic en el resultado
    setTimeout(() => setIsDropdownOpen(false), 200);

    // Si se desenfoca y el término no coincide con la cuenta seleccionada, lo limpiamos
    if (
      !selectedCuenta.id ||
      searchTerm !== `${selectedCuenta.codigo} - ${selectedCuenta.nombre}`
    ) {
      // Opcional: limpiar el input si no se seleccionó nada válido
      // setSearchTerm("");
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Buscar por código o nombre..."
        className="w-full border-gray-300 rounded-md text-sm p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        autoComplete="off" // Esencial para prevenir el autocompletado del navegador
      />

      {isDropdownOpen &&
        (cleanSearchTerm.length > 2 ||
          (searchResults &&
            searchResults.results &&
            searchResults.results.length > 0)) && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <li className="p-2 text-gray-500 italic">Cargando...</li>
            ) : searchResults?.results && searchResults.results.length > 0 ? (
              searchResults.results.map((cuenta) => (
                <li
                  key={cuenta.id}
                  onMouseDown={() => handleSelect(cuenta)} // Usamos onMouseDown para capturar el clic antes del onBlur
                  className="p-2 cursor-pointer hover:bg-indigo-50 text-sm truncate"
                >
                  <span className="font-semibold text-gray-800">
                    {cuenta.codigo}
                  </span>{" "}
                  - {cuenta.nombre}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500 italic">
                No se encontraron cuentas.
              </li>
            )}
          </ul>
        )}

      {/* Indicador de cuenta seleccionada si el input está vacío */}
      {selectedCuenta.id && !searchTerm && (
        <p className="absolute bottom-0 right-0 p-1 text-xs text-indigo-600">
          Seleccionada: {selectedCuenta.codigo}
        </p>
      )}
    </div>
  );
};

export default CuentaSearchableSelect;

// Se debe agregar este componente a la estructura del archivo CrearAsientoPage
