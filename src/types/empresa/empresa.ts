interface EmpresaSet{
    nombre:string,
    nit?:string
}

interface EmpresaGet{
    id:string,
    nombre:string,
    nit:string
}
interface EmpresaList{
    id:string,
    nombre:string
}

export type {EmpresaSet,EmpresaGet,EmpresaList}