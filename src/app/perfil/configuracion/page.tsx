"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioGet, UsuarioSet } from "@/types/usuario/usuario";
import ButtonInput from "@/components/ButtonInput";

const url = `/api/usuario/usuario`;

export default function ConfiguracionPage() {
  const [id, setId] = useState<string | number | undefined>();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser).user_id;
      setId(parsedUser);
    }
  }, []);

  const { data: user, error, mutate } = useSWR<UsuarioGet>(
    id ? `${url}/${id}` : null,
    apiFetcher
  );

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UsuarioSet | null>(null);

  // Inicializar formulario
  if (user && !formData) setFormData(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      persona: {
        ...formData.persona,
        [name]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!formData) return;

    const payload: any = { ...formData };
    if (showPasswordFields && oldPassword && newPassword) {
      payload.old_password = oldPassword;
      payload.new_password = newPassword;
    }

    try {
      await apiFetcher(`${url}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      alert(showPasswordFields ? "Contraseña actualizada" : "Datos actualizados");
      setEditing(false);
      setShowPasswordFields(false);
      setOldPassword("");
      setNewPassword("");
      mutate(); // actualizar SWR
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      alert(err.message || "Error al actualizar los datos");
    }
  };

  if (error)
    return (
      <p className="text-red-500 text-center mt-10">Error al cargar datos</p>
    );
  if (!user) return <p className="text-center mt-10">Cargando datos...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6 bg-white rounded-2xl shadow-lg min-h-[80vh]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Configuración del Perfil
      </h2>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData?.persona.nombre || ""}
            disabled={!editing}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 ${
              editing ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formData?.persona.apellido || ""}
            disabled={!editing}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 ${
              editing ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData?.persona.telefono || ""}
            disabled={!editing}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 ${
              editing ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        {/* Campos de contraseña */}
        {showPasswordFields && (
          <>
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Contraseña actual
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
              />
            </div>
          </>
        )}
      </div>

      {/* Botones */}
      <div className="mt-6 flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-2 sm:space-y-0">
        {!editing ? (
          <ButtonInput type="button" onClick={() => setEditing(true)}>
            Editar
          </ButtonInput>
        ) : (
          <>
            <ButtonInput
              type="button"
              onClick={() => {
                setEditing(false);
                setFormData(user); // Restaurar valores
                setOldPassword("");
                setNewPassword("");
                setShowPasswordFields(false);
              }}
              className="bg-gray-300 text-black hover:bg-gray-400"
            >
              Cancelar
            </ButtonInput>
            <ButtonInput type="button" onClick={handleSave}>
              Guardar
            </ButtonInput>
          </>
        )}

        {/* Botón independiente para cambiar contraseña */}
        {!showPasswordFields && (
          <ButtonInput
            type="button"
            onClick={() => setShowPasswordFields(true)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Cambiar Contraseña
          </ButtonInput>
        )}
      </div>
    </div>
  );
}
