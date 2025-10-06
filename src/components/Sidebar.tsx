"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth/user"
import {
  Home as HomeIcon,
  User as UserIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  CreditCard as CreditCardIcon,
  Bell as BellIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
} from "lucide-react";
// Iconos de ejemplo (puedes usar react-icons, heroicons, etc.)

// Cambiado a un ícono de flecha SVG para un look más moderno
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const CloseIcon = () => <span>✕</span>;

type SidebarVariant = "admin" | "propietario";

interface SidebarProps {
  variant?: SidebarVariant;
}

export default function Sidebar({ variant = "admin" }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User>();
  const router = useRouter();
  const handleLogout = () => {
    fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };
  const adminItems = [
    
    { name: "Usuarios", href: "/admin/usuarios/usuarios", icon: <UsersIcon /> }, // varios usuarios
    //{ name: "Residencias", href: "/admin/residencias/viviendas", icon: <HomeIcon /> },
   // { name: "Cobros", href: "/admin/cobros/expensas", icon: <CreditCardIcon /> },
    //{ name: "Incidencias", href: "/admin/incidencia", icon: <BellIcon /> }, // alertas/incidencias
    
  ];
 
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])
  const menuItems = adminItems

  return (
    <>
      {/* Botón hamburguesa y overlay */}
      {/* Ajustado para que el botón sea un semicírculo en el borde */}
      <div className="md:hidden fixed top-1/4 -translate-y-1/2 ">
        <button
          className="pl-2 pr-1 py-4 bg-blue-900 text-white rounded-r-full shadow-lg focus:outline-none"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <MenuIcon />
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
        className={`${open ? "translate-x-0" : "-translate-x-full"
          } fixed top-0 left-0 w-64 h-screen bg-blue-900 shadow-lg z-20 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 md:flex md:flex-col md:h-screen overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-bold text-xl text-gray-800 dark:text-white">
            {variant === "admin" ? "Panel Admin" : "Panel Propietario"}
          </h1>
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        </div>
        {user && (
          <div className="p-4 ">
            <p className="font-semibold text-white">{user.nombre} {user.apellido}</p>
            <p className="text-xs text-white">{user.email}</p>
            
            <button onClick={handleLogout}
              className=" text-xs p-1 text-white hover:text-black cursor-pointer rounded-md">
              Cerrar sesión
            </button>
          </div>
        )}
       

        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center p-2 text-white hover:text-blue-900 hover:bg-white rounded-md transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
          
      </aside>
    </>
  );
}
