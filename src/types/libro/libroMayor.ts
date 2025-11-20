interface Mov {
    id:string,
    asiento : string,
    fecha:string,
    referencia:string,
    debe:string,
    haber:string
}

interface LibroMayor{
    id : string,
    codigo:string,
    nombre:string,
    estado:string,
    movimientos:Mov[]
}

export type {LibroMayor}