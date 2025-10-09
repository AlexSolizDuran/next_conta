'use client'

import { useState } from "react"
import { ArbolCuenta } from "@/types/cuenta/arbol_cuenta"

interface ArbolCuentasProps {
  cuentas: ArbolCuenta[]
  onSelect?: (cuenta: ArbolCuenta) => void // Callback al seleccionar un nodo
}

// Nodo recursivo
function Nodo({ cuenta, onSelect }: { cuenta: ArbolCuenta, onSelect?: (cuenta: ArbolCuenta) => void }) {
  const [abierto, setAbierto] = useState(false)
  const tieneHijos = cuenta.hijos && cuenta.hijos.length > 0

  const handleClick = () => {
    if (tieneHijos) setAbierto(!abierto)
    if (onSelect) onSelect(cuenta)
  }

  return (
    <li>
      <div
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={handleClick}
      >
        {tieneHijos && (abierto ? "▼ " : "► ")}
        {cuenta.nombre} ({cuenta.codigo})
      </div>
      {tieneHijos && abierto && (
        <ul style={{ paddingLeft: "20px" }}>
          {cuenta.hijos!.map(hijo => (
            <Nodo key={hijo.id} cuenta={hijo} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  )
}

// Componente principal
export default function ArbolCuentas({ cuentas, onSelect }: ArbolCuentasProps) {
  if (!cuentas || cuentas.length === 0) {
    return <div>No hay cuentas disponibles.</div>
  }

  return (
    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
      {cuentas.map(cuenta => (
        <Nodo key={cuenta.id} cuenta={cuenta} onSelect={onSelect} />
      ))}
    </ul>
  )
}
