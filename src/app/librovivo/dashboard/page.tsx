"use client";
import React, { useState, useEffect } from "react";
// import { apiFetcher } from "@/lib/apiFetcher"; // Eliminado, no utilizado

type Interpretacion = {
  tipo_reporte?:
    | "balance_general"
    | "estado_resultados"
    | "libro_mayor"
    | "libro_diario"
    | string;
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion_interpretada?: string;
};

type ReporteResponse = {
  success: boolean;
  solicitud_original?: string;
  interpretacion?: Interpretacion;
  reporte?: any;
  fecha_generacion?: string;
  empresa?: string;
  error?: string; // Añadido para mejor manejo de errores de Django
};

const ENDPOINT = "/api/reporteia";

const EXAMPLES: { title: string; tipo: string; text: string }[] = [
  {
    title: "Balance General (Año)",
    tipo: "balance_general",
    text: "Generar un balance general del año 2025 al día de hoy.",
  },
  {
    title: "Estado de Resultados",
    tipo: "estado_resultados",
    text: "Genera un estado de resultados para el periodo actual",
  },
  {
    title: "Libro Mayor (Cuenta 1105)",
    tipo: "libro_mayor",
    text: "Muéstrame el libro mayor de la cuenta 1105 (Caja) de los últimos 30 días",
  },
  {
    title: "Libro Diario (Últimos 30 días)",
    tipo: "libro_diario",
    text: "Genera los asientos del libro diario de los últimos 30 días",
  },
];

export default function Page(): React.ReactElement {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ReporteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const validate = (t: string) => t.trim().length >= 10;

  const handleExampleClick = (text: string) => {
    setInput(text);
    setError(null);
    setNotice("Ejemplo cargado en el campo de solicitud");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setResult(null);

    if (!validate(input)) {
      setError("La solicitud debe tener al menos 10 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // El manejo del token lo realiza el proxy de Next.js
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto_solicitud: input }),
      });

      const data: ReporteResponse = await res.json();

      if (!res.ok || !data.success) {
        const errorMessage =
          data.error ||
          `El backend indicó fallo al generar el reporte: ${res.statusText}.`;
        throw new Error(errorMessage);
      }

      setResult(data);
      setNotice("Reporte generado satisfactoriamente");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error de comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (v: any) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v ?? "";
    return n.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  };

  // Función auxiliar para obtener el total de las cuentas en una lista de clases
  const getTotalFromClases = (rows: any[]) => {
    return rows.reduce(
      (acc: number, r: any) => acc + (Number(r.total) || 0),
      0
    );
  };

  const exportPDF = async () => {
    if (!result) {
      setError("No hay reporte para exportar.");
      return;
    }
    try {
      const jsPDFModule: any = await import("jspdf");
      const jsPDFConstructor =
        jsPDFModule?.jsPDF ?? jsPDFModule?.default ?? jsPDFModule;
      const doc = new jsPDFConstructor({ unit: "pt", format: "a4" });
      const margin = 40;
      let y = margin;
      doc.setFontSize(12);
      doc.text(
        `Reporte: ${
          result.interpretacion?.tipo_reporte || result.reporte?.tipo || "-"
        }`,
        margin,
        y
      );
      y += 18;
      doc.text(`Empresa: ${result.empresa || "-"}`, margin, y);
      y += 16;
      doc.text(
        `Fecha generación: ${
          result.fecha_generacion
            ? new Date(result.fecha_generacion).toLocaleString()
            : "-"
        }`,
        margin,
        y
      );
      y += 20;
      doc.setFontSize(11);
      doc.text("Solicitud original:", margin, y);
      y += 14;
      const lines = doc.splitTextToSize(
        result.solicitud_original || input || "",
        520
      );
      doc.text(lines, margin, y);
      y += lines.length * 12 + 8;

      const tipo = result.reporte?.tipo || result.interpretacion?.tipo_reporte;

      // === CORRECCIÓN MÍNIMA DE ESTRUCTURA PARA PDF (Balance General) ===
      if (tipo === "balance_general") {
        ["activos", "pasivos", "patrimonio"].forEach((sec) => {
          if (y > 700) {
            doc.addPage();
            y = margin;
          }
          doc.setFontSize(12);
          doc.text(sec.toUpperCase(), margin, y);
          y += 16;
          const rows = result.reporte?.[sec] || [];

          rows.forEach((r: any) => {
            // Renderizar la clase (Nivel 1)
            const classLine = `${r.codigo} - ${
              r.nombre
            } | TOTAL: ${formatNumber(r.total)}`;
            const classLines = doc.splitTextToSize(classLine, 520);
            doc.text(classLines, margin, y);
            y += classLines.length * 12;

            // Renderizar las cuentas anidadas (Nivel 2)
            (r.cuentas || []).forEach((c: any) => {
              // FIX: Asegurar que se accede a la propiedad de cadena, no al objeto
              const accountLine = `    - ${c.codigo} ${
                c.nombre
              }: ${formatNumber(c.saldo)}`;
              const accountLines = doc.splitTextToSize(accountLine, 500);
              doc.text(accountLines, margin + 10, y);
              y += accountLines.length * 10;
            });

            if (y > 720) {
              doc.addPage();
              y = margin;
            }
          });
          y += 8;
        });
      } else {
        // === FIN CORRECCIÓN MÍNIMA DE ESTRUCTURA PARA PDF ===
        if (y > 700) {
          doc.addPage();
          y = margin;
        }
        doc.text("Resumen del reporte (JSON):", margin, y);
        y += 14;
        const json = JSON.stringify(result.reporte || {}, null, 2);
        const jlines = doc.splitTextToSize(json, 520);
        doc.text(jlines, margin, y);
      }

      doc.save(`reporte_${tipo || "generico"}_${Date.now()}.pdf`);
      setNotice("PDF generado");
    } catch (err) {
      console.error(err);
      setError("Error al exportar PDF.");
    }
  };

  const exportExcel = async () => {
    if (!result) {
      setError("No hay reporte para exportar.");
      return;
    }
    try {
      const XLSXModule: any = await import("xlsx");
      const XLSX = XLSXModule?.default ?? XLSXModule;
      const FileSaverModule: any = await import("file-saver");
      const saveAs =
        FileSaverModule?.saveAs ?? FileSaverModule?.default ?? FileSaverModule;

      const wb = XLSX.utils.book_new();
      const tipo = result.reporte?.tipo || result.interpretacion?.tipo_reporte;

      // === CORRECCIÓN MÍNIMA DE ESTRUCTURA PARA EXCEL (Balance General) ===
      if (tipo === "balance_general") {
        ["activos", "pasivos", "patrimonio"].forEach((sec) => {
          const arr = result.reporte?.[sec] || [];
          let finalRows: any[] = [];

          // Reestructurar para Excel (Clase + Cuentas)
          arr.forEach((clase: any) => {
            // Fila de total de la Clase
            finalRows.push({
              Código: clase.codigo,
              Nombre: clase.nombre,
              Tipo: "CLASE",
              Total: clase.total,
              Saldo: "",
            });

            // Filas de las Cuentas
            (clase.cuentas || []).forEach((cuenta: any) => {
              // FIX: Asegurar que se accede a la propiedad de cadena, no al objeto
              finalRows.push({
                Código: cuenta.codigo,
                Nombre: cuenta.nombre,
                Tipo: "CUENTA",
                Total: "",
                Saldo: cuenta.saldo,
              });
            });
          });

          const ws = XLSX.utils.json_to_sheet(finalRows);
          XLSX.utils.book_append_sheet(wb, ws, sec.substring(0, 31));
        });
        // === FIN CORRECCIÓN MÍNIMA DE ESTRUCTURA PARA EXCEL ===
      } else if (tipo === "estado_resultados") {
        const rows = result.reporte?.items || [];
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "EstadoResultados");
      } else if (tipo === "libro_mayor") {
        const cuentas = result.reporte?.cuentas || [];
        cuentas.forEach((c: any) => {
          const movimientos = c.movimientos || [];
          const rows = movimientos.map((m: any) => ({
            Fecha: m.fecha,
            Asiento: m.asiento, // Agregado Asiento para mejor detalle
            Referencia: m.referencia,
            Descripcion: m.descripcion,
            Debe: m.debe,
            Haber: m.haber,
          }));
          const ws = XLSX.utils.json_to_sheet(rows);
          XLSX.utils.book_append_sheet(
            wb,
            ws,
            // FIX: Acceder a la cuenta o al código
            (c.cuenta?.codigo || c.codigo || "Cuenta").substring(0, 31)
          );
        });
      } else if (tipo === "libro_diario") {
        const asientos = result.reporte?.asientos || [];
        let finalRows: any[] = [];
        asientos.forEach((a: any) => {
          (a.movimientos || []).forEach((m: any) => {
            finalRows.push({
              Asiento: a.numero,
              Fecha: a.fecha,
              Descripcion_Asiento: a.descripcion,
              Cuenta_Codigo: m.cuenta_codigo,
              Cuenta_Nombre: m.cuenta_nombre,
              Referencia: m.referencia,
              Debe: m.debe,
              Haber: m.haber,
            });
          });
        });

        const ws = XLSX.utils.json_to_sheet(finalRows);
        XLSX.utils.book_append_sheet(wb, ws, "LibroDiario");
      } else {
        const ws = XLSX.utils.json_to_sheet([result.reporte || {}]);
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
      }

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `reporte_${tipo || "generico"}_${Date.now()}.xlsx`
      );
      setNotice("Excel generado");
    } catch (err) {
      console.error(err);
      setError("Error al exportar Excel.");
    }
  };

  const renderBalanceGeneral = (reporte: any) => {
    return (
      <div className="space-y-4">
        {["activos", "pasivos", "patrimonio"].map((sec) => {
          const rows = reporte?.[sec] || [];
          const totalSection = getTotalFromClases(rows);

          return (
            <div key={sec} className="bg-white border rounded shadow-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold uppercase">{sec}</h4>
                <div className="font-mono text-sm">
                  Total: {formatNumber(totalSection)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-600">
                    <tr>
                      <th className="py-1 w-1/3">Clase / Cuenta</th>
                      <th className="py-1 w-1/3 text-right">Total Clase</th>
                      <th className="py-1 w-1/3 text-right">Saldo Cuenta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* FIX: Usar React.Fragment con key o un div con key fuera del tbody,
												 pero como estamos en tbody, usamos React.Fragment con key
										*/}
                    {rows.map((clase: any, i: number) => (
                      <React.Fragment key={clase.codigo}>
                        {/* Fila de la Clase (Nivel 1) */}
                        <tr className="bg-blue-50/50 font-semibold border-b">
                          <td className="py-2 px-3">
                            {clase.nombre} ({clase.codigo})
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-blue-800">
                            {formatNumber(clase.total)}
                          </td>
                          <td className="py-2 px-3 text-right"></td>
                        </tr>

                        {/* Sub-Filas para las Cuentas (Nivel 2) */}
                        {(clase.cuentas || []).map((cuenta: any, j: number) => (
                          <tr
                            key={`${clase.codigo}-${cuenta.codigo}`}
                            className="text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                          >
                            <td className="py-1 px-3 pl-8 text-xs">
                              {cuenta.nombre} ({cuenta.codigo})
                            </td>
                            <td className="py-1 px-3 text-right"></td>
                            <td className="py-1 px-3 text-right font-mono text-sm">
                              {formatNumber(cuenta.saldo)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEstadoResultados = (reporte: any) => {
    const ingresosDetalle = reporte?.ingresos?.detalle || [];
    const costosGastosDetalle = reporte?.costos_gastos?.detalle || [];

    const utilityRows = [
      {
        concepto: "Utilidad Bruta",
        valor: reporte.utilidad_bruta,
        isTotal: true,
      },
      {
        concepto: "Utilidad Operacional",
        valor: reporte.utilidad_operacional,
        isTotal: true,
      },
      {
        concepto: "Utilidad Neta",
        valor: reporte.utilidad_neta,
        isTotal: true,
      },
    ];

    return (
      <div className="bg-white border rounded shadow-sm p-4">
        <h4 className="font-semibold text-lg mb-4">
          Estado de Resultados
          <span className="text-sm text-gray-500 font-normal ml-2">
            {reporte.periodo?.inicio} a {reporte.periodo?.fin}
          </span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2">Concepto</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-green-50/50 font-bold border-t">
                <td className="py-2">
                  INGRESOS (Total: {formatNumber(reporte.ingresos?.total)})
                </td>
                <td className="py-2 text-right"></td>
              </tr>
              {ingresosDetalle.map((it: any, i: number) => (
                <tr key={`ing-${i}`} className="border-b hover:bg-gray-50">
                  <td className="py-1 pl-4">
                    {it.clase.nombre} ({it.clase.codigo})
                  </td>
                  <td className="py-1 text-right font-mono">
                    {formatNumber(it.total)}
                  </td>
                </tr>
              ))}

              <tr className="bg-red-50/50 font-bold border-t mt-3">
                <td className="py-2">
                  COSTOS Y GASTOS (Total:{" "}
                  {formatNumber(reporte.costos_gastos?.total)})
                </td>
                <td className="py-2 text-right"></td>
              </tr>
              {costosGastosDetalle.map((it: any, i: number) => (
                <tr key={`gas-${i}`} className="border-b hover:bg-gray-50">
                  <td className="py-1 pl-4">
                    {it.clase.nombre} ({it.clase.codigo})
                  </td>
                  <td className="py-1 text-right font-mono">
                    {formatNumber(it.total)}
                  </td>
                </tr>
              ))}

              {utilityRows.map((row, i) => (
                <tr
                  key={`util-${i}`}
                  className="border-t font-extrabold bg-blue-50/50"
                >
                  <td className="py-2">{row.concepto}</td>
                  <td className="py-2 text-right font-mono text-blue-900">
                    {formatNumber(row.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLibroMayor = (reporte: any) => {
    const cuentas = reporte?.cuentas || [];
    return (
      <div className="space-y-4">
        {cuentas.map((c: any, idx: number) => (
          <div key={idx} className="bg-white border rounded shadow-sm">
            <div className="p-3 bg-gray-100 border-b flex flex-col sm:flex-row sm:items-center justify-between">
              <h4 className="font-semibold text-base">
                {c.cuenta?.codigo ?? c.codigo ?? ""} —{" "}
                {c.cuenta?.nombre ?? c.nombre ?? ""}
              </h4>
              <div className="text-sm">
                Saldo Final:{" "}
                <span className="font-mono font-bold text-lg text-blue-800">
                  {formatNumber(c.saldo_final)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs p-3 border-b text-gray-600">
              <span className="font-semibold">
                Saldo Inicial: {formatNumber(c.saldo_inicial)}
              </span>
              <span className="font-semibold">
                Total Debe: {formatNumber(c.total_debe)}
              </span>
              <span className="font-semibold">
                Total Haber: {formatNumber(c.total_haber)}
              </span>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600">
                  <tr>
                    <th className="py-1 px-3">Fecha</th>
                    <th className="py-1 px-3">Asiento</th>
                    <th className="py-1 px-3">Descripción</th>
                    <th className="py-1 px-3 text-right">Debe</th>
                    <th className="py-1 px-3 text-right">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {(c.movimientos || []).map((m: any, i: number) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="py-1 px-3">{m.fecha}</td>
                      <td className="py-1 px-3">{m.asiento}</td>
                      <td className="py-1 px-3">{m.descripcion}</td>
                      <td className="py-1 px-3 text-right font-mono text-green-700">
                        {formatNumber(m.debe)}
                      </td>
                      <td className="py-1 px-3 text-right font-mono text-red-700">
                        {formatNumber(m.haber)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!(c.movimientos?.length > 0) && (
                <div className="p-3 text-center text-gray-500">
                  No hay movimientos en este periodo para esta cuenta.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLibroDiario = (reporte: any) => {
    const asientos = reporte?.asientos || [];
    return (
      <div className="bg-white border rounded shadow-sm p-4">
        <h4 className="font-semibold text-lg mb-4">Libro Diario</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-1 px-3">#</th>
                <th className="py-1 px-3">Fecha</th>
                <th className="py-1 px-3">Descripción</th>
                <th className="py-1 px-3">Movimientos</th>
              </tr>
            </thead>
            <tbody>
              {asientos.map((a: any, i: number) => (
                <tr
                  key={a.numero || i}
                  className="border-t align-top hover:bg-gray-50"
                >
                  <td className="py-2 px-3 align-top">{a.numero}</td>
                  <td className="py-2 px-3 align-top">{a.fecha}</td>
                  <td className="py-2 px-3 align-top text-gray-700">
                    {a.descripcion}
                  </td>
                  <td className="py-1 px-3">
                    <table className="w-full text-xs">
                      <thead className="text-left text-gray-500">
                        <tr>
                          <th className="py-1">Cuenta</th>
                          <th className="py-1 text-right">Debe</th>
                          <th className="py-1 text-right">Haber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(a.movimientos || []).map((m: any, j: number) => (
                          <tr key={j} className="border-t border-gray-100">
                            <td className="py-1 text-gray-800">
                              {m.cuenta_nombre || m.cuenta} ({m.cuenta_codigo})
                            </td>
                            <td className="py-1 text-right font-mono text-green-700">
                              {formatNumber(m.debe)}
                            </td>
                            <td className="py-1 text-right font-mono text-red-700">
                              {formatNumber(m.haber)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!(asientos.length > 0) && (
            <div className="p-3 text-center text-gray-500">
              No hay asientos en este periodo.
            </div>
          )}
        </div>
      </div>
    );
  };

  const tipoReporte =
    result?.reporte?.tipo || result?.interpretacion?.tipo_reporte;

  return (
    <main className="p-4 max-w-6xl mx-auto font-sans">
      <style jsx global>{`
        html {
          font-family: "Inter", sans-serif;
        }
      `}</style>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Generador de Reportes con IA
        </h1>
        <div className="text-sm text-gray-500">
          Solicita reportes contables usando lenguaje natural.
        </div>
      </div>

      {/* notifications */}
      {notice && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-lg shadow-md">
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg shadow-md">
          {error}
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        <form
          className="space-y-4 bg-white p-5 rounded-lg border shadow-lg"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="solicitud"
            className="font-semibold text-lg text-gray-700 block"
          >
            Solicitud (Lenguaje Natural)
          </label>
          <textarea
            id="solicitud"
            placeholder="Ej: Genera un balance general de este año y muéstrame el detalle de las cuentas."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className={`w-full rounded-lg border-2 p-3 text-sm transition-all duration-200 focus:outline-none focus:ring-4 ${
              validate(input)
                ? "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                : "border-red-400 focus:border-red-600 focus:ring-red-100"
            }`}
            aria-invalid={!validate(input)}
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading || !validate(input)}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando...
                </>
              ) : (
                "Generar Reporte"
              )}
            </button>
            <span className="text-sm text-gray-500">
              La solicitud debe ser descriptiva (mín. 10 caracteres).
            </span>
          </div>
        </form>

        <aside className="bg-white border rounded-lg p-4 shadow-lg h-fit">
          <h3 className="font-bold text-gray-700 mb-3 text-lg">
            Ejemplos Rápidos
          </h3>
          <div className="grid gap-3">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(ex.text)}
                className="text-left p-3 rounded-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-md bg-gray-50 transition-all duration-200"
                type="button"
              >
                <div className="font-semibold text-blue-600 text-sm">
                  {ex.title}
                </div>
                <div className="text-xs text-gray-600 mt-1 italic">
                  {ex.text}
                </div>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-8">
        {!result && !loading && (
          <div className="text-gray-500 text-center p-8 border border-dashed rounded-lg bg-white shadow-sm">
            Aquí se mostrará el reporte contable generado por la Inteligencia
            Artificial.
          </div>
        )}

        {result && (
          <div className="bg-white border rounded-lg p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-blue-700">
                  {tipoReporte?.toUpperCase().replace("_", " ") || "REPORTE"}
                </h2>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Empresa:</span>{" "}
                  {result.empresa || "-"}
                </div>
                <div className="text-sm text-gray-700 italic">
                  <span className="font-semibold">Interpretación:</span>{" "}
                  {result.interpretacion?.descripcion_interpretada ||
                    "Solicitud procesada con éxito."}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold">Generado:</span>{" "}
                  {result.fecha_generacion
                    ? new Date(result.fecha_generacion).toLocaleString()
                    : "-"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 text-sm transition-colors"
                >
                  Exportar PDF
                </button>
                <button
                  onClick={exportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 text-sm transition-colors"
                >
                  Exportar Excel
                </button>
              </div>
            </div>

            <div className="mt-4">
              {tipoReporte === "balance_general" &&
                renderBalanceGeneral(result.reporte)}
              {tipoReporte === "estado_resultados" &&
                renderEstadoResultados(result.reporte)}
              {tipoReporte === "libro_mayor" &&
                renderLibroMayor(result.reporte)}
              {tipoReporte === "libro_diario" &&
                renderLibroDiario(result.reporte)}
              {![
                "balance_general",
                "estado_resultados",
                "libro_mayor",
                "libro_diario",
              ].includes(tipoReporte || "") && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">
                    Detalle de Reporte Personalizado (JSON)
                  </h3>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto text-gray-800 border">
                    {JSON.stringify(result.reporte, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
