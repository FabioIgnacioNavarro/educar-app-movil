import { MobileUserDTO, User, UserRole } from "../types/auth";

/** Convierte el usuario devuelto por la API Django al modelo de la app. */
export function adaptUserFromApi(dto: MobileUserDTO): User {
  const rawRole = dto.role.trim().toLowerCase();
  let role: UserRole;

  if (rawRole === "administrativo" || rawRole.includes("admin")) {
    role = "Administrador";
  } else if (rawRole === "padre" || rawRole.includes("tutor")) {
    role = "Padre/Tutor";
  } else {
    throw new Error("Este rol no tiene acceso a la aplicación móvil.");
  }

  return {
    id: dto.id,
    nombre_usuario: dto.username,
    email: dto.email,
    nombre_completo: dto.name || dto.username,
    rol: role,
  };
}
