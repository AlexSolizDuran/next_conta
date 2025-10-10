"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { PaginatedResponse } from "@/types/paginacion";
import { ArbolCuenta } from "@/types/cuenta/arbol_cuenta";
import ArbolCuentas from "@/components/ArbolCuenta";
import { LibroMayor } from "@/types/libro/libroMayor";
import TableList from "@/components/TableList";
import React from "react";

export default function CuentaPage() {
  const [page, setPage] = useState(1);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [claseSeleccionada, setClaseSeleccionada] =
    useState<ArbolCuenta | null>(null);

  // URL de SWR con filtro por clase seleccionada
  const url = mostrarTodas
    ? `/api/libro/libro_mayor/?page=${page}`
    : `/api/libro/libro_mayor/?page=${page}${
        claseSeleccionada ? `&clase_id=${claseSeleccionada.id}` : ""
      }`;

  const {
    data: cuentas,
    error: cuentaError,
    isLoading: cuentaLoading,
  } = useSWR<PaginatedResponse<LibroMayor>>(url, apiFetcher);

  const arbolUrl = "/api/cuenta_contable/clase_cuenta/arbol_cuenta";
  const {
    data: arbol,
    error: arbolError,
    isLoading: arbolLoading,
  } = useSWR<ArbolCuenta[]>(arbolUrl, apiFetcher);

  // Columnas para TableList
  const columns = [
    {
      key: "codigo",
      header: "Código",
    },
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "estado",
      header: "Estado",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Libro Mayor
      </h1>

      {/* Árbol de clases de cuenta */}
      <div className="mb-4 p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">Filtrar por Clase de Cuenta</h2>
        <button
          className="px-3 py-1 cursor-pointer"
          onClick={() => {
            setMostrarTodas(true);
            setClaseSeleccionada(null);
            setPage(1);
          }}
        >
          Todos
        </button>
        <ArbolCuentas
          cuentas={arbol || []}
          onSelect={(clase) => {
            setClaseSeleccionada(clase);
            setMostrarTodas(false);
            setPage(1);
          }}
        />

        {claseSeleccionada && (
          <div className="mt-2 text-sm text-gray-700">
            Filtrando por:{" "}
            <strong>
              {claseSeleccionada.nombre} ({claseSeleccionada.codigo})
            </strong>
          </div>
        )}
      </div>

      {/* Tabla de cuentas con filas expandidas */}
      <TableList
        columns={columns}
        data={cuentas?.results || []}
        rowKey={(item) => item.id}
        emptyMessage="No hay cuentas para mostrar."
        expandableRow={(cuenta: LibroMayor) => (
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border-b">Numero</th>
                <th className="px-2 py-1 border-b">Fecha</th>
                <th className="px-2 py-1 border-b">Referencia</th>
                <th className="px-2 py-1 border-b">Debe</th>
                <th className="px-2 py-1 border-b">Haber</th>
              </tr>
            </thead>
            <tbody>
              {cuenta.movimientos.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1 border-b">{mov.asiento}</td>
                  <td className="px-2 py-1 border-b">{mov.fecha}</td>
                  <td className="px-2 py-1 border-b">{mov.referencia}</td>
                  <td className="px-2 py-1 border-b">{mov.debe}</td>
                  <td className="px-2 py-1 border-b">{mov.haber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />

      {/* Paginación */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!cuentas?.previous}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!cuentas?.next}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}