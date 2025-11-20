interface ArbolCuenta{
    id:string,
    codigo:string,
    nombre:string,
    hijos?:ArbolCuenta[]
}

export type {ArbolCuenta}