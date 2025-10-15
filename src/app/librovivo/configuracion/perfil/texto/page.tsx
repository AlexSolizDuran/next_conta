"use client";

import { useState,useEffect } from "react";
import { useEstilo } from "@/context/EstiloContext";
import { apiFetcher } from "@/lib/apiFetcher";

export default function EstiloPage() {
  const { fuente, tamano, setFuente, setTamano } = useEstilo();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserId(user.user_empresa ?? null);
      } catch (err) {
        console.error("Error parseando user desde localStorage:", err);
      }
    }
  }, []);
  const fuentes = [
  { label: "Sans", value: "font-sans" },
  { label: "Serif", value: "font-serif" },
  { label: "Mono", value: "font-mono" },
];

const tamanos = [
  { label: "Extra Pequeño", value: "text-xs" },
  { label: "Pequeño", value: "text-sm" },
  { label: "Mediano", value: "text-md" },
  { label: "Grande", value: "text-lg" },
  { label: "Extra Grande", value: "text-2xl" },
  { label: "Gigante", value: "text-3xl" },
  
];

  const actualizarEstilo = async (nuevaFuente: string, nuevoTamano: string) => {
    setLoading(true);
    try {
      await apiFetcher(`/api/empresa/user_empresa/${userId}/`, {
        method: "PUT",
        body: JSON.stringify({ texto_tipo: nuevaFuente, texto_tamaño: nuevoTamano }),
      });

      setFuente(nuevaFuente);
      setTamano(nuevoTamano);
    } catch (err) {
      console.error("Error al actualizar estilo:", err);
      alert("No se pudo actualizar el estilo.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white shadow-xl rounded-xl">
    {/* Header */}
    <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 pb-2">
      Configuración de Texto
    </h1>

    {/* Font and Size Controls Container - Use a responsive grid for better layout on medium/large screens */}
    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
      {/* Font Selection */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Tipo de letra:</h2>
        <div className="flex flex-wrap gap-2">
          {/* Map through fonts */}
          {fuentes.map((f) => (
            <button
              key={f.value}
              disabled={loading || f.value === fuente}
              onClick={() => actualizarEstilo(f.value, tamano)}
              className={`
                px-4 py-2 text-sm font-medium rounded-full transition duration-150 ease-in-out
                shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50
                ${
                  // Conditional styling for the selected font
                  f.value === fuente
                    ? "bg-primario text-white shadow-primario/50" // Use custom primary color for selected
                    : " text-gray-800 hover:bg-terciario hover:text-white" // Use secondary/tertiary for unselected
                }
                ${loading ? "opacity-60 cursor-not-allowed" : ""} // Dim if loading
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Tamaño:</h2>
        <div className="flex flex-wrap gap-2">
          {/* Map through sizes */}
          {tamanos.map((t) => (
            <button
              key={t.value}
              disabled={loading || t.value === tamano}
              onClick={() => actualizarEstilo(fuente, t.value)}
              className={`
                px-4 py-2 text-sm font-medium rounded-full transition duration-150 ease-in-out
                shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50
                ${
                  // Conditional styling for the selected size
                  t.value === tamano
                    ? "bg-primario text-white shadow-primario/50" // Use custom primary color for selected
                    : " text-gray-800 hover:bg-terciario hover:text-white" // Use secondary/tertiary for unselected
                }
                ${loading ? "opacity-60 cursor-not-allowed" : ""} // Dim if loading
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Preview Text */}
    <div className="mt-8 pt-6 border-t">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Vista Previa:</h2>
      <p
        className={`${fuente} ${tamano} text-gray-900 leading-relaxed p-4 bg-gray-100 rounded-lg border-l-4 border-primario italic transition-all duration-300`}
      >
        Este texto refleja la fuente y tamaño seleccionados. Es una muestra de cómo se verá el contenido con las configuraciones que has elegido.
      </p>
    </div>
  </div>
);
}
