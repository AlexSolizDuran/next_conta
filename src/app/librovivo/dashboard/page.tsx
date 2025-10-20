// contafront/src/app/librovivo/dashboard/page.tsx

"use client"; 

import React, { useState, useEffect } from 'react';
import SuscripcionCard from '@/components/SuscripcionCard';
import PlanCard from '@/components/PlanCard'; // Importar PlanCard
import { apiFetcher } from '@/lib/apiFetcher'; 
import { SuscripcionData, TipoPlanFull, PlanesDisponiblesResponse } from '@/types/suscripcion/suscripcion'; 

const DashboardPage = () => {
  const [suscripcion, setSuscripcion] = useState<SuscripcionData | null>(null);
  // Nuevo estado para los planes disponibles
  const [planesDisponibles, setPlanesDisponibles] = useState<TipoPlanFull[] | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuscripcionData = async () => {
      setPlanesDisponibles(null); // Resetear
      try {
        const data = await apiFetcher<SuscripcionData>('/api/suscripcion/activa/'); 
        setSuscripcion(data);
        setError(null);//limpia error si se encuentra la suscripcion
      } catch (err: any) {
        console.error("Error al cargar los datos de la suscripción:", err);
        
        // 🚨 Manejo de la respuesta 404 especial del backend
        try {
            const errorResponse: PlanesDisponiblesResponse = JSON.parse(err.message);
            if (errorResponse.planes_disponibles) {
                 // Si la contiene, establecemos los planes y mostramos las tarjetas.
                 setPlanesDisponibles(errorResponse.planes_disponibles);
                 localStorage.setItem('availablePlans', JSON.stringify(errorResponse.planes_disponibles));
                 setError("No se encontró suscripción activa.");
                 setSuscripcion(null);
                 return; // Salir, ya hemos manejado la respuesta 404
            }
        } catch (parseError) {
             // Si no es un 404 con el payload de planes, mostramos el error original
             console.error("No es una respuesta JSON de planes:", parseError);
        }
        
        // Manejo del error original si no fue un 404 especial
        setError(err.message || "Ocurrió un error inesperado.");
        setSuscripcion(null);
        
      } finally {
        setLoading(false);
      }
    };

    fetchSuscripcionData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando datos del dashboard...</div>;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // --- Renderizar PlANES DISPONIBLES si no hay suscripción ---
  if (planesDisponibles) {
      return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-red-600">Error de Acceso</h1>
            <p className="mb-8 text-gray-800 font-semibold">{error} Elige un plan a continuación para continuar:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {planesDisponibles.map((planTipo) => {
                const features = [
                    `${planTipo.caracteristica.cant_empresas ?? 'Ilimitadas'} Empresa(s)`,
                    `${planTipo.caracteristica.cant_colab ?? 'Ilimitados'} Colaborador(es)`,
                    `Funcionalidad: ${planTipo.caracteristica.funcionalidad}`,
                    `${planTipo.duracion_mes} Meses`,
                ];

                //const isFeatured = planTipo.plan.codigo === 'PREMIUM'; // Ejemplo: destacar plan Premium
                
                return (
                    <PlanCard
                        key={planTipo.id}
                        title={planTipo.plan.nombre}
                        // Aquí mostramos el precio y el periodo (si es anual)
                        price={planTipo.duracion_mes === 12 ? 
                          `$${planTipo.precio.toFixed(2)}/año` : 
                          `$${planTipo.precio.toFixed(2)}/mes`
                        }
                        features={features}
                        //featured={isFeatured}
                        buttonText={planTipo.precio === 0 ? "Empezar Gratis" : `Seleccionar Plan`}
                        dir={`/librovivo/suscripcion/seleccionar-plan/${planTipo.id}`}
                    />
                );
            })}
            </div>
        </div>
      );
  }
  
  // --- Renderizar SUSCRIPCIÓN ACTIVA ---
  if (suscripcion) {
      return (
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Estadísticas Principales</h2>
                <p>Aquí irán tus gráficos y otras visualizaciones de datos...</p>
              </div>
            </div>

            <div className="lg:col-span-1">
                <SuscripcionCard
                  nombrePlan={suscripcion.plan.plan.nombre}
                  tipoPlan={`${suscripcion.plan.duracion_mes} Mes${suscripcion.plan.duracion_mes > 1 ? 'es' : ''}`}
                  fechaInicio={formatDate(suscripcion.fecha_inicio)}
                  fechaFin={suscripcion.fecha_fin ? formatDate(suscripcion.fecha_fin) : 'N/A'}
                  codigoSuscripcion={suscripcion.codigo || 'N/A'}
                  diasRestantes={suscripcion.dia_restante}
                  empresasDisponibles={suscripcion.empresa_disponible ?? 0}
                />
            </div>
          </div>
        </div>
      );
  }
  
  // --- Renderizar Error Genérico (si no se pudo obtener ni suscripción ni planes) ---
  return (
      <div className="p-4 md:p-8 text-center text-red-500">
          <h1 className="text-3xl font-bold mb-4">Error de Acceso</h1>
          <p>{error || "Ocurrió un error inesperado al cargar la información de la suscripción."}</p>
      </div>
  );

};

export default DashboardPage;