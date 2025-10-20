interface PlanData {
    nombre: string;
    descripcion: string;
    codigo: string;
}

interface CaracteristicaData {
    funcionalidad: string;
    cant_empresas: number | null;
    cant_colab: number | null;
}

interface TipoPlanData {
    duracion_mes: number;
    precio: number;
    plan: PlanData;
    caracteristica: CaracteristicaData;
}

interface EstadoData {
    nombre: string;
}

// Nuevo tipo para un plan individual (TipoPlan)
export interface TipoPlanFull {
    id: string;
    duracion_mes: number;
    precio: number;
    codigo: string;
    plan: PlanData;
    caracteristica: CaracteristicaData;
}

// Interfaz para la respuesta de error 404 con datos adjuntos
export interface PlanesDisponiblesResponse {
    detail: string;
    planes_disponibles: TipoPlanFull[];
}

export interface SuscripcionData {
    // ... (campos de suscripción)
    plan: TipoPlanFull; // Plan ahora es TipoPlanFull
}

export interface SuscripcionData {
    id: string;
    fecha_inicio: string;
    fecha_fin: string;
    codigo: string;
    dia_restante: number;
    empresa_disponible: number | null;
    colab_disponible: number | null;
    estado: EstadoData;
    plan: TipoPlanData; //Este objeto contiene todo
}

// Request para el pago
export interface PaymentRequest {
    tipo_plan_id: string; // ID del TipoPlan
    card_number: string;
    card_expiry: string;
    card_cvv: string;
}

// Response al completar la suscripción
export interface SubscriptionSuccessResponse {
    id: string;
    fecha_inicio: string; // ISO format string
    fecha_fin: string; // ISO format string
    codigo: string;
    plan_nombre: string;
    fecha_fin_formateada: string; // Puede ser un campo extra del serializer
}