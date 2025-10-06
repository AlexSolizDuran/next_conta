import { ClaseCuentaList } from "./clase_cuenta";

interface CuentaSet{
    codigo: string,
    nombre: string,
    estado?:string,
}

interface CuentaGet{
    id:string,
    codigo:string,
    nombre:string,
    estado:string,
    clase_cuenta:ClaseCuentaList
}

interface CuentaList{
    id:string,
    codido:string
    nombre:string,
    estado:string
}
export type {CuentaSet,CuentaGet,CuentaList}