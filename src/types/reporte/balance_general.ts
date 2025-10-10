export interface BalanceCuenta {
  codigo: number;
  nombre: string;
  total_debe: number;
  total_haber: number;
  saldo: number;
  hijos?: BalanceCuenta[];
}
