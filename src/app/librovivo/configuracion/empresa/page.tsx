"use client";

import { useEffect, useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaSet, EmpresaGet, EmpresaList } from "@/types/empresa/empresa";
import FormInput from "@/components/FormInput";
import ButtonInput from "@/components/ButtonInput";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfigEmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Estado del formulario
  const [formData, setFormData] = useState<EmpresaSet>({
    nombre: "",
    nit: "",
    fecha_cierre_contable: "",
  });
  
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  // 1. Cargar datos actuales de la empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        // PASO A: Obtener lista ligera para sacar el ID
        const misEmpresas = await apiFetcher<EmpresaList[]>("/api/empresa/mis_empresas/");
        
        if (misEmpresas && misEmpresas.length > 0) {
            const idEmpresa = misEmpresas[0].id; // Tomamos la primera
            setEmpresaId(idEmpresa);

            // PASO B: Obtener el DETALLE completo usando el ID
            // Esto llamará al EmpresaDetailSerializer en el backend
            const detalle = await apiFetcher<EmpresaGet>(`/api/empresa/empresa/${idEmpresa}/`);

            setFormData({
                nombre: detalle.nombre,
                nit: detalle.nit || "",
                fecha_cierre_contable: detalle.fecha_cierre_contable || ""
            });
        }
      } catch (error) {
        console.error("Error cargando empresa", error);
        alert("No se pudo cargar la información de la empresa");
      } finally {
        setDataLoading(false);
      }
    };
    fetchEmpresaData();
  }, []);
  // 2. Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;
    
    setLoading(true);
    try {
      await apiFetcher(`/api/empresa/empresa/${empresaId}/`, {
        method: "PUT", // O PATCH según tu backend
        body: JSON.stringify(formData),
      });
      alert("Configuración actualizada correctamente");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (dataLoading) return <div className="p-8 text-center">Cargando configuración...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Datos de la Empresa</h1>
            <Link href="/librovivo/configuracion" className="text-blue-600 hover:underline">
                &larr; Volver
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Nombre de la Empresa"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
                <FormInput
                    label="NIT / Identificación"
                    name="nit"
                    value={formData.nit || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    🔒 Cierre Contable
                </h3>
                <p className="text-sm text-red-600 mb-4">
                    Establece una fecha límite. Nadie podrá crear, editar o eliminar asientos con fecha igual o anterior a la seleccionada.
                </p>
                <FormInput
                    label="Fecha de Cierre (Bloqueo)"
                    name="fecha_cierre_contable"
                    type="date"
                    value={formData.fecha_cierre_contable || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end pt-4">
                <ButtonInput type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Guardar Cambios
                </ButtonInput>
            </div>
        </form>
      </div>
    </div>
  );
}