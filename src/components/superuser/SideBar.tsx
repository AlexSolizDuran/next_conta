"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth/user";
import {
  Users as UsersIcon,
  ArrowRightIcon,
  AlbumIcon,
  EuroIcon,
} from "lucide-react";

const CloseIcon = () => <span>✕</span>;


export default function SideBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User>();

 

  const [openMenu, setOpenMenu] = useState(false);
  const router = useRouter();
  const handleLogout = () => {
    fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };
  const adminItems = [
    { name: "Usuarios", href: "/superuser/cliente", icon: <UsersIcon /> },
    { name: "Empresas", href: "/superuser/empresa", icon: <AlbumIcon /> },
    { name: "Plan de Suscripcion", href: "/superuser/plan_suscripcion", icon: <EuroIcon /> },
    
  ]
    
  

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const menuItems = adminItems;

  return (
    <>
      {/* Botón hamburguesa y overlay */}
      {/* Ajustado para que el botón sea un semicírculo en el borde */}
      <div className="md:hidden fixed top-1/4 -translate-y-1/2 ">
        <button
          className="pl-2 pr-1 py-4 bg-secundario text-white rounded-r-full shadow-lg focus:outline-none"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <ArrowRightIcon />
        </button>
        {open && (
          <div
            className="fixed inset-0 bg-opacity-50 z-10"
            onClick={() => setOpen(false)}
          ></div>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 w-64 h-screen bg-primario shadow-lg z-20 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 md:flex md:flex-col md:h-screen overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-3   ">
          <h1 className="font-bold text-gray-800 dark:text-white">Menu</h1>
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        </div>
        {user && (
          <div className="relative p-4">
            <div
              onClick={() => setOpenMenu((prev) => !prev)}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-between shadow-lg cursor-pointer hover:bg-white/20 transition"
            >
              <div>
                <p className="font-semibold text-white">
                  {user.username} 
                </p>
                <p className="text-xs text-gray-200">{user.email}</p>
              </div>

              {/* Ícono de menú desplegable */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-5 h-5 text-white transition-transform duration-200 ${
                  openMenu ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </div>

            {/* Menú desplegable */}
            {openMenu && (
              <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                <Link
                  href={"/perfil/mis_empresas"}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm"
                >
                  Mis Empresas
                </Link>
               
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, i) => (
            <div key={i}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center p-2 text-white hover:text-black hover:bg-white rounded-md transition-colors"
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
            </div>
          ))}

        </nav>
      </aside>
    </>
  );
}
