"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth/user";
import {
  Home as HomeIcon,
  User as UserIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  CreditCard as CreditCardIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  FileIcon,
  StarIcon,
} from "lucide-react";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";
import Favoritos from "./buttons/ButtonFav";
import { usePermisos } from "@/context/PermisoProvider";
import { ReactNode } from "react";
interface SubMenuItem {
  name: string;
  href: string;
  permiso?: string;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: ReactNode;
  permiso?: string;
  children?: SubMenuItem[];
}
const CloseIcon = () => <span>✕</span>;

export default function Sidebar() {
  const { permisos, tienePermiso } = usePermisos();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserEmpresaData>();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const [openMenu, setOpenMenu] = useState(false);
  const router = useRouter();
  const handleLogout = () => {
    fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };
  const adminItems: MenuItem[] = [
    { name: "Panel", href: "/librovivo/dashboard", icon: <UsersIcon /> },
    {
      name: "Cuentas",
      icon: <FileTextIcon />,
      children: [
        {
          name: "Plan de Cuentas",
          href: "/librovivo/cuenta_contable/clase_cuenta",
          permiso: "ver_clase_cuenta",
        },
        {
          name: "Cuentas Contables",
          href: "/librovivo/cuenta_contable/cuenta",
          permiso: "ver_cuenta",
        },
      ],
    },
    {
      name: "Registro Contable",
      icon: <CreditCardIcon />,
      children: [
        {
          name: "Asientos",
          href: "/librovivo/asiento_contable/asiento",
          permiso: "ver_asiento",
        },
        {
          name: "Movimientos",
          href: "/librovivo/asiento_contable/movimiento",
          permiso: "ver_movimiento",
        },
      ],
    },
    {
      name: "Libros",
      icon: <FileIcon />,
      children: [
        {
          name: "Libro Mayor",
          href: "/librovivo/libro/libro_mayor",
          permiso: "ver_libro_mayor",
        },
        {
          name: "Libro Diario",
          href: "/librovivo/libro/libro_diario",
          permiso: "ver_libro_diario",
        },
      ],
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
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
                  {user.usuario.persona.nombre} {user.usuario.persona.apellido}
                </p>
                <p className="text-xs text-gray-200">
                  {Array.isArray(user.rol) && user.rol.length > 0
                    ? user.rol[0]
                    : "Sin rol"}
                </p>
                <p className="text-xs text-gray-200">{user.usuario.email}</p>
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
                <Link
                  href={"/librovivo/configuracion"}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm"
                >
                  Configuración
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
          {menuItems.map((item, i) => {
            // Si el item tiene permiso definido y el usuario no lo tiene, no mostrar
            if (item.permiso && !tienePermiso(item.permiso)) return null;

            return (
              <div key={i}>
                {item.children ? (
                  <>
                    {/* Botón principal con submenú */}
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="w-full flex items-center justify-between p-2 text-white hover:text-black hover:bg-white rounded-md transition-colors"
                    >
                      <span className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      <span
                        className={`transform transition-transform ${
                          openSubmenu === item.name ? "rotate-90" : ""
                        }`}
                      >
                        <ArrowDownIcon />
                      </span>
                    </button>

                    {/* Submenú */}
                    <div
                      className={`pl-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                        openSubmenu === item.name
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.children.map((sub, j) => {
                        // Validación de permiso para subitem
                        if (sub.permiso && !tienePermiso(sub.permiso))
                          return null;

                        return (
                          <Link
                            key={j}
                            href={sub.href}
                            onClick={() => setOpen(false)}
                            className="block p-2 text-white hover:text-black hover:bg-white rounded-md"
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  // Enlace normal (sin submenú)
                  <Link
                    href={item.href || ""}
                    onClick={() => setOpen(false)}
                    className="flex items-center p-2 text-white hover:text-black hover:bg-white rounded-md transition-colors"
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            );
          })}

          <div className="mt-4 ">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <StarIcon /> Favoritos
            </h2>
            <Favoritos />
          </div>
        </nav>
      </aside>
    </>
  );
}
