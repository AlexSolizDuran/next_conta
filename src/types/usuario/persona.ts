interface PersonaSet {
  nombre: string;
  apellido: string;
  telefono: string;
  ci?: string;
}
interface PersonaGet {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  ci: string;
}
export type { PersonaGet, PersonaSet };
