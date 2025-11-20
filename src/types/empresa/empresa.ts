import { UserEmpresaList } from "./user_empresa"

interface EmpresaSet{
    nombre:string,
    nit?:string
}

interface EmpresaGet{
    id:string,
    nombre:string,
    nit:string,
    usuarios: UserEmpresaList[]
}
interface EmpresaList{
    id:string,
    nombre:string
}

export type {EmpresaSet,EmpresaGet,EmpresaList}