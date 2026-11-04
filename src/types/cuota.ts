export type EstadoCuota = "pendiente" | "parcial" | "pagada" | "vencida";
export type EstadoComprobante = "pendiente" | "aprobado" | "rechazado";

export interface ComprobanteCuotaDTO {
  id: number;
  estado: EstadoComprobante | string;
  fecha_envio: string;
  nombre_archivo: string;
}

export interface CuotaDTO {
  id: number;
  periodo: string;
  monto_total: string | number;
  monto_pagado: string | number;
  saldo: string | number;
  fecha_vencimiento: string | null;
  fecha_pago: string | null;
  estado: EstadoCuota | string;
  comprobantes: ComprobanteCuotaDTO[];
  alumno: {
    legajo: number;
    nombre_completo: string;
    curso: string;
  };
}

export interface CuotaModel {
  id: number;
  periodo: string;
  montoTotal: number;
  montoTotalFormateado: string;
  montoPagado: number;
  montoPagadoFormateado: string;
  saldoPendiente: number;
  saldoPendienteFormateado: string;
  fechaVencimiento: string;
  estado: EstadoCuota;
  alumnoNombre: string;
  alumnoLegajo: number;
  alumnoCurso: string;
  fechaPago: string | null;
  comprobantes: {
    id: number;
    estado: EstadoComprobante | string;
    fechaEnvio: string;
    nombreArchivo: string;
  }[];
}

export interface ComprobanteUploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface ComprobanteUploadResponse {
  id: number;
  cuota_id: number;
  pago_id: number;
  estado: EstadoComprobante;
  mensaje: string;
}
