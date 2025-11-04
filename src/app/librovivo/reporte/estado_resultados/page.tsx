"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import {
  EstadoResultadoCuenta,
  EstadoResultadosResponse,
} from "@/types/reporte/estado_resultado";

// Formateador de moneda colombiana
const formatCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$ 0.00";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Función recursiva para renderizar cuentas con jerarquía
function renderCuenta(
  cuenta: EstadoResultadoCuenta,
  level = 0
): React.ReactElement {
  const indent = level * 20;
  const isTopLevel = level === 0;
  const hasChildren = cuenta.hijos && cuenta.hijos.length > 0;

  // Determinar estilo según el nivel
  let bgClass = "";
  let fontClass = "";
  let borderClass = "border-b";

  if (isTopLevel) {
    bgClass = "bg-purple-50";
    fontClass = "font-bold text-purple-900";
  } else if (level === 1) {
    bgClass = "bg-purple-25";
    fontClass = "font-semibold text-gray-800";
  } else if (level === 2) {
    fontClass = "font-medium text-gray-700";
  } else if (!hasChildren) {
    // Resaltar cuentas finales (hojas sin hijos)
    fontClass = "text-gray-800";
    bgClass = "bg-green-50/30";
  } else {
    fontClass = "text-gray-600";
  }

  return (
    <div key={`${cuenta.codigo}-${level}`}>
      {/* Fila principal de la cuenta */}
      <div
        className={`grid grid-cols-4 gap-4 py-2.5 px-4 ${borderClass} hover:bg-gray-50 transition-colors ${bgClass} ${fontClass}`}
        style={{ paddingLeft: `${indent + 16}px` }}
      >
        <div className="col-span-2 flex items-center gap-2">
          {hasChildren && (
            <span className="text-gray-400 text-xs flex-shrink-0">▼</span>
          )}
          {!hasChildren && (
            <span className="text-green-600 text-xs flex-shrink-0">●</span>
          )}
          <span className="text-sm break-words">
            <span className="font-mono">{cuenta.codigo}</span> - {cuenta.nombre}
          </span>
        </div>
        <div className="text-right text-sm font-mono">
          {formatCurrency(cuenta.total_debe)}
        </div>
        <div className="text-right text-sm font-mono">
          {formatCurrency(cuenta.total_haber)}
        </div>
      </div>

      {/* Renderizar hijos recursivamente */}
      {hasChildren &&
        cuenta.hijos!.map((hijo) => renderCuenta(hijo, level + 1))}
    </div>
  );
}

export default function EstadoResultadosPage() {
  const [fechaInicio, setFechaInicio] = useState("2010-01-01");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [fechaFin, setFechaFin] = useState(todayStr);
  const [soloConMovimiento, setSoloConMovimiento] = useState(false);

  // Estados para fechas aplicadas (las que se usan en la consulta)
  const [fechaInicioAplicada, setFechaInicioAplicada] = useState("2010-01-01");
  const [fechaFinAplicada, setFechaFinAplicada] = useState(todayStr);

  const { data, error, isLoading } = useSWR<EstadoResultadosResponse>(
    `/api/reporte/estado_resultados/?fecha_inicio=${fechaInicioAplicada}&fecha_fin=${fechaFinAplicada}`,
    apiFetcher
  );

  // Función para generar el reporte
  const handleGenerar = () => {
    setFechaInicioAplicada(fechaInicio);
    setFechaFinAplicada(fechaFin);
  };

  // Función para exportar a PDF
  const handleExportarPDF = async () => {
    try {
      const response = await fetch(
        `/api/reporte/estado_resultados/export/pdf/?fecha_inicio=${fechaInicioAplicada}&fecha_fin=${fechaFinAplicada}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Error al exportar el PDF");
      }

      // Obtener el blob del PDF
      const blob = await response.blob();

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estado_resultados_${fechaInicioAplicada}_${fechaFinAplicada}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Error al exportar el PDF. Por favor, intenta nuevamente.");
    }
  }; // Helper: número seguro
  const num = (v: any) => parseFloat(v?.toString?.() ?? "0") || 0;

  // Filtrar árbol para mostrar solo cuentas con movimiento
  const filtrarArregloPorMovimiento = (
    arr: EstadoResultadoCuenta[]
  ): EstadoResultadoCuenta[] => {
    const filtrarNodo = (
      n: EstadoResultadoCuenta
    ): EstadoResultadoCuenta | null => {
      const hijos = n.hijos ?? [];
      const hijosFiltrados = hijos
        .map(filtrarNodo)
        .filter((x): x is EstadoResultadoCuenta => Boolean(x));

      const tieneMovimientoDirecto =
        Math.abs(num(n.total_debe)) > 0.0001 ||
        Math.abs(num(n.total_haber)) > 0.0001 ||
        Math.abs(num(n.net)) > 0.0001;

      if (tieneMovimientoDirecto || hijosFiltrados.length > 0) {
        return {
          ...n,
          hijos: hijosFiltrados.length > 0 ? hijosFiltrados : undefined,
        };
      }
      return null;
    };

    return arr
      .map(filtrarNodo)
      .filter((x): x is EstadoResultadoCuenta => Boolean(x));
  };

  // Clasificar cuentas por tipo (Ingresos=4, Costos/Gastos=5)
  const clasificadas = useMemo(() => {
    if (!data?.data) return { ingresos: [], costosGastos: [] };

    return {
      ingresos: data.data.filter((c) => String(c.codigo).startsWith("4")),
      costosGastos: data.data.filter((c) => String(c.codigo).startsWith("5")),
    };
  }, [data]);

  const clasificadasFuente = useMemo(() => {
    if (!soloConMovimiento) return clasificadas;
    return {
      ingresos: filtrarArregloPorMovimiento(clasificadas.ingresos),
      costosGastos: filtrarArregloPorMovimiento(clasificadas.costosGastos),
    };
  }, [clasificadas, soloConMovimiento]);

  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <h3 className="font-semibold mb-2">
            Error al cargar el Estado de Resultados
          </h3>
          <p className="text-sm">{error.message || "Error desconocido"}</p>
        </div>
      </div>
    );

  if (isLoading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Estado de Resultados...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Estado de Resultados
          </h1>
          <p className="text-sm text-gray-600">
            Análisis de ingresos, costos y gastos del período
          </p>
        </div>
        <button
          onClick={handleExportarPDF}
          disabled={isLoading || !data}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Filtros de Búsqueda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerar}
              className="w-full px-6 py-2 bg-primario text-white hover:bg-secundario rounded-md transition-colors font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Generar
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFechaInicio("2010-01-01");
                setFechaFin(todayStr);
                setFechaInicioAplicada("2010-01-01");
                setFechaFinAplicada(todayStr);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Restablecer
            </button>
          </div>
        </div>
        <div className="flex items-center pt-2 border-t">
          <input
            id="solo-mov"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            checked={soloConMovimiento}
            onChange={(e) => setSoloConMovimiento(e.target.checked)}
          />
          <label
            htmlFor="solo-mov"
            className="ml-2 text-sm text-gray-700 select-none cursor-pointer"
          >
            Mostrar solo cuentas con movimiento
          </label>
        </div>
      </div>

      {/* Resumen de utilidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium mb-1">
            Total Ingresos
          </p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(data?.total_ingresos || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium mb-1">
            Total Costos y Gastos
          </p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(data?.total_costos || 0)}
          </p>
        </div>
        <div
          className={`bg-gradient-to-br rounded-lg p-4 border ${
            (data?.utilidad || 0) >= 0
              ? "from-blue-50 to-blue-100 border-blue-200"
              : "from-orange-50 to-orange-100 border-orange-200"
          }`}
        >
          <p
            className={`text-sm font-medium mb-1 ${
              (data?.utilidad || 0) >= 0 ? "text-blue-700" : "text-orange-700"
            }`}
          >
            {(data?.utilidad || 0) >= 0
              ? "Utilidad del Período"
              : "Pérdida del Período"}
          </p>
          <p
            className={`text-2xl font-bold ${
              (data?.utilidad || 0) >= 0 ? "text-blue-900" : "text-orange-900"
            }`}
          >
            {formatCurrency(data?.utilidad || 0)}
          </p>
        </div>
      </div>

      {/* Tabla de Estado de Resultados */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header de la tabla */}
        <div className="grid grid-cols-4 gap-4 bg-gray-800 text-white py-3 px-4 font-semibold text-sm">
          <div className="col-span-2">Cuenta</div>
          <div className="text-right">Total Debe</div>
          <div className="text-right">Total Haber</div>
        </div>

        {/* Sección Ingresos */}
        {clasificadasFuente.ingresos.length > 0 && (
          <div>
            <div className="bg-green-100 px-4 py-2 font-bold text-green-900">
              INGRESOS
            </div>
            {clasificadasFuente.ingresos.map((cuenta) =>
              renderCuenta(cuenta, 0)
            )}
            <div className="grid grid-cols-4 gap-4 bg-green-50 py-3 px-4 font-semibold border-t">
              <div className="col-span-2">TOTAL INGRESOS</div>
              <div className="text-right"></div>
              <div className="text-right font-mono text-green-700">
                {formatCurrency(data?.total_ingresos || 0)}
              </div>
            </div>
          </div>
        )}

        {/* Sección Costos y Gastos */}
        {clasificadasFuente.costosGastos.length > 0 && (
          <div>
            <div className="bg-red-100 px-4 py-2 font-bold text-red-900 border-t">
              COSTOS Y GASTOS
            </div>
            {clasificadasFuente.costosGastos.map((cuenta) =>
              renderCuenta(cuenta, 0)
            )}
            <div className="grid grid-cols-4 gap-4 bg-red-50 py-3 px-4 font-semibold border-t">
              <div className="col-span-2">TOTAL COSTOS Y GASTOS</div>
              <div className="text-right font-mono text-red-700">
                {formatCurrency(data?.total_costos || 0)}
              </div>
              <div className="text-right"></div>
            </div>
          </div>
        )}

        {/* Fila de utilidad/pérdida */}
        <div
          className={`grid grid-cols-4 gap-4 py-4 px-4 font-bold border-t-2 ${
            (data?.utilidad || 0) >= 0
              ? "bg-blue-900 text-white"
              : "bg-orange-900 text-white"
          }`}
        >
          <div className="col-span-2">
            {(data?.utilidad || 0) >= 0
              ? "UTILIDAD DEL PERÍODO"
              : "PÉRDIDA DEL PERÍODO"}
          </div>
          <div className="text-right"></div>
          <div className="text-right font-mono">
            {formatCurrency(data?.utilidad || 0)}
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay datos */}
      {!isLoading && data?.data.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No se encontraron cuentas
          </h3>
          <p className="text-sm text-gray-500">
            No hay movimientos registrados en el rango de fechas seleccionado
          </p>
        </div>
      )}
    </div>
  );
}
