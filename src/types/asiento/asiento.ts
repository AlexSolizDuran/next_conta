import { MovimientoList, MovimientoSet } from "./movimiento"

interface AsientoSet{
    numero:string,
    descripcion:string,
    movimientos:MovimientoSet,
    estado?:string
}
interface AsientoGet{
    id:string,
    numero:string,
    descripcion:string,
    estado:string,
    movimientos :MovimientoList
}

interface AsientoList{
    id:string,
    numero:string,
    descripcion:string,
    estado:string
}

export type {AsientoSet,AsientoGet,AsientoList}
