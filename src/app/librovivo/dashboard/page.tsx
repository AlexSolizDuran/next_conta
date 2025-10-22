"use client";
import React, { useState, useEffect } from "react";
import { apiFetcher } from "@/lib/apiFetcher";

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
};

const ENDPOINT = "/api/reporteia";

const EXAMPLES: { title: string; tipo: string; text: string }[] = [
  {
    title: "Balance General (Año)",
    tipo: "balance_general",
    text: "Generar un balance general del año 2024 para Mi Empresa S.A.S",
  },
  {
    title: "Estado de Resultados",
    tipo: "estado_resultados",
    text: "Genera un estado de resultados para el periodo 2024",
  },
  {
    title: "Libro Mayor (Cuenta 1105)",
    tipo: "libro_mayor",
    text: "Muéstrame el libro mayor de la cuenta 1105 entre 2024-01-01 y 2024-12-31",
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
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ texto_solicitud: input }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt || res.statusText}`);
      }

      const data: ReporteResponse = await res.json();
      if (!data.success)
        throw new Error("El backend indicó fallo al generar el reporte.");
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

  const exportPDF = async () => {
    if (!result) {
      setError("No hay reporte para exportar.");
      return;
    }
    try {
      // soporta named/default export variations
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
            const line = `${r.clase ?? ""} — ${
              r.cuenta ?? r.nombre ?? ""
            } — ${formatNumber(r.saldo)}`;
            const l = doc.splitTextToSize(line, 520);
            doc.text(l, margin, y);
            y += l.length * 12;
            if (y > 720) {
              doc.addPage();
              y = margin;
            }
          });
          y += 8;
        });
      } else {
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
      // manejar default/named exports
      const XLSXModule: any = await import("xlsx");
      const XLSX = XLSXModule?.default ?? XLSXModule;
      const FileSaverModule: any = await import("file-saver");
      const saveAs =
        FileSaverModule?.saveAs ?? FileSaverModule?.default ?? FileSaverModule;

      const wb = XLSX.utils.book_new();
      const tipo = result.reporte?.tipo || result.interpretacion?.tipo_reporte;

      if (tipo === "balance_general") {
        ["activos", "pasivos", "patrimonio"].forEach((sec) => {
          const arr = result.reporte?.[sec] || [];
          const rows = arr.map((r: any) => ({
            Clase: r.clase ?? "",
            Cuenta: r.cuenta ?? r.nombre ?? "",
            Saldo: r.saldo ?? "",
          }));
          const ws = XLSX.utils.json_to_sheet(rows);
          XLSX.utils.book_append_sheet(wb, ws, sec.substring(0, 31));
        });
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
            Referencia: m.referencia,
            Descripcion: m.descripcion,
            Debe: m.debe,
            Haber: m.haber,
          }));
          const ws = XLSX.utils.json_to_sheet(rows);
          XLSX.utils.book_append_sheet(
            wb,
            ws,
            (c.codigo || c.nombre || "Cuenta").substring(0, 31)
          );
        });
      } else if (tipo === "libro_diario") {
        const asientos = result.reporte?.asientos || [];
        const rows = asientos.map((a: any) => ({
          Numero: a.numero,
          Fecha: a.fecha,
          Descripcion: a.descripcion,
          Movimientos: JSON.stringify(a.movimientos || []),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
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
          const total = rows.reduce(
            (acc: number, r: any) => acc + (Number(r.saldo) || 0),
            0
          );
          return (
            <div key={sec} className="bg-white border rounded shadow-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold uppercase">{sec}</h4>
                <div className="font-mono text-sm">
                  Total: {formatNumber(total)}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-600">
                    <tr>
                      <th className="py-1">Clase</th>
                      <th className="py-1">Cuenta</th>
                      <th className="py-1 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="py-1">{r.clase ?? ""}</td>
                        <td className="py-1">{r.cuenta ?? r.nombre ?? ""}</td>
                        <td className="py-1 text-right font-mono">
                          {formatNumber(r.saldo)}
                        </td>
                      </tr>
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
    const items = reporte?.items || [];
    const totales = reporte?.totales || {};
    return (
      <div className="bg-white border rounded shadow-sm p-3">
        <h4 className="font-semibold mb-2">Estado de Resultados</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-1">Concepto</th>
                <th className="py-1 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="py-1">{it.concepto || it.nombre}</td>
                  <td className="py-1 text-right font-mono">
                    {formatNumber(it.valor)}
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="py-1">Utilidad Bruta</td>
                <td className="py-1 text-right font-mono">
                  {formatNumber(totales.utilidad_bruta)}
                </td>
              </tr>
              <tr className="border-t font-semibold">
                <td className="py-1">Utilidad Operacional</td>
                <td className="py-1 text-right font-mono">
                  {formatNumber(totales.utilidad_operacional)}
                </td>
              </tr>
              <tr className="border-t font-semibold">
                <td className="py-1">Utilidad Neta</td>
                <td className="py-1 text-right font-mono">
                  {formatNumber(totales.utilidad_neta)}
                </td>
              </tr>
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
          <div key={idx} className="bg-white border rounded shadow-sm p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {c.codigo ?? ""} — {c.nombre ?? ""}
              </h4>
              <div className="font-mono">{formatNumber(c.saldo)}</div>
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600">
                  <tr>
                    <th className="py-1">Fecha</th>
                    <th className="py-1">Referencia</th>
                    <th className="py-1">Descripción</th>
                    <th className="py-1 text-right">Debe</th>
                    <th className="py-1 text-right">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {(c.movimientos || []).map((m: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{m.fecha}</td>
                      <td className="py-1">{m.referencia}</td>
                      <td className="py-1">{m.descripcion}</td>
                      <td className="py-1 text-right font-mono">
                        {formatNumber(m.debe)}
                      </td>
                      <td className="py-1 text-right font-mono">
                        {formatNumber(m.haber)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLibroDiario = (reporte: any) => {
    const asientos = reporte?.asientos || [];
    return (
      <div className="bg-white border rounded shadow-sm p-3">
        <h4 className="font-semibold mb-2">Libro Diario</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-1">#</th>
                <th className="py-1">Fecha</th>
                <th className="py-1">Descripción</th>
                <th className="py-1">Movimientos</th>
              </tr>
            </thead>
            <tbody>
              {asientos.map((a: any, i: number) => (
                <tr key={i} className="border-t align-top">
                  <td className="py-1 align-top">{a.numero}</td>
                  <td className="py-1 align-top">{a.fecha}</td>
                  <td className="py-1 align-top">{a.descripcion}</td>
                  <td className="py-1">
                    <table className="w-full text-sm">
                      <thead className="text-left text-gray-600">
                        <tr>
                          <th className="py-1">Cuenta</th>
                          <th className="py-1 text-right">Debe</th>
                          <th className="py-1 text-right">Haber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(a.movimientos || []).map((m: any, j: number) => (
                          <tr key={j} className="border-t">
                            <td className="py-1">{m.cuenta}</td>
                            <td className="py-1 text-right font-mono">
                              {formatNumber(m.debe)}
                            </td>
                            <td className="py-1 text-right font-mono">
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
        </div>
      </div>
    );
  };

  const tipoReporte =
    result?.reporte?.tipo || result?.interpretacion?.tipo_reporte;

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Generador de Reportes con IA</h1>
        <div className="text-sm text-gray-600">
          Conecta con tu backend Django
        </div>
      </div>

      {/* notifications */}
      {notice && (
        <div className="mt-4 p-3 bg-green-50 text-green-800 border border-green-100 rounded">
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-800 border border-red-100 rounded">
          {error}
        </div>
      )}

      <section className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label htmlFor="solicitud" className="font-medium">
            Solicitud (lenguaje natural)
          </label>
          <textarea
            id="solicitud"
            placeholder="Ej: Genera un balance general de este año"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className={`w-full rounded border p-3 text-sm focus:outline-none focus:ring-2 ${
              validate(input)
                ? "border-gray-200 focus:ring-blue-300"
                : "border-red-300 focus:ring-red-200"
            }`}
            aria-invalid={!validate(input)}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Generando..." : "Generar Reporte"}
            </button>
            <span className="text-sm text-gray-500">Mínimo 10 caracteres</span>
          </div>
        </form>

        <aside className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-3">Ejemplos rápidos</h3>
          <div className="grid gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(ex.text)}
                className="text-left p-3 rounded border hover:shadow-sm bg-gray-50"
                type="button"
              >
                <div className="font-medium text-sm">{ex.title}</div>
                <div className="text-xs text-gray-600 mt-1">{ex.text}</div>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-6">
        {!result && !loading && (
          <div className="text-gray-600">
            Aquí aparecerá el reporte generado.
          </div>
        )}

        {result && (
          <div className="bg-white border rounded p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-semibold">Empresa:</span>{" "}
                  {result.empresa || "-"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Tipo:</span>{" "}
                  {tipoReporte || "-"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Interpretación:</span>{" "}
                  {result.interpretacion?.descripcion_interpretada || "-"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Fecha:</span>{" "}
                  {result.fecha_generacion
                    ? new Date(result.fecha_generacion).toLocaleString()
                    : "-"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportPDF}
                  className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  Exportar PDF
                </button>
                <button
                  onClick={exportExcel}
                  className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
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
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.reporte, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
