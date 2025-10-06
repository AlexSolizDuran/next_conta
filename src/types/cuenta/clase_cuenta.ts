interface ClaseCuentaSet{
    codigo:string,
    nombre:string
}


interface ClaseCuentaGet{
    id:string,
    codigo:string,
    nombre:string,
    padre?:ClaseCuentaGet
}

interface ClaseCuentaList{
    id:string,
    codigo:string,
    nombre:string
}

export type {ClaseCuentaSet,ClaseCuentaGet,ClaseCuentaList}