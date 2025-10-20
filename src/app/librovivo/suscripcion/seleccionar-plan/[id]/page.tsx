"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetcher } from "@/lib/apiFetcher";
import { TipoPlanFull, PaymentRequest, SubscriptionSuccessResponse, PlanesDisponiblesResponse } from "@/types/suscripcion/suscripcion";
import FormInput from "@/components/FormInput";
import ButtonInput from "@/components/ButtonInput";
// ... (asegúrate de que todos los imports sean correctos)

export default function SeleccionarPlanPage() {
  const { id: planId } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubscriptionSuccessResponse | null>(null);

  const [planSeleccionado, setPlanSeleccionado] = useState<TipoPlanFull | null>(null);

  const [formData, setFormData] = useState<Omit<PaymentRequest, 'tipo_plan_id'>>({
    card_number: "",
    card_expiry: "",
    card_cvv: "",
  });

  // Función para obtener planes si localStorage falla
  const fetchPlansFromApi = useCallback(async () => {
    try {
        await apiFetcher<TipoPlanFull[]>('/api/suscripcion/activa/');
    } catch (err: any) {
        try {
            const errorResponse: PlanesDisponiblesResponse = JSON.parse(err.message);
            if (errorResponse.planes_disponibles) {
                return errorResponse.planes_disponibles;
            }
        } catch (parseError) {
            console.error("Error grave en la API de planes:", parseError);
            setError("Error: No se pudo obtener la lista de planes disponibles.");
        }
    }
    return null;
  }, []);


  // EFECTO PRINCIPAL: Carga el plan, con fallback de API si localStorage falla.
  useEffect(() => {
    const loadPlan = async () => {
        setLoading(true);
        let planes: TipoPlanFull[] | null = null;
        
        // 1. Intentar cargar desde localStorage
        const storedPlans = localStorage.getItem('availablePlans');
        if (storedPlans) {
            try {
                planes = JSON.parse(storedPlans);
            } catch (e) {
                console.error("Error al parsear plans de localStorage:", e);
                planes = null; 
            }
        }

        // 2. Si no hay planes en localStorage, ir a la API
        if (!planes) {
            planes = await fetchPlansFromApi();
        }
        
        // 3. Buscar el plan por ID (¡CORRECCIÓN CLAVE!)
        if (planes) {
            // Convertimos p.id a string para asegurar la coincidencia con planId (que es string de URL)
            const selected = planes.find(p => String(p.id) === planId); 
            
            if (selected) {
                setPlanSeleccionado(selected);
                setError(null);
            } else {
                setError("Plan no encontrado o ID inválido.");
            }
        } else if (!error) {
            setError("No se pudo obtener la lista de planes. Intente recargar la página.");
        }
        
        setLoading(false);
    };

    loadPlan();
  }, [planId, fetchPlansFromApi]); 

  // ... (El resto del código de handlers y renderizado permanece igual) ...

  const isFreePlan = planSeleccionado?.precio === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!planSeleccionado) {
      setError("No se pudo identificar el plan seleccionado.");
      setLoading(false);
      return;
    }

    // 1. Preparar el Payload
    const payload: PaymentRequest = {
      tipo_plan_id: planId, 
      card_number: isFreePlan ? '0000000000000000' : formData.card_number,
      card_expiry: isFreePlan ? '12/99' : formData.card_expiry,
      card_cvv: isFreePlan ? '000' : formData.card_cvv,
    };
    
    // 2. Validación mínima para planes de pago
    if (!isFreePlan && (!payload.card_number || !payload.card_expiry || !payload.card_cvv)) {
        setError("Por favor, complete todos los campos de la tarjeta para la simulación.");
        setLoading(false);
        return;
    }

    try {
      // 3. Llamar al endpoint de activación/pago
      const response = await apiFetcher<SubscriptionSuccessResponse>(
        '/api/suscripcion/confirmar_compra/',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      // Limpiar planes guardados al tener éxito, forzando la recarga del dashboard
      localStorage.removeItem('availablePlans'); 
      setSuccess({ 
          plan_nombre: planSeleccionado.plan.nombre,
          fecha_fin_formateada: response.fecha_fin_formateada,
          codigo: response.codigo,
          id: response.id,
          fecha_inicio: response.fecha_inicio
      });

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push('/librovivo/dashboard');
      }, 3000);

    } catch (err: any) {
      console.error("Error al confirmar suscripción:", err);
      // El backend devuelve un JSON de error si falla la validación
      try {
          const errorJson = JSON.parse(err.message);
          const errorMsg = errorJson.detail || Object.values(errorJson)[0][0] || "Error al procesar el pago.";
          setError(errorMsg);
      } catch {
          setError(err.message || "Error al procesar la suscripción. Intente de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Renderizado condicional
  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando detalles del plan...</div>;
  }
  
  if (error && !planSeleccionado) {
    return <div className="p-6 text-center text-red-500 font-semibold">Error: {error}</div>;
  }
  
  if (success) {
      return (
          <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg border-l-4 border-green-500 text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">¡Suscripción Activada!</h2>
              <p className="text-gray-700">Tu plan **{success.plan_nombre}** está activo.</p>
              <p className="text-sm text-gray-500 mt-2">Código de Suscripción: {success.codigo}</p>
              <p className="text-sm text-gray-500">Fecha de Vencimiento: {success.fecha_fin_formateada}</p>
              <ButtonInput onClick={() => router.push('/librovivo/dashboard')} className="mt-6">Ir al Dashboard</ButtonInput>
          </div>
      );
  }
  
  // Renderizado del Formulario
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Confirmar Suscripción
        </h1>
        
        {/* Detalles del Plan Seleccionado */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-800">{planSeleccionado.plan.nombre}</h2>
            <p className="text-2xl font-bold text-green-900 my-1">
                ${planSeleccionado.precio.toFixed(2)} 
                <span className="text-sm font-normal text-green-700"> por {planSeleccionado.duracion_mes} Mes{planSeleccionado.duracion_mes > 1 ? 'es' : ''}</span>
            </p>
            <p className="text-sm text-gray-600">{planSeleccionado.plan.descripcion}</p>
        </div>
        
        {error && <div className="text-red-600 text-sm text-center mb-4">{error}</div>}

        <form onSubmit={handleSimulatedPayment} className="space-y-6">
          
          {isFreePlan ? (
             <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800">
                <p className="font-semibold">¡Este es un Plan Gratuito!</p>
                <p className="text-sm">Solo necesitas confirmar para activar tu suscripción.</p>
             </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-700">Datos de Pago (Simulado)</h2>
              
              <FormInput
                label="Número de Tarjeta (Ficticio)"
                name="card_number"
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                value={formData.card_number}
                onChange={handleChange}
                required
                error={!formData.card_number ? "Requerido" : undefined}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Vencimiento (MM/AA)"
                  name="card_expiry"
                  type="text"
                  placeholder="MM/AA"
                  value={formData.card_expiry}
                  onChange={handleChange}
                  required
                  error={!formData.card_expiry ? "Requerido" : undefined}
                />
                <FormInput
                  label="CVV"
                  name="card_cvv"
                  type="text"
                  placeholder="XXX"
                  value={formData.card_cvv}
                  onChange={handleChange}
                  required
                  error={!formData.card_cvv ? "Requerido" : undefined}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancelar
            </button>
            <ButtonInput
              type="submit"
              loading={loading}
              className="px-4 py-2"
            >
              {loading ? "Procesando..." : (isFreePlan ? "Confirmar Activación" : "Pagar y Activar")}
            </ButtonInput>
          </div>
        </form>
      </div>
    </div>
  );
}