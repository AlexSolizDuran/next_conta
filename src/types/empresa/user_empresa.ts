import { CustomGet } from "./custom"

interface UserEmpresaSet{
    usuario: string,
    custom?:string
}
interface UserEmpresaGet{
    id:string,
    usuario: string,
    empresa:string,
    custom: CustomGet,
    roles:string[]
}

export type {UserEmpresaGet,UserEmpresaSet}