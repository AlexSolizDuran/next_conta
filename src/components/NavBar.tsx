"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth/user";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // 🔹 Cargar usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  const menuItem = [
    { name: "Empresas", href: "/perfil/mis_empresas" },
    { name: "Configuración", href: "/perfil/configuracion" },
    { name: "Administrador", href: "/superuser/cliente" },
  ];

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("usuario");
    router.push("/");
  };
  const menuItems = menuItem.filter((item) => {
    // Solo mostrar el link de administrador si el usuario es superuser
    if (item.name === "Administrador") {
      return user?.superuser; // true = mostrar, false = ocultar
    }
    return true; // los demás items siempre se muestran
  });
  return (
    <nav className="bg-primario shadow-md fixed w-full top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* LOGO */}
          <Link
            href="/perfil/mis_empresas"
            className="text-xl font-bold text-white"
          >
            LibroVivo
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex space-x-6 items-center">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-black hover:bg-secundario px-4 py-2 rounded-md transition"
              >
                {item.name}
              </Link>
            ))}

            {/* TARJETA DE USUARIO */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2  text-white hover:bg-secundario hover:text-black px-4 py-2 rounded-md transition"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-xs ">{user.email}</p>
                  </div>
                  <ChevronDown size={18} />
                </button>

                {/* MENÚ DESPLEGABLE */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTÓN MOBILE */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-black hover:bg-terciario px-4 py-2 rounded-md transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* PANEL MOBILE */}
      {menuOpen && (
        <div className="md:hidden bg-primario shadow-md transition-all duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-white hover:bg-secundario hover:text-black transition"
              >
                {item.name}
              </Link>
            ))}

            {user && (
              <div className="border-t border-gray-600 mt-2 pt-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex flex-col items-start w-full text-left text-white px-3 py-2 rounded-md hover:bg-secundario hover:text-black transition"
                >
                  <span className="font-semibold">{user.username}</span>
                  <span className="text-xs ">{user.email}</span>
                </button>

                {userMenuOpen && (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left hover:bg-secundario hover:text-black text-white px-3 py-2 rounded-md mt-1 hover:opacity-90"
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
