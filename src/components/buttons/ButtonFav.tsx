"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { FavoritoList } from "@/types/empresa/favorito";

export default function Favoritos() {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const pathname = usePathname(); // ruta actual
  const { data: favoritos, mutate } = useSWR<FavoritoList[]>("/api/empresa/favorito/", apiFetcher);

  const guardarFavorito = async () => {
    if (!nombre) return;
    setLoading(true);
    try {
      await apiFetcher("/api/empresa/favorito/", {
        method: "POST",
        body: JSON.stringify({ nombre, ruta: pathname }),
      });
      setNombre("");
      mutate(); // refresca la lista automáticamente
    } catch (err) {
      console.error(err);
      alert("Error al guardar favorito");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await apiFetcher(`/api/empresa/favorito/${id}/`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar favorito");
    }
  };

  if (!favoritos) return <div>Cargando favoritos...</div>;

  return (
    <div className="space-y-4">
      {/* Input para crear favorito */}
      <input
        type="text"
        placeholder="Nombre del favorito"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onBlur={guardarFavorito} // guarda al perder foco
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            guardarFavorito(); // guarda al presionar Enter
          }
        }}
        className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primario"
      />

      {/* Lista de favoritos en scroll */}
      <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 p-2 rounded">
        {favoritos.map((fav) => (
          <div key={fav.id} className="flex justify-between items-center">
            <a
              href={fav.ruta}
              className="flex-1 px-2 py-1 rounded bg-primario text-white hover:bg-secundario transition"
            >
              {fav.nombre}
            </a>
            <button
              onClick={() => handleEliminar(fav.id)}
              className="ml-2 px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
              title="Eliminar favorito"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
