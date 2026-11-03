export type UserRole = "Padre/Tutor" | "Administrador";

export interface User {
  id: number;
  nombre_usuario: string;
  email: string;
  nombre_completo: string;
  rol: UserRole;
  tutor_id?: number;
}

export interface MobileUserDTO {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "padre" | "administrativo" | string;
}

export interface LoginResponseDTO {
  access: string;
  token_type: "Bearer";
  expires_in: number;
  user: MobileUserDTO;
}

export interface CurrentUserResponseDTO {
  user: MobileUserDTO;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}
