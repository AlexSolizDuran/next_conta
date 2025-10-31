import { UsuarioGet } from "../usuario/usuario"
import { PermisoDetail } from "./permiso"

interface RolEmpresaSet{
    id?:string,
    nombre:string
}

interface userDetail{
    id:string,
    usuario:UsuarioGet,
}

interface RolEmpresaGet{
    id:string,
    nombre:string,
    empresa:string,
    usuarios:userDetail[]
    permisos:PermisoDetail[]
    
}

interface RolEmpresaList{
    id:string,
    nombre:string
}

export type {RolEmpresaGet,RolEmpresaList,RolEmpresaSet}