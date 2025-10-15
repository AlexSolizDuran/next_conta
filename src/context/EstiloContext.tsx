"use client";

import { apiFetcher } from "@/lib/apiFetcher";
import { UserEmpresaGet } from "@/types/empresa/user_empresa";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";
import { createContext, useContext, useState, useEffect } from "react";
import useSWR from "swr";

interface EstiloContextType {
  fuente: string;
  tamano: string;
  setFuente: (f: string) => void;
  setTamano: (t: string) => void;
}

const EstiloContext = createContext<EstiloContextType | undefined>(undefined);

export const EstiloProvider = ({ children }: { children: React.ReactNode }) => {
  // valores predeterminados antes de cargar desde DB
  const [fuente, setFuente] = useState("");
  const [tamano, setTamano] = useState("");
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState<string | null>(null);

  // ✅ Cargar el id desde localStorage solo en cliente
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user: UserEmpresaData = JSON.parse(userString);
        setId(user.user_empresa);
      }
    } catch (error) {
      console.error("Error al leer user desde localStorage:", error);
    }
  }, []);

  // ✅ Ejecutar SWR solo si ya hay id
  const { data: user_empresa } = useSWR<UserEmpresaGet>(
    id ? `/api/empresa/user_empresa/${id}/` : null,
    apiFetcher,{
        onSuccess: () => setLoading(false),
        onError: () => setLoading(false),
    }
  );

  // ✅ Actualizar los estados cuando llegue la data
  useEffect(() => {
    if (user_empresa) {
      if (user_empresa.texto_tipo) setFuente(user_empresa.texto_tipo);
      if (user_empresa.texto_tamaño) setTamano(user_empresa.texto_tamaño);
    }
    setLoading(false)
  }, [user_empresa]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  return (
    <EstiloContext.Provider value={{ fuente, tamano, setFuente, setTamano }}>
      {children}
    </EstiloContext.Provider>
  );
};

export const useEstilo = () => {
  const context = useContext(EstiloContext);
  if (!context)
    throw new Error("useEstilo debe usarse dentro de un EstiloProvider");
  return context;
};
