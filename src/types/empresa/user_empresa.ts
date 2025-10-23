import { UsuarioGet } from "../usuario/usuario"
import { CustomGet } from "./custom"
import { RolEmpresaList } from "./rol_empresa"

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
    roles:RolEmpresaList[]
}

export type {UserEmpresaGet,UserEmpresaSet,UserEmpresaList}