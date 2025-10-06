// src/context/ColoresContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CustomSet, CustomGet } from "@/types/empresa/custom";

interface ColoresContextProps {
  colores: CustomSet | null;
  setColores: (colores: CustomSet) => void;
  cargarColores: () => Promise<void>;
}

const ColoresContext = createContext<ColoresContextProps>({
  colores: null,
  setColores: () => {},
  cargarColores: async () => {},
});

export const ColoresProvider = ({ children }: { children: ReactNode }) => {
  const [colores, setColores] = useState<CustomSet | null>(null);

  const cargarColores = async () => {
    const customId = localStorage.getItem('custom_id');
    if (!customId) return;

    try {
      const res = await fetch(`/api/empresa/custom/${customId}`);
      if (!res.ok) throw new Error('No se pudieron obtener los colores');

      const data: CustomGet = await res.json();

      const coloresSet: CustomSet = {
        color_primario: data.color_primario,
        color_secundario: data.color_secundario,
        color_terciario: data.color_terciario,
      };

      setColores(coloresSet);

      // Actualizar variables CSS dinámicamente
      Object.entries(coloresSet).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });

    } catch (err) {
      console.error('Error cargando colores:', err);
    }
  };

  return (
    <ColoresContext.Provider value={{ colores, setColores, cargarColores }}>
      {children}
    </ColoresContext.Provider>
  );
};

export const useColores = () => useContext(ColoresContext);
