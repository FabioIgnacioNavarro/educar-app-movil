import {
  CuotaDTO,
  CuotaModel,
  EstadoComprobante,
  EstadoCuota,
} from "../types/cuota";
import { formatCurrency, formatDate } from "../utils/formatters";

function toNumber(value: string | number | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapEstadoCuota(value: string): EstadoCuota {
  const normalized = value.toLocaleLowerCase("es-AR");
  if (normalized === "parcial") return "parcial";
  if (normalized === "pagada") return "pagada";
  if (normalized === "vencida") return "vencida";
  return "pendiente";
}

function mapEstadoComprobante(value: string): EstadoComprobante | string {
  const normalized = value.toLocaleLowerCase("es-AR");
  if (["pendiente", "aprobado", "rechazado"].includes(normalized)) {
    return normalized as EstadoComprobante;
  }
  return value;
}

/** Convierte la respuesta real de la API de cuotas al modelo que usa la interfaz. */
export function adaptCuota(dto: CuotaDTO): CuotaModel {
  const montoTotal = toNumber(dto.monto_total);
  const montoPagado = toNumber(dto.monto_pagado);
  const saldoPendiente = Math.max(0, toNumber(dto.saldo ?? montoTotal - montoPagado));

  return {
    id: dto.id,
    periodo: dto.periodo,
    montoTotal,
    montoTotalFormateado: formatCurrency(montoTotal),
    montoPagado,
    montoPagadoFormateado: formatCurrency(montoPagado),
    saldoPendiente,
    saldoPendienteFormateado: formatCurrency(saldoPendiente),
    fechaVencimiento: formatDate(dto.fecha_vencimiento ?? undefined),
    estado: mapEstadoCuota(dto.estado),
    alumnoNombre: dto.alumno?.nombre_completo || "Alumno no asignado",
    alumnoLegajo: dto.alumno?.legajo || 0,
    alumnoCurso: dto.alumno?.curso || "Curso no especificado",
    fechaPago: dto.fecha_pago,
    comprobantes: (dto.comprobantes || []).map((comprobante) => ({
      id: comprobante.id,
      estado: mapEstadoComprobante(comprobante.estado),
      fechaEnvio: comprobante.fecha_envio,
      nombreArchivo: comprobante.nombre_archivo,
    })),
  };
}

export function adaptCuotasList(dtos: CuotaDTO[]): CuotaModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map(adaptCuota);
}
