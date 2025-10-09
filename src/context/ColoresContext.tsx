// src/context/ColoresContext.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import useSWR from "swr";
import { CustomGet, CustomSet } from "@/types/empresa/custom";
import { apiFetcher } from "@/lib/apiFetcher";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";


interface ColoresContextProps {
  colores: CustomSet | null;
  recargarColores: () => void;
}

const ColoresContext = createContext<ColoresContextProps>({
  colores: null,
  recargarColores: () => {},
});

export const ColoresProvider = ({ children }: { children: ReactNode }) => {
  const [customId, setCustomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Leer localStorage solo cuando esté disponible
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user: UserEmpresaData = JSON.parse(userString);
        const coloresSet = user.custom
        document.documentElement.style.setProperty(
          "--color-primario",
          `${coloresSet.color_primario}`
        );
        document.documentElement.style.setProperty(
          "--color-secundario",
          `${coloresSet.color_secundario}`
        );
        document.documentElement.style.setProperty(
          "--color-terciario",
          `${coloresSet.color_terciario}`
        );
        setCustomId(user.custom.id);
      } catch (e) {
        console.error("Error al parsear user en localStorage", e);
      }
    }
  }, []);

  const { data, mutate } = useSWR<CustomGet>(
    customId ? `/api/empresa/custom/${customId}` : null,
    apiFetcher,
    {
      onSuccess: () => setLoading(false),
      onError: () => setLoading(false),
    }
  );

  // Aplicar los colores al DOM cuando cambien
  useEffect(() => {
    if (!data) return;

    const coloresSet: CustomSet = {
      color_primario: data.color_primario,
      color_secundario: data.color_secundario,
      color_terciario: data.color_terciario,
    };

    console.log("cambiando colores", coloresSet);

    document.documentElement.style.setProperty(
      "--color-primario",
      `${coloresSet.color_primario}`
    );
    document.documentElement.style.setProperty(
      "--color-secundario",
      `${coloresSet.color_secundario}`
    );
    document.documentElement.style.setProperty(
      "--color-terciario",
      `${coloresSet.color_terciario}`
    );
  }, [data]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  return (
    <ColoresContext.Provider
      value={{
        colores: data
          ? {
              color_primario: data.color_primario,
              color_secundario: data.color_secundario,
              color_terciario: data.color_terciario,
            }
          : null,
        recargarColores: () => mutate(),
      }}
    >
      {children}
    </ColoresContext.Provider>
  );
};

export const useColores = () => useContext(ColoresContext);
