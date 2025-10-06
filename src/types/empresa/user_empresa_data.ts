
import { UsuarioGet } from "../usuario/usuario";
import { CustomGet } from "./custom";

interface UserEmpresaData{
    access:string,
    empresa:string,
    user_empresa:string,
    usuario:UsuarioGet,
    rol:string[],
    custom : CustomGet,
}
export type {UserEmpresaData}