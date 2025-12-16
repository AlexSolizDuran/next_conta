import { UserEmpresaList } from "./user_empresa"

interface EmpresaSet{
    nombre:string,
    nit?:string
    fecha_cierre_contable?: string | null
}

interface EmpresaGet{
    id:string,
    nombre:string,
    nit:string,
    fecha_cierre_contable?: string | null,
    usuarios: UserEmpresaList[]
}
interface EmpresaList{
    id:string,
    nombre:string
}

export type {EmpresaSet,EmpresaGet,EmpresaList}