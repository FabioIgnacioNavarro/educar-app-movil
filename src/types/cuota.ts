export type EstadoCuota = "pendiente" | "parcial" | "pagada" | "vencida";
export type EstadoPago = "pendiente" | "en revisión" | "pagado" | "rechazado";

export interface ComprobanteItemDTO {
  id: number;
  estado: string;
  estado_pago?: string;
  fecha_envio?: string;
  fecha_pago?: string;
  importe?: string | number | null;
  nombre_archivo?: string;
  archivo_url?: string;
  motivo_rechazo?: string | null;
}

export interface ConceptoPagoDTO {
  clave: string;
  tipo: string;
  concepto: string;
  monto: string | number;
  monto_pagado: string | number;
  monto_en_revision: string | number;
  saldo_disponible: string | number;
  bloqueado_por_revision?: boolean;
}

export interface CuotaDTO {
  id: number;
  periodo: string;
  monto: string | number;
  monto_total?: string | number;
  monto_pagado?: string | number;
  fecha_vencimiento?: string;
  estado: string;
  alumno: {
    legajo: number;
    nombre_completo: string;
    curso?: string;
  };
  factura_id?: number;
  conceptos_pago?: ConceptoPagoDTO[];
  discriminacion?: {
    cuota_base: string | number;
    deportes: DeporteItemDTO[];
    transporte?: TransporteItemDTO | null;
    comedor?: ComedorItemDTO | null;
  };
  comprobantes?: ComprobanteItemDTO[];
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
  comprobantes: ComprobanteItemModel[];
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

export interface DetalleCuotaDTO {
  id: number;
  periodo: string;
  monto_total: string | number;
  monto_pagado?: string | number;
  fecha_vencimiento?: string;
  estado: string;
  alumno?: {
    legajo: number;
    nombre_completo: string;
    curso?: string;
  };
  factura_id?: number;
  conceptos_pago?: ConceptoPagoDTO[];
  discriminacion?: {
    cuota_base: string | number;
    deportes: DeporteItemDTO[];
    transporte?: TransporteItemDTO | null;
    comedor?: ComedorItemDTO | null;
  };
  comprobantes?: ComprobanteItemDTO[];
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
  estado: EstadoPago;
  archivoUrl: string;
  nombreArchivo?: string;
  motivoRechazo?: string;
}

export interface ConceptoPagoModel {
  clave: string;
  tipo: string;
  concepto: string;
  monto: number;
  montoFormateado: string;
  montoPagado: number;
  montoEnRevision: number;
  saldoDisponible: number;
  saldoDisponibleFormateado: string;
  bloqueadoPorRevision: boolean;
}

export interface DetalleCuotaModel extends CuotaModel {
  conceptosPago: ConceptoPagoModel[];
  discriminacion?: {
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
  estado: EstadoPago;
  archivoUrl?: string;
  motivoRechazo?: string;
}
