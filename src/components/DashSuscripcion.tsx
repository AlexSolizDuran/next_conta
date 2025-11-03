"use client";

import React, { useState, useEffect } from 'react';
// Corrección: Revertir a alias '@/'
import SuscripcionCard from '@/components/SuscripcionCard';
import PlanCard from '@/components/PlanCard';
import { apiFetcher } from '@/lib/apiFetcher';
import { SuscripcionData, TipoPlanFull, PlanesDisponiblesResponse } from '@/types/suscripcion/suscripcion';
import EmpresasPage from '@/components/SeleccionarEmpresas';

// Componente reutilizable para el contenido del Dashboard
const DashboardContent = () => {
  const [suscripcion, setSuscripcion] = useState<SuscripcionData | null>(null);
  // Nuevo estado para los planes disponibles
  const [planesDisponibles, setPlanesDisponibles] = useState<TipoPlanFull[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAISection, setShowAISection] = useState<boolean>(false);

  useEffect(() => {
    const fetchSuscripcionData = async () => {
      setPlanesDisponibles(null); // Resetear
      setLoading(true); // Indicar inicio de carga
      setError(null); // Limpiar errores previos
      try {
        // La ruta de la API sigue siendo la misma
        const data = await apiFetcher<SuscripcionData>('/api/suscripcion/activa/');
        setSuscripcion(data);
        setError(null); // Limpia error si se encuentra la suscripcion
        const permiteIA = data?.plan?.caracteristica?.cant_consultas_ia !== null && data?.plan?.caracteristica?.cant_consultas_ia !== 0;
        setShowAISection(permiteIA);
      } catch (err: any) {
        console.error("Error al cargar los datos de la suscripción:", err);
        // 🚨 Manejo de la respuesta 404 especial del backend
        try {
          const errorResponse: PlanesDisponiblesResponse = JSON.parse(err.message);
          // Verifica si la respuesta contiene la propiedad 'planes_disponibles'
          if (errorResponse && errorResponse.planes_disponibles && Array.isArray(errorResponse.planes_disponibles)) {
            // Si la contiene, establecemos los planes y mostramos las tarjetas.
            setPlanesDisponibles(errorResponse.planes_disponibles);
            // Guarda los planes en localStorage para usarlos en la página de selección
            localStorage.setItem('availablePlans', JSON.stringify(errorResponse.planes_disponibles));
            setError("No se encontró suscripción activa."); // Mensaje específico para este caso
            setSuscripcion(null);
            // No necesitamos retornar aquí explícitamente, el finally se ejecutará
          } else {
            // Si no tiene 'planes_disponibles', lanzar un error para que lo capture el catch externo
            throw new Error("Respuesta de error 404 no contiene planes disponibles.");
          }
        } catch (parseError) {
          // Captura errores al parsear JSON o si la estructura no es la esperada
          console.error("Error al procesar la respuesta de error:", parseError);
          // Establecer el mensaje de error original o uno genérico
          setError(err.message || "Ocurrió un error inesperado al cargar la suscripción.");
          setSuscripcion(null);
          setPlanesDisponibles(null); // Asegurar que no se muestren planes si hubo error
        }
        setShowAISection(false);
      } finally {
        setLoading(false); // Indicar fin de carga, ya sea éxito o error
      }
    };

    fetchSuscripcionData();
  }, []); // El array vacío asegura que se ejecute solo al montar el componente

  // --- Renderizado Condicional ---

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando datos del dashboard...</div>;
  }

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return 'N/A';
    try {
      // Asegurarse de que la fecha sea válida antes de formatear
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return 'Fecha inválida';
    }
  }


  // --- Renderizar PLANES DISPONIBLES si no hay suscripción activa ---
  if (planesDisponibles) {
    return (
      <div className="p-4 md:p-8">
        {/* Mensaje de error claro */}
        <h1 className="text-3xl font-bold mb-4 text-red-600">Acceso Requerido</h1>
        <p className="mb-8 text-gray-700">{error || "No tienes una suscripción activa."} Elige un plan para continuar:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {planesDisponibles.map((planTipo) => {
            // Validación básica de datos antes de renderizar PlanCard
            if (!planTipo || !planTipo.plan || !planTipo.caracteristica) {
              console.warn("Plan inválido encontrado:", planTipo);
              return null; // No renderizar si faltan datos esenciales
            }

            const features = [
              `${planTipo.caracteristica.cant_empresas ?? 'Ilimitadas'} Empresa(s)`,
              `${planTipo.caracteristica.cant_colab ?? 'Ilimitados'} Colaborador(es)`,
              `Funcionalidad: ${planTipo.caracteristica.funcionalidad || 'No especificada'}`,
              `${planTipo.duracion_mes || '?'} Meses`,
            ];

            const priceText = typeof planTipo.precio === 'number'
              ? planTipo.duracion_mes === 12
                ? `$${planTipo.precio.toFixed(2)}/año`
                : `$${planTipo.precio.toFixed(2)}/mes`
              : 'Precio no disponible';

            return (
              <PlanCard
                key={planTipo.id || `plan-${Math.random()}`} // Fallback key si no hay ID
                title={planTipo.plan.nombre || 'Plan sin nombre'}
                price={priceText}
                features={features}
                buttonText={planTipo.precio === 0 ? "Empezar Gratis" : `Seleccionar Plan`}
                // Asegurar que dir tenga un valor válido
                dir={planTipo.id ? `/librovivo/suscripcion/seleccionar-plan/${planTipo.id}` : '#'}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // --- Renderizar SUSCRIPCIÓN ACTIVA ---
  if (suscripcion) {
    // Validación de datos de suscripción
    if (!suscripcion.plan || !suscripcion.plan.plan) {
      return (
        <div className="p-4 md:p-8 text-center text-orange-600">
          <h1 className="text-3xl font-bold mb-4">Datos Incompletos</h1>
          <p>La información del plan de suscripción no está completa.</p>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">PreJoin</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Estadísticas Principales</h2>
              {/* datos extras */}

              {/* Puedes añadir contenido de ejemplo o real aquí */}
              <EmpresasPage />
            </div>
          </div>

          <div className="lg:col-span-1">
            <SuscripcionCard
              nombrePlan={suscripcion.plan.plan.nombre}
              tipoPlan={`${suscripcion.plan.duracion_mes} Mes${suscripcion.plan.duracion_mes > 1 ? 'es' : ''}`}
              fechaInicio={formatDate(suscripcion.fecha_inicio)}
              fechaFin={formatDate(suscripcion.fecha_fin)}
              codigoSuscripcion={suscripcion.codigo || 'N/A'}
              // Asegurarse de que dia_restante sea un número
              diasRestantes={typeof suscripcion.dia_restante === 'number' ? suscripcion.dia_restante : 0}
              empresasDisponibles={suscripcion.empresa_disponible ?? 0}
              cantidadColaboradores={suscripcion.colab_disponible ?? 0}
              cantidadConsultasIA={showAISection ? (suscripcion.consultas_ia_restantes ?? 0) : 0}  
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Renderizar Error Genérico (si no hay suscripción ni planes, y hubo un error) ---
  if (error) {
    return (
      <div className="p-4 md:p-8 text-center text-red-500">
        <h1 className="text-3xl font-bold mb-4">Error de Carga</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Fallback por si ninguna condición se cumple (aunque no debería ocurrir con la lógica actual)
  return <div className="p-4 md:p-8 text-center text-gray-500">No se pudo determinar el estado de la suscripción.</div>;

};

export default DashboardContent;