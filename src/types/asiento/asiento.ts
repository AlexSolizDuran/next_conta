import { MovimientoList, MovimientoSet } from "./movimiento"

interface AsientoSet{
    
    descripcion:string,
    movimientos:MovimientoSet[],
    estado?:string
}
interface AsientoGet{
    id:string,
    numero:string,
    descripcion:string,
    estado:string,
    movimientos :MovimientoList[],
    fecha : string
}

interface AsientoList{
    id:string,
    numero:string,
    descripcion:string,
    estado:string,
    fecha:string
}

export type {AsientoSet,AsientoGet,AsientoList}
