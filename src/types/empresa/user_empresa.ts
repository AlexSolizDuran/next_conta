import { UsuarioGet } from "../usuario/usuario"
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
    roles:string[],
    texto_tipo? : string,
    texto_tamano?: string
}
interface UserEmpresaList{
    id:string,
    usuario:UsuarioGet,
    roles:string[]
}

export type {UserEmpresaGet,UserEmpresaSet,UserEmpresaList}