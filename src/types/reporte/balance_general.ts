export interface BalanceCuenta {
  codigo: number | string;
  nombre: string;
  total_debe: number;
  total_haber: number;
  saldo: number;
  hijos?: BalanceCuenta[];
}
