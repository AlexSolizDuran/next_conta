interface Cuenta{
    id: string,
    codigo:string,
    nombre:string
}
interface Asiento{
    id:string,
    numero:string,
    fecha:string
}

interface LibroDiario{
    id:string,
    referencia:string,
    debe:string,
    haber:string,
    cuenta:Cuenta,
    asiento:Asiento
}

export type {LibroDiario}