"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";

interface PermisosContextType {
  permisos: string[];
  tienePermiso: (permiso: string) => boolean;
}

const PermisosContext = createContext<PermisosContextType>({
  permisos: [],
  tienePermiso: () => false,
});

interface PermisosProviderProps {
  children: ReactNode;
}

export function PermisosProvider({ children }: PermisosProviderProps) {
  const [permisos, setPermisos] = useState<string[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (!data) return;

    const UserEmpresaData: UserEmpresaData = JSON.parse(data);
    const permisosUsuario: string[] = UserEmpresaData.permisos || [];

    setPermisos(permisosUsuario);
  }, []);

  const tienePermiso = (permiso: string) => permisos.includes(permiso);

  return (
    <PermisosContext.Provider value={{ permisos, tienePermiso }}>
      {children}
    </PermisosContext.Provider>
  );
}

export function usePermisos() {
  return useContext(PermisosContext);
}
