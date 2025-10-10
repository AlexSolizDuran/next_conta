// TableList.tsx
import React, { useState } from "react";

interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableListProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => React.Key;
  className?: string;
  emptyMessage?: string;
  expandableRow?: (item: T) => React.ReactNode; // NUEVO
}

function TableList<T>({
  columns,
  data,
  rowKey,
  className = "",
  emptyMessage = "No hay datos para mostrar.",
  expandableRow,
}: TableListProps<T>) {
  const [expanded, setExpanded] = useState<React.Key | null>(null);

  return (
    <div className={`overflow-x-auto shadow rounded-2xl ${className}`}>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th
                key={col.key as string}
                className={`border border-gray-300 px-4 py-2 text-center ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <React.Fragment key={rowKey(item)}>
                <tr
                  className={`hover:bg-gray-50 cursor-pointer`}
                  onClick={() =>
                    expandableRow
                      ? setExpanded(expanded === rowKey(item) ? null : rowKey(item))
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className={`border border-gray-300 px-4 py-2 ${col.className || ""}`}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
                {expandableRow && expanded === rowKey(item) && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-2 bg-gray-50">
                      {expandableRow(item)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TableList;