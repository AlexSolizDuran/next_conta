import { PersonaSet, PersonaGet } from "./persona";

interface UsuarioSet {
  username: string;
  email: string;
  persona: PersonaSet;
}

interface UsuarioGet {
  id: string;
  username: string;
  email: string;
  persona: PersonaGet;
}
interface UsuarioList {
  id: string;
  username: string;
  email: string;
  persona: PersonaSet;
}

export type { UsuarioSet, UsuarioGet, UsuarioList };
