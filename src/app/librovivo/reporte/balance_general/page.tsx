"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { BalanceCuenta } from "@/types/reporte/balance_general";

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
function renderCuenta(cuenta: BalanceCuenta, level = 0): React.ReactElement {
  const indent = level * 20;
  const isTopLevel = level === 0;
  const hasChildren = cuenta.hijos && cuenta.hijos.length > 0;

  // Determinar estilo según el nivel
  let bgClass = "";
  let fontClass = "";
  let borderClass = "border-b";

  if (isTopLevel) {
    bgClass = "bg-blue-50";
    fontClass = "font-bold text-blue-900";
  } else if (level === 1) {
    bgClass = "bg-blue-25";
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
        className={`grid grid-cols-5 gap-4 py-2.5 px-4 ${borderClass} hover:bg-gray-50 transition-colors ${bgClass} ${fontClass}`}
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
        <div
          className={`text-right text-sm font-mono ${
            parseFloat(cuenta.saldo.toString()) < 0
              ? "text-red-600 font-semibold"
              : "text-green-600 font-semibold"
          }`}
        >
          {formatCurrency(cuenta.saldo)}
        </div>
      </div>

      {/* Renderizar hijos recursivamente */}
      {hasChildren &&
        cuenta.hijos!.map((hijo) => renderCuenta(hijo, level + 1))}
    </div>
  );
}

export default function BalanceGeneralPage() {
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

  const { data, error, isLoading } = useSWR<BalanceCuenta[]>(
    `/api/reporte/balance_general/?fecha_inicio=${fechaInicioAplicada}&fecha_fin=${fechaFinAplicada}`,
    apiFetcher
  );
  // --- ¡DEBUG POINT 1: MIRA AQUÍ! ---
  // Esto te mostrará en la consola del navegador los datos tal como llegaron
  console.log("Datos recibidos de la API (data):", data);
  // --- FIN DEBUG ---
  // Función para generar el reporte
  const handleGenerar = () => {
    setFechaInicioAplicada(fechaInicio);
    setFechaFinAplicada(fechaFin);
  };

  // Función para exportar a PDF
  const handleExportarPDF = async () => {
    try {
      const response = await fetch(
        `/api/reporte/balance_general/export/pdf/?fecha_inicio=${fechaInicioAplicada}&fecha_fin=${fechaFinAplicada}`,
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
      a.download = `balance_general_${fechaInicioAplicada}_${fechaFinAplicada}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Error al exportar el PDF. Por favor, intenta nuevamente.");
    }
  };

  // Calcular totales generales (solo raíces para evitar doble conteo)
  const totales = useMemo(() => {
    if (!data) return { debe: 0, haber: 0, saldo: 0 };

    const num = (v: any) => parseFloat(v?.toString?.() ?? "0") || 0;

    const totalDebe = data.reduce((acc, c) => acc + num(c.total_debe), 0);
    const totalHaber = data.reduce((acc, c) => acc + num(c.total_haber), 0);

    return {
      debe: totalDebe,
      haber: totalHaber,
      saldo: totalDebe - totalHaber,
    };
  }, [data]);

  // Clasificar cuentas por tipo (Activo=1, Pasivo=2, Patrimonio=3)
  const clasificadas = useMemo(() => {
    if (!data) return { activos: [], pasivos: [], patrimonio: [] };

    return {
      activos: data.filter((c) => c.codigo === 1),
      pasivos: data.filter((c) => c.codigo === 2),
      patrimonio: data.filter((c) => c.codigo === 3),
    };
  }, [data]);

  // Helper: número seguro
  const num = (v: any) => parseFloat(v?.toString?.() ?? "0") || 0;

  // Filtrar árbol para mostrar solo cuentas con movimiento (y sus ancestros)
  const filtrarArregloPorMovimiento = (
    arr: BalanceCuenta[]
  ): BalanceCuenta[] => {
    const filtrarNodo = (n: BalanceCuenta): BalanceCuenta | null => {
      const hijos = n.hijos ?? [];
      const hijosFiltrados = hijos
        .map(filtrarNodo)
        .filter((x): x is BalanceCuenta => Boolean(x));

      const tieneMovimientoDirecto =
        Math.abs(num(n.total_debe)) > 0.0001 ||
        Math.abs(num(n.total_haber)) > 0.0001 ||
        Math.abs(num(n.saldo)) > 0.0001;

      // Mantener el nodo si tiene movimiento o si alguno de sus hijos lo tiene
      if (tieneMovimientoDirecto || hijosFiltrados.length > 0) {
        return {
          ...n,
          hijos: hijosFiltrados.length > 0 ? hijosFiltrados : undefined,
        };
      }
      return null;
    };

    return arr.map(filtrarNodo).filter((x): x is BalanceCuenta => Boolean(x));
  };

  const clasificadasFuente = useMemo(() => {
    if (!soloConMovimiento) return clasificadas;
    return {
      activos: filtrarArregloPorMovimiento(clasificadas.activos),
      pasivos: filtrarArregloPorMovimiento(clasificadas.pasivos),
      patrimonio: filtrarArregloPorMovimiento(clasificadas.patrimonio),
    };
  }, [clasificadas, soloConMovimiento]);

  // Totales por grupo y verificación de cuadre: Activos vs (Pasivos + Patrimonio)
  const totalesGrupos = useMemo(() => {
    if (!data)
      return { activos: 0, pasivos: 0, patrimonio: 0, pasivosPatrimonio: 0 };

    // Importante: solo sumar saldos de las raíces (cada raíz ya incluye su subárbol)
    const sumRoots = (arr: BalanceCuenta[]) =>
      arr.reduce((acc, c) => acc + num(c.saldo), 0);

    const activos = sumRoots(clasificadas.activos);
    const pasivosBruto = sumRoots(clasificadas.pasivos);
    const patrimonioBruto = sumRoots(clasificadas.patrimonio) ;

    // Si el backend define saldo = debe - haber, los pasivos/patrimonio suelen ser negativos.
    const pasivos = Math.abs(pasivosBruto);
    const patrimonio = Math.abs(patrimonioBruto);
    // --- ¡DEBUG POINT 2: MIRA AQUÍ! ---
    console.log("================ DEBUG FRONTEND ================");
    console.log("Data de Activos:", clasificadas.activos);
    console.log("Data de Pasivos:", clasificadas.pasivos);
    console.log("Data de Patrimonio:", clasificadas.patrimonio);
    console.log("------------------------------------------------");
    console.log("Total Saldo Activos (Calculado):", activos);
    console.log("Total Saldo Pasivos (Bruto):", pasivosBruto);
    console.log("Total Saldo Patrimonio (Bruto):", patrimonioBruto); // <-- Este es el valor que sospechamos
    console.log("================================================");
    // --- FIN DEBUG ---
    return {
      activos,
      pasivos,
      patrimonio,
      pasivosPatrimonio: pasivos + patrimonio,
    };
  }, [data, clasificadas]);

  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <h3 className="font-semibold mb-2">
            Error al cargar el Balance General
          </h3>
          <p className="text-sm">{error.message || "Error desconocido"}</p>
        </div>
      </div>
    );

  if (isLoading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Balance General...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Balance General
          </h1>
          <p className="text-sm text-gray-600">
            Resumen de activos, pasivos y patrimonio
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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

      {/* Totales generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium mb-1">Total Debe</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totales.debe)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium mb-1">
            Total Haber
          </p>
          <p className="text-2xl font-bold text-purple-900">
            {formatCurrency(totales.haber)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium mb-1">Saldo Total</p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(totales.saldo)}
          </p>
        </div>
      </div>

      {/* Cuadre del balance: Activos vs Pasivos + Patrimonio */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Activos</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalesGrupos.activos)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Total Pasivos + Patrimonio
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalesGrupos.pasivosPatrimonio)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Diferencia</p>
              <p
                className={`text-xl font-bold ${
                  Math.abs(
                    totalesGrupos.activos - totalesGrupos.pasivosPatrimonio
                  ) < 0.01
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {formatCurrency(
                  Math.abs(
                    totalesGrupos.activos - totalesGrupos.pasivosPatrimonio
                  )
                )}
              </p>
            </div>
          </div>
          <div>
            {Math.abs(totalesGrupos.activos - totalesGrupos.pasivosPatrimonio) <
            0.01 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Cuadra
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                No cuadra
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Balance General */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header de la tabla */}
        <div className="grid grid-cols-5 gap-4 bg-gray-800 text-white py-3 px-4 font-semibold text-sm">
          <div className="col-span-2">Cuenta</div>
          <div className="text-right">Total Debe</div>
          <div className="text-right">Total Haber</div>
          <div className="text-right">Saldo</div>
        </div>

        {/* Sección Activos */}
        {clasificadasFuente.activos.length > 0 && (
          <div>
            <div className="bg-blue-100 px-4 py-2 font-bold text-blue-900">
              ACTIVOS
            </div>
            {clasificadasFuente.activos.map((cuenta) =>
              renderCuenta(cuenta, 0)
            )}
          </div>
        )}

        {/* Sección Pasivos */}
        {clasificadasFuente.pasivos.length > 0 && (
          <div>
            <div className="bg-orange-100 px-4 py-2 font-bold text-orange-900 border-t">
              PASIVOS
            </div>
            {clasificadasFuente.pasivos.map((cuenta) =>
              renderCuenta(cuenta, 0)
            )}
          </div>
        )}

        {/* Sección Patrimonio */}
        {clasificadasFuente.patrimonio.length > 0 && (
          <div>
            <div className="bg-green-100 px-4 py-2 font-bold text-green-900 border-t">
              PATRIMONIO
            </div>
            {clasificadasFuente.patrimonio.map((cuenta) =>
              renderCuenta(cuenta, 0)
            )}
          </div>
        )}

        {/* Fila de totales */}
        <div className="grid grid-cols-5 gap-4 bg-gray-900 text-white py-4 px-4 font-bold border-t-2">
          <div className="col-span-2">TOTALES</div>
          <div className="text-right font-mono">
            {formatCurrency(totales.debe)}
          </div>
          <div className="text-right font-mono">
            {formatCurrency(totales.haber)}
          </div>
          <div className="text-right font-mono">
            {formatCurrency(totales.saldo)}
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay datos */}
      {!isLoading && data?.length === 0 && (
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
