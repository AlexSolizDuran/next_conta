// src/context/ColoresContext.tsx
'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import useSWR from 'swr';
import { CustomGet, CustomSet } from '@/types/empresa/custom';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ColoresContextProps {
  colores: CustomSet | null;
  recargarColores: () => void;
}

const ColoresContext = createContext<ColoresContextProps>({
  colores: null,
  recargarColores: () => {},
});

export const ColoresProvider = ({ children }: { children: ReactNode }) => {
  const customId = typeof window !== 'undefined' ? localStorage.getItem('custom_id') : null;

  const { data, mutate } = useSWR<CustomGet>(
    customId ? `/api/empresa/custom/${customId}` : null,
    fetcher
  );

  // Aplicar los colores al DOM cuando cambien
  useEffect(() => {
    if (!data) return;

    const coloresSet: CustomSet = {
      color_primario: data.color_primario,
      color_secundario: data.color_secundario,
      color_terciario: data.color_terciario,
    };

    Object.entries(coloresSet).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [data]);

  return (
    <ColoresContext.Provider
      value={{
        colores: data ? {
          color_primario: data.color_primario,
          color_secundario: data.color_secundario,
          color_terciario: data.color_terciario
        } : null,
        recargarColores: () => mutate(),
      }}
    >
      {children}
    </ColoresContext.Provider>
  );
};

export const useColores = () => useContext(ColoresContext);
