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
  montoPagadoFormateado: string;
  saldoPendiente: number;
  saldoPendienteFormateado: string;
  fechaVencimiento: string;
  estado: EstadoCuota;
  alumnoNombre: string;
  alumnoLegajo: number;
  alumnoCurso: string;
  facturaId?: number;
}

export interface DeporteItemDTO {
  nombre: string;
  monto: string | number;
}

export interface TransporteItemDTO {
  recorrido: string;
  monto: string | number;
}

export interface ComedorItemDTO {
  monto: string | number;
}

export interface ComprobanteItemDTO {
  id: number;
  fecha_pago: string;
  importe: string | number;
  estado: string;
  archivo_url: string;
}

export interface DetalleCuotaDTO {
  id: number;
  periodo: string;
  monto_total: string | number;
  fecha_vencimiento?: string;
  estado: string;
  alumno?: {
    legajo: number;
    nombre_completo: string;
    curso?: string;
  };
  factura_id?: number;
  discriminacion: {
    cuota_base: string | number;
    deportes: DeporteItemDTO[];
    transporte?: TransporteItemDTO | null;
    comedor?: ComedorItemDTO | null;
  };
  comprobantes: ComprobanteItemDTO[];
}

export interface DeporteItemModel {
  nombre: string;
  monto: number;
  montoFormateado: string;
}

export interface TransporteItemModel {
  recorrido: string;
  monto: number;
  montoFormateado: string;
}

export interface ComedorItemModel {
  monto: number;
  montoFormateado: string;
}

export interface ComprobanteItemModel {
  id: number;
  fechaPago: string;
  importe: number;
  importeFormateado: string;
  estado: string;
  archivoUrl: string;
}

export interface DetalleCuotaModel extends CuotaModel {
  discriminacion: {
    cuotaBase: number;
    cuotaBaseFormateada: string;
    deportes: DeporteItemModel[];
    transporte?: TransporteItemModel | null;
    comedor?: ComedorItemModel | null;
  };
  comprobantes: ComprobanteItemModel[];
}

export interface PagoHistorialModel {
  id: number;
  cuotaId: number;
  facturaId?: number;
  periodo: string;
  alumnoNombre: string;
  alumnoCurso: string;
  fechaPago: string;
  montoAbonado: number;
  montoAbonadoFormateado: string;
  estado: string;
  archivoUrl?: string;
}
