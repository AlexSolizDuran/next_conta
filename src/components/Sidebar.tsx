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
  Bell as BellIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  MenuIcon,
  AxeIcon,
  BusIcon,
  BlocksIcon,
  ArrowUpIcon,
  ArrowDownZAIcon,
  ArrowDownIcon,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigRightDashIcon,
  ArrowBigRightIcon,
  ArrowRight,
  ArrowRightIcon,
} from "lucide-react";
// Iconos de ejemplo (puedes usar react-icons, heroicons, etc.)

// Cambiado a un ícono de flecha SVG para un look más moderno

const CloseIcon = () => <span>✕</span>;

type SidebarVariant = "admin" | "propietario";

interface SidebarProps {
  variant?: SidebarVariant;
}

export default function Sidebar({ variant = "admin" }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User>();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const router = useRouter();
  const handleLogout = () => {
    fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };
  const adminItems = [
    { name: "Panel", href: "/librovivo/dashboard", icon: <UsersIcon /> },
    {
      name: "Cuentas",
      icon: <FileTextIcon />,
      children: [
        {
          name: "Plan de Cuentas",
          href: "/librovivo/cuenta_contable/clase_cuenta",
        },
        {
          name: "Cuentas Contables",
          href: "/librovivo/cuenta_contable/cuenta",
        },
      ],
    },
    {
      name: "Registro Contable",
      icon: <CreditCardIcon/>,
      children: [
        {
          name: "Asientos",
          href: "/librovivo/asiento_contable/asiento",
        },
        {
          name: "Movimientos",
          href: "/librovivo/asiento_contable/movimiento",
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
          <ArrowRightIcon/>
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
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-bold text-xl text-gray-800 dark:text-white">
            Menu
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
            <p className="font-semibold text-white">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs text-white">{user.email}</p>

            <button
              onClick={handleLogout}
              className=" text-xs p-1 text-white hover:text-black cursor-pointer rounded-md"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, i) => (
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
                      <ArrowDownIcon/>
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
                    {item.children.map((sub, j) => (
                      <Link 
                        key={j}
                        href={sub.href}
                        onClick={() => setOpen(false)}
                        className="block p-2 text-white hover:text-black hover:bg-white rounded-md"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                // Enlace normal (sin submenú)
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center p-2 text-white hover:text-black hover:bg-white rounded-md transition-colors"
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
