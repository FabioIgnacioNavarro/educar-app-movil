export type EstadoCuota = "pendiente" | "parcial" | "pagada" | "vencida";

export interface CuotaDTO {
  id: number;
  periodo: string;
  monto: string | number;
  monto_pagado?: string | number;
  fecha_vencimiento?: string;
  estado: string;
  alumno: {
    legajo: number;
    nombre_completo: string;
    curso?: string;
  };
  factura_id?: number;
}

export interface CuotaModel {
  id: number;
  periodo: string;
  montoTotal: number;
  montoTotalFormateado: string;
  montoPagado: number;
  saldoPendiente: number;
  fechaVencimiento: string;
  estado: EstadoCuota;
  alumnoNombre: string;
  alumnoLegajo: number;
  alumnoCurso: string;
  facturaId?: number;
}

export interface DetalleCuotaModel extends CuotaModel {
  discriminacion: {
    cuotaBase: number;
    deportes: { nombre: string; monto: number }[];
    transporte?: { recorrido: string; monto: number } | null;
    comedor?: { monto: number } | null;
  };
  comprobantes: {
    id: number;
    fechaPago: string;
    importe: number;
    estado: string;
    archivoUrl: string;
  }[];
}
