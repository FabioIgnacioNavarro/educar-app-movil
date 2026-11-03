import { LoginResponseDTO, User, UserRole } from "../types/auth";

/**
 * Adaptador de Autenticación - PATRÓN ESTRUCTURAL: ADAPTER (ADR 0003)
 * Convierte el DTO de respuesta de /api/auth/login/ al modelo de dominio User.
 */
export function adaptUserFromLoginResponse(dto: LoginResponseDTO): User {
  const u = dto.user;
  const fullName =
    u.nombre_completo ||
    (u.nombre && u.apellido ? `${u.nombre} ${u.apellido}` : u.nombre_usuario);

  let mappedRole: UserRole = "Padre/Tutor";
  const rawRole = (u.rol || "").toLowerCase();
  if (rawRole.includes("admin")) {
    mappedRole = "Administrador";
  } else if (rawRole.includes("docente") || rawRole.includes("profesor")) {
    mappedRole = "Docente";
  } else if (rawRole.includes("alumno")) {
    mappedRole = "Alumno";
  }

  return {
    id: u.id,
    nombre_usuario: u.nombre_usuario,
    email: u.email,
    nombre_completo: fullName,
    rol: mappedRole,
    tutor_id: u.tutor_id,
  };
}
