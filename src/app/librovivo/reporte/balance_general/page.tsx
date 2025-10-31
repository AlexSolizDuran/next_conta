"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { BalanceCuenta } from "@/types/reporte/balance_general"; // define el tipo

function renderCuenta(cuenta: BalanceCuenta, level = 0) {
  return (
    <div key={cuenta.codigo} className="pl-4 border-b border-gray-200">
      <div className={`flex justify-between py-1 ${level === 0 ? "font-bold" : ""}`}>
        <span style={{ paddingLeft: `${level * 20}px` }}>
          {cuenta.codigo} - {cuenta.nombre}
        </span>
        <span>Debe: {cuenta.total_debe}</span>
        <span>Haber: {cuenta.total_haber}</span>
        <span>Saldo: {cuenta.saldo}</span>
      </div>
      {cuenta.hijos?.map((hijo) => renderCuenta(hijo, level + 1))}
    </div>
  );
}

export default function BalanceGeneralPage() {
  // Fecha de inicio fija en 2010-01-01
  const [fechaInicio, setFechaInicio] = useState("2010-01-01");

  // Fecha fin = hoy en formato yyyy-mm-dd
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Mes 0-index
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [fechaFin, setFechaFin] = useState(todayStr);

  const { data, error, isLoading } = useSWR<BalanceCuenta[]>(
    `/api/reporte/balance_general/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
    apiFetcher
  );

  if (error)
    return (
      <div className="p-6 text-red-500">
        Error al cargar el Balance General: {error.message}
      </div>
    );

  if (isLoading) return <div className="p-6">Cargando Balance General...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Balance General</h1>

      {/* Filtro por fecha */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Fecha Inicio</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha Fin</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Balance General */}
      <div className="border rounded shadow bg-white">
        {data?.map((cuenta) => renderCuenta(cuenta))}
      </div>

      {!isLoading && data?.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No se encontraron cuentas.
        </div>
      )}
    </div>
  );
}
