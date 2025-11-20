interface AiPrediction {
  success: boolean;
  debe: string;      // Código de cuenta (ej: "52101")
  haber: string;     // Código de cuenta (ej: "11103")
  monto: string;
  moneda: string;
  confianza: number;
  error?: string;
}

export type { AiPrediction };