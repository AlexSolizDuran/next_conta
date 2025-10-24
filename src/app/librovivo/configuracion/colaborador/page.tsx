"use client";

import { use, useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { UserEmpresaList } from "@/types/empresa/user_empresa";
import useSWR, { mutate } from "swr";
import { PaginatedResponse } from "@/types/paginacion";
import ButtonInput from "@/components/ButtonInput";
import ButtonDelete from "@/components/ButtonDelete";
import TableList from "@/components/TableList"; // Asegúrate de que este componente maneje la paginación
import { useParams } from "next/navigation";
import { usePermisos } from "@/context/PermisoProvider";

// --- Componente Modal Simple ---
// Lo ideal sería mover esto a un archivo separado (ej: Modal.jsx)
interface ColaboradorModalProps {
  colaborador: UserEmpresaList | null;
  onClose: () => void;
}

const ColaboradorModal = ({ colaborador, onClose }: ColaboradorModalProps) => {
  if (!colaborador) return null;

  return (
    // Overlay (Fondo oscuro)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Contenido del Modal */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">
          Detalles del Colaborador
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong className="block text-base">Nombre Completo:</strong>{" "}
            {colaborador.usuario.persona.nombre}{" "}
            {colaborador.usuario.persona.apellido}
          </p>
          <p>
            <strong className="block text-base">Username:</strong>{" "}
            {colaborador.usuario.username}
          </p>
          <p>
            <strong className="block text-base">Correo Electrónico:</strong>{" "}
            {colaborador.usuario.email}
          </p>
          <p>
            <strong className="block text-base">Telefono:</strong>{" "}
            {colaborador.usuario.persona.telefono}
          </p>

          {/* Puedes añadir más campos aquí si los necesitas */}
        </div>

        <div className="mt-6 flex justify-end">
          <ButtonInput
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Cerrar
          </ButtonInput>
        </div>
      </div>
    </div>
  );
};
// ------------------------------

export default function ColaboradoresPage() {
  const { permisos, tienePermiso } = usePermisos();
  const [page, setPage] = useState(1);
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 Nuevo estado para el modal
  const [modalData, setModalData] = useState<UserEmpresaList | null>(null);

  const url = `/api/empresa/user_empresa`;
  const pageUrl = `${url}/?page=${page}`;
  const {
    data: usuarios_empresas,
    error,
    isLoading: loadingUser,
  } = useSWR<PaginatedResponse<UserEmpresaList>>(pageUrl, apiFetcher);

  // 🆕 Función para abrir el modal
  const handleOpenModal = (colaborador: UserEmpresaList) => {
    setModalData(colaborador);
  };

  // 🆕 Función para cerrar el modal
  const handleCloseModal = () => {
    setModalData(null);
  };

  // Añadir nuevo colaborador
  const handleAgregar = async () => {
    if (!nuevoEmail) return alert("Ingresa un correo válido");
    try {
      setIsLoading(true);
      await apiFetcher(`${url}/`, {
        method: "POST",
        body: JSON.stringify({ email: nuevoEmail }),
      });
      setNuevoEmail("");
      // Uso de `mutate(pageUrl, ...)` para revalidar la lista
      mutate(pageUrl);
    } catch (err) {
      console.error(err);
      alert("Error al agregar colaborador");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar colaborador
  const handleEliminar = async (id: string) => {
    if (!confirm("¿Deseas eliminar este colaborador?")) return;
    try {
      await apiFetcher(`${url}/${id}`, { method: "DELETE" });
      // Uso de `mutate(pageUrl, ...)` para revalidar la lista
      mutate(pageUrl);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar colaborador");
    }
  };

  // Columnas para TableList
  const columns = [
    {
      key: "nombre",
      header: "Nombre",
      render: (c: UserEmpresaList) =>
        `${c.usuario.persona.nombre} ${c.usuario.persona.apellido}`,
    },
    {
      key: "correo",
      header: "Correo",
      render: (c: UserEmpresaList) => c.usuario.email,
    },
    {
      key: "rol",
      header: "Rol",
      render: (c: UserEmpresaList) =>
        c.roles?.length
          ? c.roles.map((r: any) => r.nombre).join(", ")
          : "Colaborador",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (c: UserEmpresaList) => (
        <div className="flex gap-2">
          {tienePermiso("eliminar_colaborador") && (
            <ButtonDelete onClick={() => handleEliminar(c.id)}>
              Eliminar
            </ButtonDelete>
          )}

          {tienePermiso("ver_colaborador") && (
            <ButtonInput
              onClick={() => handleOpenModal(c)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Info
            </ButtonInput>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Colaboradores</h1>

      {/* Formulario para agregar colaborador */}
      {tienePermiso("crear_colaborador") && (
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="Correo Gmail"
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <ButtonInput
            onClick={handleAgregar}
            disabled={isLoading || !nuevoEmail}
            className="bg-green-600 text-white"
            loading={isLoading}
          >
            Añadir
          </ButtonInput>
        </div>
      )}

      {/* Tabla de colaboradores */}
      <TableList
        columns={columns}
        data={usuarios_empresas?.results || []}
        rowKey={(item) => item.id}
        emptyMessage="No hay colaboradores registrados."
        // Aquí podrías añadir los controles de paginación si TableList los acepta
      />
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!usuarios_empresas?.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!usuarios_empresas?.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      {/* 🆕 Renderizado del Modal */}
      <ColaboradorModal colaborador={modalData} onClose={handleCloseModal} />
    </div>
  );
}
