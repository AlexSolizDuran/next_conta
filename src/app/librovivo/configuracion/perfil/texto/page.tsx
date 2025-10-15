"use client";

import { useState, useEffect } from "react";
import { useEstilo } from "@/context/EstiloContext";
import { apiFetcher } from "@/lib/apiFetcher";
interface EstiloData {
  texto_tipo: string;
  texto_tamaño: string;
}
export default function EstiloPage() {
  const { fuente, tamano, setFuente, setTamano } = useEstilo();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // Para render solo en cliente

  // Marcas de fuentes y tamaños
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

  // Evitar SSR: marcar que el componente está montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Obtener userId desde localStorage
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

  // Traer estilo del backend si existe, sino usar valores por defecto
  useEffect(() => {
    if (!userId) return;

    const fetchEstilo = async () => {
      try {
        const data = (await apiFetcher(
          `/api/empresa/user_empresa/${userId}/`
        )) as EstiloData;
        setFuente(data.texto_tipo || "font-sans");
        setTamano(data.texto_tamaño || "text-md");
      } catch (err) {
        console.error("No se pudo cargar el estilo:", err);
        // Si falla, mantener valores por defecto
        setFuente("font-sans");
        setTamano("text-md");
      }
    };

    fetchEstilo();
  }, [userId, setFuente, setTamano]);

  // Función para actualizar estilo
  const actualizarEstilo = async (nuevaFuente: string, nuevoTamano: string) => {
    if (!userId) {
      alert("No se pudo determinar el usuario.");
      return;
    }

    setLoading(true);
    try {
      await apiFetcher(`/api/empresa/user_empresa/${userId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto_tipo: nuevaFuente,
          texto_tamaño: nuevoTamano,
        }),
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

  if (!mounted) return null; // Esperar render solo en cliente

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 pb-2">
        Configuración de Texto
      </h1>

      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
        {/* Tipo de letra */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Tipo de letra:
          </h2>
          <div className="flex flex-wrap gap-2">
            {fuentes.map((f) => (
              <button
                key={f.value}
                disabled={loading}
                onClick={() => actualizarEstilo(f.value, tamano)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full transition duration-150 ease-in-out
                  shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50
                  ${
                    f.value === fuente
                      ? "bg-primario text-white shadow-primario/50"
                      : "text-gray-800 hover:bg-terciario hover:text-white"
                  }
                  ${loading ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tamaño */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Tamaño:</h2>
          <div className="flex flex-wrap gap-2">
            {tamanos.map((t) => (
              <button
                key={t.value}
                disabled={loading}
                onClick={() => actualizarEstilo(fuente, t.value)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full transition duration-150 ease-in-out
                  shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50
                  ${
                    t.value === tamano
                      ? "bg-primario text-white shadow-primario/50"
                      : "text-gray-800 hover:bg-terciario hover:text-white"
                  }
                  ${loading ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vista previa */}
      <div className="mt-8 pt-6 border-t">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Vista Previa:
        </h2>
        <p
          className={`${fuente} ${tamano} text-gray-900 leading-relaxed p-4 bg-gray-100 rounded-lg border-l-4 border-primario italic transition-all duration-300`}
        >
          Este texto refleja la fuente y tamaño seleccionados. Es una muestra de
          cómo se verá el contenido con las configuraciones que has elegido.
        </p>
      </div>
    </div>
  );
}
