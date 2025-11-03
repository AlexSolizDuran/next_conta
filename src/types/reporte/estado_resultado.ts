export interface EstadoResultadoCuenta {
  codigo: number | string;
  nombre: string;
  total_debe: number;
  total_haber: number;
  saldo: number;
  net: number;
  hijos?: EstadoResultadoCuenta[];
}

export interface EstadoResultadosResponse {
  data: EstadoResultadoCuenta[];
  total_ingresos: number;
  total_costos: number;
  utilidad: number;
}
