import { CuentaList } from "../cuenta/cuenta";

interface MovimientoSet{
    referencia:string,
    cuenta:string,
    debe:number,
    haber:number,
}
interface MovimientoGet{
    id:string,
    referencia:string,
    cuenta:CuentaList,
    debe:number,
    haber:number
}
interface AsientoMov{
    id:string,
    numero:string,
    fecha:string
}
interface MovimientoList{
    id:string,
    referencia:string,
    cuenta:CuentaList,
    debe:number,
    haber:number,
    asiento:AsientoMov
}

export type {MovimientoSet,MovimientoList,MovimientoGet}