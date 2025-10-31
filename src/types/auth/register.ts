import { PersonaSet } from "../usuario/persona";

interface Register{
    username: string,
    password: string,
    email: string,
    persona: PersonaSet,
}

export type {Register}