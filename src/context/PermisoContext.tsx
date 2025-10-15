"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PermisosContextProps {
  permisos: string[];
  roles: string[];
  hasPermiso: (permiso: string) => boolean;
  hasRol: (rol: string) => boolean;
}

const PermisosContext = createContext<PermisosContextProps>({
  permisos: [],
  roles: [],
  hasPermiso: () => false,
  hasRol: () => false,
});

export const PermisosProvider = ({ children }: { children: ReactNode }) => {
  const [permisos, setPermisos] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    // 🔹 Cargar desde localStorage
    const storedPermisos = localStorage.getItem("permisos");
    const storedRoles = localStorage.getItem("roles");

    if (storedPermisos) setPermisos(JSON.parse(storedPermisos));
    if (storedRoles) setRoles(JSON.parse(storedRoles));
  }, []);

  const hasPermiso = (permiso: string) => permisos.includes(permiso);
  const hasRol = (rol: string) => roles.includes(rol);

  return (
    <PermisosContext.Provider value={{ permisos, roles, hasPermiso, hasRol }}>
      {children}
    </PermisosContext.Provider>
  );
};

export const usePermisos = () => useContext(PermisosContext);
