export type UserRole = "Padre/Tutor" | "Administrador" | "Docente" | "Alumno";

export interface User {
  id: number;
  nombre_usuario: string;
  email: string;
  nombre_completo: string;
  rol: UserRole;
  tutor_id?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponseDTO {
  access: string;
  refresh: string;
  user: {
    id: number;
    nombre_usuario: string;
    email: string;
    nombre_completo?: string;
    nombre?: string;
    apellido?: string;
    rol: string;
    tutor_id?: number;
  };
}

export interface LoginCredentials {
  usuario: string;
  password: string;
}
