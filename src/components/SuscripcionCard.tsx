
import React from 'react';

/**
 * NOTA PARA EL DESARROLLADOR:
 * 
 * Este componente está diseñado para mostrar los detalles de una suscripción.
 * Los datos que se muestran aquí son ejemplos estáticos.
 * Deberás reemplazar estos datos con la información real obtenida de tu backend.
 * 
 * Busca el archivo donde quieras usar esta tarjeta (por ejemplo, `src/app/perfil/suscripciones/page.tsx`)
 */

interface SuscripcionCardProps {
  nombrePlan: string;
  tipoPlan: string;
  fechaInicio: string;
  fechaFin: string;
  codigoSuscripcion: string;
  diasRestantes: number;
  empresasDisponibles: number;
  cantidadColaboradores: number;
  cantidadConsultasIA: number | null;
  onCancelSubscriotion?: () => void;
}

const SuscripcionCard: React.FC<SuscripcionCardProps> = ({
  nombrePlan,
  tipoPlan,
  fechaInicio,
  fechaFin,
  codigoSuscripcion,
  diasRestantes,
  empresasDisponibles,
  cantidadColaboradores,
  cantidadConsultasIA,
  onCancelSubscriotion,
}) => {
  // Lógica para determinar el color de los días restantes
  const diasRestantesColor = diasRestantes < 15 ? 'text-red-500' : 'text-green-600';

  const handleCancel = () => {
    if (onCancelSubscriotion){
      if (window.confirm("¿Está seguro que desea cancelar su suscripción activa?")){
        onCancelSubscriotion();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl border border-gray-200 font-sans">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{tipoPlan}</div>
        <h2 className="block mt-1 text-2xl leading-tight font-bold text-black">{nombrePlan}</h2>
        <p className="mt-2 text-gray-500">Código: <span className="font-mono bg-gray-100 p-1 rounded">{codigoSuscripcion}</span></p>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Fecha de Inicio</p>
              <p>{fechaInicio}</p>
            </div>
            <div>
              <p className="font-semibold">Fecha de Fin</p>
              <p>{fechaFin}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-700">Empresas Disponibles</p>
                    <p className="text-3xl font-bold text-gray-900">{empresasDisponibles}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-700">Días Restantes</p>
                    <p className={`text-4xl font-bold ${diasRestantesColor}`}>{diasRestantes}</p>
                </div>
            </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Colaboradores Disponibles</p>
              <p className="text-3xl font-bold text-gray-900">{cantidadColaboradores}</p>
            </div>
            <div>
              <p className="font-semibold">Consultas IA Restantes</p>
              <p className="text-3xl font-bold text-gray-900">{cantidadConsultasIA}</p>
            </div>
          </div>
        </div>
        {/* BOTÓN DE CANCELACIÓN: Solo se muestra si la prop onCancelSubscription es proporcionada */}
        {diasRestantes > 0 && onCancelSubscriotion && (
            <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={handleCancel}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                >
                    Cancelar Suscripción
                </button>
                <p className="mt-2 text-sm text-gray-500 text-center">
                    La cancelación marcará su plan como inactivo, permitiéndole cambiar a uno nuevo.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SuscripcionCard;
