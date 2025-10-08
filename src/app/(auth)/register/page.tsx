"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Register } from "@/types/auth/register";
import { PersonaSet } from "@/types/usuario/persona";
import FormInput from "@/components/FormInput";
import ButtonInput from "@/components/ButtonInput";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState<Register>({
    username: "",
    password: "",
    email: "",
    persona: {
      nombre: "",
      apellido: "",
      telefono: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Revisamos si es un campo dentro de persona
    if (["nombre", "apellido", "telefono"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        persona: {
          ...prev.persona,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`api/auth/register/`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Registro exitoso:", result);
        router.push("/login");
      } else {
        // Intentar parsear como JSON, si falla mostrar error genérico
        try {
          const errorData = await response.json();
          setError(
            errorData.message || "Error al crear la cuenta. Inténtalo de nuevo."
          );
        } catch (parseError) {
          console.error("Error parseando respuesta:", parseError);
          setError(
            `Error del servidor (${response.status}): ${response.statusText}`
          );
        }
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Regístrate en el sistema de contabilidad
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              label="Nombre de usuario"
              name="username"
              type="text"
              required
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              error={error && !formData.username ? error : undefined}
            />
            <FormInput
              label="Contraseña"
              name="password"
              type="password"
              required
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              error={error && !formData.password ? error : undefined}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              required
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              error={error && !formData.email ? error : undefined}
            />
            <FormInput
              label="Nombre"
              name="nombre"
              type="text"
              required
              placeholder="Nombre"
              value={formData.persona.nombre}
              onChange={handleChange}
              error={error && !formData.persona.nombre ? error : undefined}
            />
            <FormInput
              label="Apellido"
              name="apellido"
              type="text"
              required
              placeholder="Apellido"
              value={formData.persona.apellido}
              onChange={handleChange}
              error={error && !formData.persona.apellido ? error : undefined}
            />
            <FormInput
              label="Numero telefonico"
              name="telefono"
              type="number"
              required
              placeholder="Numero telefonico"
              value={formData.persona.telefono}
              onChange={handleChange}
              error={error && !formData.persona.telefono ? error : undefined}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <ButtonInput
              type="submit"
              loading={loading}
              className="w-full flex justify-center"
            >
              Crear Cuenta
            </ButtonInput>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}