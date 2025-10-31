
import React from 'react';

/**
 * NOTA PARA EL DESARROLLADOR:
 * 
 * Este componente está diseñado para mostrar los detalles de una suscripción.
 * Los datos que se muestran aquí son ejemplos estáticos.
 * Deberás reemplazar estos datos con la información real obtenida de tu backend.
 * 
 * Busca el archivo donde quieras usar esta tarjeta (por ejemplo, `src/app/perfil/suscripciones/page.tsx`)
 * y sigue las indicaciones que te dejé en el chat para integrarlo con datos reales.
 */

interface SuscripcionCardProps {
  nombrePlan: string;
  tipoPlan: string;
  fechaInicio: string;
  fechaFin: string;
  codigoSuscripcion: string;
  diasRestantes: number;
  empresasDisponibles: number;
}

const SuscripcionCard: React.FC<SuscripcionCardProps> = ({
  nombrePlan,
  tipoPlan,
  fechaInicio,
  fechaFin,
  codigoSuscripcion,
  diasRestantes,
  empresasDisponibles,
}) => {
  // Lógica para determinar el color de los días restantes
  const diasRestantesColor = diasRestantes < 15 ? 'text-red-500' : 'text-green-600';

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
      </div>
    </div>
  );
};

export default SuscripcionCard;
