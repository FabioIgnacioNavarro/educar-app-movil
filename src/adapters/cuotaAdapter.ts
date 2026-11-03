import { CuotaDTO, CuotaModel, EstadoCuota } from "../types/cuota";
import { formatCurrency, formatDate } from "../utils/formatters";

/**
 * Adaptador de Cuotas - PATRÓN ESTRUCTURAL: ADAPTER (ADR 0003)
 * Normaliza campos numéricos, estados y fechas provenientes de DRF.
 */
export function adaptCuota(dto: CuotaDTO): CuotaModel {
  const montoTotal =
    typeof dto.monto === "string" ? parseFloat(dto.monto) : dto.monto || 0;
  const montoPagado =
    typeof dto.monto_pagado === "string"
      ? parseFloat(dto.monto_pagado)
      : dto.monto_pagado || 0;
  const saldoPendiente = Math.max(0, montoTotal - montoPagado);

  const rawEstado = (dto.estado || "").toLowerCase();
  let estado: EstadoCuota = "pendiente";
  if (rawEstado.includes("pagad") || rawEstado.includes("paga")) {
    estado = "pagada";
  } else if (rawEstado.includes("parcial")) {
    estado = "parcial";
  } else if (rawEstado.includes("vencid")) {
    estado = "vencida";
  }

  return {
    id: dto.id,
    periodo: dto.periodo,
    montoTotal,
    montoTotalFormateado: formatCurrency(montoTotal),
    montoPagado,
    saldoPendiente,
    fechaVencimiento: formatDate(dto.fecha_vencimiento),
    estado,
    alumnoNombre: dto.alumno?.nombre_completo || "Alumno no asignado",
    alumnoLegajo: dto.alumno?.legajo || 0,
    alumnoCurso: dto.alumno?.curso || "Curso no especificado",
    facturaId: dto.factura_id,
  };
}

export function adaptCuotasList(dtos: CuotaDTO[]): CuotaModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map(adaptCuota);
}
