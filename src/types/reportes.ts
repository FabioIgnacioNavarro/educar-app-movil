// --- Tipos de Reportes Administrativos (HU_M10) ---

export interface ReporteIngresosDTO {
  mes: number;
  anio: number;
  total_recaudado: string | number;
  total_facturado: string | number;
  porcentaje_cobranza: number;
  ingresos_cuota_base?: string | number;
  ingresos_servicios?: string | number;
  ingresos_sin_desglose?: string | number;
  cuotas_sin_desglose?: number;
  cantidad_cuotas_cobradas?: number;
  cantidad_cuotas_pendientes?: number;
}

export interface ReporteIngresosModel {
  mes: number;
  anio: number;
  periodoNombre: string;
  totalRecaudado: number;
  totalRecaudadoFormateado: string;
  totalFacturado: number;
  totalFacturadoFormateado: string;
  porcentajeCobranza: number;
  ingresosCuotaBase: number;
  ingresosCuotaBaseFormateado: string;
  ingresosServicios: number;
  ingresosServiciosFormateado: string;
  ingresosSinDesglose: number;
  ingresosSinDesgloseFormateado: string;
  cuotasSinDesglose: number;
  cantidadCuotasCobradas: number;
  cantidadCuotasPendientes: number;
}

export interface PagoCompletoDTO {
  id: number;
  alumno_legajo: number;
  alumno_nombre: string;
  alumno_curso: string;
  tutor_nombre: string;
  monto_total: string | number;
  fecha_cancelacion: string;
  medio_pago?: string;
}

export interface PagoCompletoModel {
  id: number;
  alumnoLegajo: number;
  alumnoNombre: string;
  alumnoCurso: string;
  tutorNombre: string;
  montoTotal: number;
  montoTotalFormateado: string;
  fechaCancelacion: string;
  medioPago: string;
}

export interface PagoIncompletoDTO {
  id: number;
  alumno_legajo: number;
  alumno_nombre: string;
  alumno_curso: string;
  tutor_nombre: string;
  tutor_email?: string;
  tutor_telefono?: string;
  monto_total: string | number;
  monto_pagado: string | number;
  saldo_pendiente: string | number;
  conceptos_adeudados?: string[];
  estado: string;
}

export interface PagoIncompletoModel {
  id: number;
  alumnoLegajo: number;
  alumnoNombre: string;
  alumnoCurso: string;
  tutorNombre: string;
  tutorEmail: string;
  tutorTelefono: string;
  montoTotal: number;
  montoTotalFormateado: string;
  montoPagado: number;
  montoPagadoFormateado: string;
  saldoPendiente: number;
  saldoPendienteFormateado: string;
  conceptosAdeudados: string[];
  estado: string;
}

// --- Tipos de Reportes del Tutor (HU_M08 y HU_M09) ---

export interface ComprobanteFacturaDTO {
  id: number;
  fecha_pago: string;
  importe: string | number;
  estado: string;
  archivo_url?: string;
}

export interface ComprobanteFacturaModel {
  id: number;
  fechaPago: string;
  importe: number;
  importeFormateado: string;
  estado: string;
  archivoUrl?: string;
}

export interface FacturaReporteDTO {
  id: number;
  numero_factura: string;
  fecha_emision: string;
  periodo: string;
  alumno_nombre: string;
  alumno_curso: string;
  monto_total: string | number;
  monto_pagado: string | number;
  saldo: string | number;
  estado: string;
  comprobantes?: ComprobanteFacturaDTO[];
}

export interface FacturaReporteModel {
  id: number;
  numeroFactura: string;
  fechaEmision: string;
  periodo: string;
  alumnoNombre: string;
  alumnoCurso: string;
  montoTotal: number;
  montoTotalFormateado: string;
  montoPagado: number;
  montoPagadoFormateado: string;
  saldo: number;
  saldoFormateado: string;
  estado: string;
  comprobantes: ComprobanteFacturaModel[];
}

export interface DeudaItemAlumnoDTO {
  alumno_legajo: number;
  alumno_nombre: string;
  alumno_curso: string;
  cuota_base: string | number;
  deportes: string | number;
  transporte: string | number;
  comedor: string | number;
  subtotal_deuda: string | number;
}

export interface DeudaItemAlumnoModel {
  alumnoLegajo: number;
  alumnoNombre: string;
  alumnoCurso: string;
  cuotaBase: number;
  cuotaBaseFormateada: string;
  deportes: number;
  deportesFormateado: string;
  transporte: number;
  transporteFormateado: string;
  comedor: number;
  comedorFormateado: string;
  subtotalDeuda: number;
  subtotalDeudaFormateado: string;
}

export interface DeudaDiscriminadaDTO {
  tutor_id: number;
  total_deuda: string | number;
  deuda_cuota_base: string | number;
  deuda_deportes: string | number;
  deuda_transporte: string | number;
  deuda_comedor: string | number;
  desglose_alumnos: DeudaItemAlumnoDTO[];
}

export interface DeudaDiscriminadaModel {
  tutorId: number;
  totalDeuda: number;
  totalDeudaFormateado: string;
  deudaCuotaBase: number;
  deudaCuotaBaseFormateada: string;
  deudaDeportes: number;
  deudaDeportesFormateada: string;
  deudaTransporte: number;
  deudaTransporteFormateado: string;
  deudaComedor: number;
  deudaComedorFormateado: string;
  desgloseAlumnos: DeudaItemAlumnoModel[];
}

export interface ReporteCategoriaFinancieraDTO {
  nombre: string;
  facturado: string | number;
  pagado: string | number;
}

export interface ReporteDesgloseFinancieroDTO {
  mes: number;
  anio: number;
  deportes: ReporteCategoriaFinancieraDTO[];
  niveles: ReporteCategoriaFinancieraDTO[];
  horarios: ReporteCategoriaFinancieraDTO[];
  docentes: ReporteCategoriaFinancieraDTO[];
  recorridos: ReporteCategoriaFinancieraDTO[];
  cuotas_sin_desglose: number;
  facturado_sin_desglose: string | number;
  pagado_sin_desglose: string | number;
}

export interface ReporteCategoriaFinancieraModel {
  nombre: string;
  facturadoFormateado: string;
  pagadoFormateado: string;
}

export interface ReporteDesgloseFinancieroModel {
  deportes: ReporteCategoriaFinancieraModel[];
  niveles: ReporteCategoriaFinancieraModel[];
  horarios: ReporteCategoriaFinancieraModel[];
  docentes: ReporteCategoriaFinancieraModel[];
  recorridos: ReporteCategoriaFinancieraModel[];
  cuotasSinDesglose: number;
  facturadoSinDesgloseFormateado: string;
  pagadoSinDesgloseFormateado: string;
}

