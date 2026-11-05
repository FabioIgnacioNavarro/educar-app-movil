import {
  ReporteIngresosDTO,
  ReporteIngresosModel,
  PagoCompletoDTO,
  PagoCompletoModel,
  PagoIncompletoDTO,
  PagoIncompletoModel,
  FacturaReporteDTO,
  FacturaReporteModel,
  DeudaDiscriminadaDTO,
  DeudaDiscriminadaModel,
} from "../types/reportes";
import { formatCurrency, formatDate } from "../utils/formatters";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function adaptReporteIngresos(dto: ReporteIngresosDTO): ReporteIngresosModel {
  const totalRecaudado =
    typeof dto.total_recaudado === "string"
      ? parseFloat(dto.total_recaudado)
      : dto.total_recaudado || 0;
  const totalFacturado =
    typeof dto.total_facturado === "string"
      ? parseFloat(dto.total_facturado)
      : dto.total_facturado || 0;
  const cuotaBase =
    typeof dto.ingresos_cuota_base === "string"
      ? parseFloat(dto.ingresos_cuota_base)
      : dto.ingresos_cuota_base || 0;
  const servicios =
    typeof dto.ingresos_servicios === "string"
      ? parseFloat(dto.ingresos_servicios)
      : dto.ingresos_servicios || 0;

  const mesIdx = Math.max(0, Math.min(11, (dto.mes || 1) - 1));
  const periodoNombre = `${MESES[mesIdx]} ${dto.anio}`;

  return {
    mes: dto.mes,
    anio: dto.anio,
    periodoNombre,
    totalRecaudado,
    totalRecaudadoFormateado: formatCurrency(totalRecaudado),
    totalFacturado,
    totalFacturadoFormateado: formatCurrency(totalFacturado),
    porcentajeCobranza: dto.porcentaje_cobranza ?? (totalFacturado > 0 ? Math.round((totalRecaudado / totalFacturado) * 100) : 0),
    ingresosCuotaBase: cuotaBase,
    ingresosCuotaBaseFormateado: formatCurrency(cuotaBase),
    ingresosServicios: servicios,
    ingresosServiciosFormateado: formatCurrency(servicios),
    cantidadCuotasCobradas: dto.cantidad_cuotas_cobradas || 0,
    cantidadCuotasPendientes: dto.cantidad_cuotas_pendientes || 0,
  };
}

export function adaptPagosCompletosList(dtos: PagoCompletoDTO[]): PagoCompletoModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map((dto) => {
    const total =
      typeof dto.monto_total === "string"
        ? parseFloat(dto.monto_total)
        : dto.monto_total || 0;
    return {
      id: dto.id,
      alumnoLegajo: dto.alumno_legajo,
      alumnoNombre: dto.alumno_nombre,
      alumnoCurso: dto.alumno_curso,
      tutorNombre: dto.tutor_nombre,
      montoTotal: total,
      montoTotalFormateado: formatCurrency(total),
      fechaCancelacion: formatDate(dto.fecha_cancelacion),
      medioPago: dto.medio_pago || "Transferencia Bancaria",
    };
  });
}

export function adaptPagosIncompletosList(dtos: PagoIncompletoDTO[]): PagoIncompletoModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map((dto) => {
    const total =
      typeof dto.monto_total === "string"
        ? parseFloat(dto.monto_total)
        : dto.monto_total || 0;
    const pagado =
      typeof dto.monto_pagado === "string"
        ? parseFloat(dto.monto_pagado)
        : dto.monto_pagado || 0;
    const saldo =
      typeof dto.saldo_pendiente === "string"
        ? parseFloat(dto.saldo_pendiente)
        : dto.saldo_pendiente || Math.max(0, total - pagado);

    return {
      id: dto.id,
      alumnoLegajo: dto.alumno_legajo,
      alumnoNombre: dto.alumno_nombre,
      alumnoCurso: dto.alumno_curso,
      tutorNombre: dto.tutor_nombre,
      tutorEmail: dto.tutor_email || "No informado",
      tutorTelefono: dto.tutor_telefono || "No informado",
      montoTotal: total,
      montoTotalFormateado: formatCurrency(total),
      montoPagado: pagado,
      montoPagadoFormateado: formatCurrency(pagado),
      saldoPendiente: saldo,
      saldoPendienteFormateado: formatCurrency(saldo),
      conceptosAdeudados: dto.conceptos_adeudados || ["Cuota Base"],
      estado: dto.estado || "pendiente",
    };
  });
}

export function adaptFacturasReporteList(dtos: FacturaReporteDTO[]): FacturaReporteModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map((dto) => {
    const total =
      typeof dto.monto_total === "string"
        ? parseFloat(dto.monto_total)
        : dto.monto_total || 0;
    const pagado =
      typeof dto.monto_pagado === "string"
        ? parseFloat(dto.monto_pagado)
        : dto.monto_pagado || 0;
    const saldo =
      typeof dto.saldo === "string"
        ? parseFloat(dto.saldo)
        : dto.saldo || Math.max(0, total - pagado);

    const comprobantes = (dto.comprobantes || []).map((c) => {
      const imp =
        typeof c.importe === "string" ? parseFloat(c.importe) : c.importe || 0;
      return {
        id: c.id,
        fechaPago: formatDate(c.fecha_pago),
        importe: imp,
        importeFormateado: formatCurrency(imp),
        estado: c.estado || "aprobado",
        archivoUrl: c.archivo_url,
      };
    });

    return {
      id: dto.id,
      numeroFactura: dto.numero_factura,
      fechaEmision: formatDate(dto.fecha_emision),
      periodo: dto.periodo,
      alumnoNombre: dto.alumno_nombre,
      alumnoCurso: dto.alumno_curso,
      montoTotal: total,
      montoTotalFormateado: formatCurrency(total),
      montoPagado: pagado,
      montoPagadoFormateado: formatCurrency(pagado),
      saldo,
      saldoFormateado: formatCurrency(saldo),
      estado: dto.estado || (saldo === 0 ? "pagada" : "pendiente"),
      comprobantes,
    };
  });
}

export function adaptDeudaDiscriminada(dto: DeudaDiscriminadaDTO): DeudaDiscriminadaModel {
  const total =
    typeof dto.total_deuda === "string"
      ? parseFloat(dto.total_deuda)
      : dto.total_deuda || 0;
  const cuota =
    typeof dto.deuda_cuota_base === "string"
      ? parseFloat(dto.deuda_cuota_base)
      : dto.deuda_cuota_base || 0;
  const dep =
    typeof dto.deuda_deportes === "string"
      ? parseFloat(dto.deuda_deportes)
      : dto.deuda_deportes || 0;
  const transp =
    typeof dto.deuda_transporte === "string"
      ? parseFloat(dto.deuda_transporte)
      : dto.deuda_transporte || 0;
  const com =
    typeof dto.deuda_comedor === "string"
      ? parseFloat(dto.deuda_comedor)
      : dto.deuda_comedor || 0;

  const desgloseAlumnos = (dto.desglose_alumnos || []).map((a) => {
    const cb = typeof a.cuota_base === "string" ? parseFloat(a.cuota_base) : a.cuota_base || 0;
    const d = typeof a.deportes === "string" ? parseFloat(a.deportes) : a.deportes || 0;
    const t = typeof a.transporte === "string" ? parseFloat(a.transporte) : a.transporte || 0;
    const c = typeof a.comedor === "string" ? parseFloat(a.comedor) : a.comedor || 0;
    const sub = typeof a.subtotal_deuda === "string" ? parseFloat(a.subtotal_deuda) : a.subtotal_deuda || (cb + d + t + c);

    return {
      alumnoLegajo: a.alumno_legajo,
      alumnoNombre: a.alumno_nombre,
      alumnoCurso: a.alumno_curso,
      cuotaBase: cb,
      cuotaBaseFormateada: formatCurrency(cb),
      deportes: d,
      deportesFormateado: formatCurrency(d),
      transporte: t,
      transporteFormateado: formatCurrency(t),
      comedor: c,
      comedorFormateada: formatCurrency(c),
      comedorFormateado: formatCurrency(c),
      subtotalDeuda: sub,
      subtotalDeudaFormateado: formatCurrency(sub),
    };
  });

  return {
    tutorId: dto.tutor_id,
    totalDeuda: total,
    totalDeudaFormateado: formatCurrency(total),
    deudaCuotaBase: cuota,
    deudaCuotaBaseFormateada: formatCurrency(cuota),
    deudaDeportes: dep,
    deudaDeportesFormateada: formatCurrency(dep),
    deudaTransporte: transp,
    deudaTransporteFormateado: formatCurrency(transp),
    deudaComedor: com,
    deudaComedorFormateado: formatCurrency(com),
    desgloseAlumnos,
  };
}

// --- Datasets Mock Institucionales para Desarrollo ---

export const MOCK_REPORTE_INGRESOS_ADMIN: ReporteIngresosDTO = {
  mes: 11,
  anio: 2026,
  total_recaudado: "1840000.00",
  total_facturado: "2300000.00",
  porcentaje_cobranza: 80,
  ingresos_cuota_base: "1350000.00",
  ingresos_servicios: "490000.00",
  cantidad_cuotas_cobradas: 46,
  cantidad_cuotas_pendientes: 12,
};

export const MOCK_PAGOS_COMPLETOS_ADMIN: PagoCompletoDTO[] = [
  {
    id: 1,
    alumno_legajo: 1245,
    alumno_nombre: "Mateo Pérez",
    alumno_curso: "3° Año A - Secundaria",
    tutor_nombre: "Juan Pérez",
    monto_total: "45000.00",
    fecha_cancelacion: "2026-11-05",
    medio_pago: "Transferencia Bancaria",
  },
  {
    id: 2,
    alumno_legajo: 1120,
    alumno_nombre: "Lucas Benítez",
    alumno_curso: "4° Año B - Secundaria",
    tutor_nombre: "María Morales",
    monto_total: "52000.00",
    fecha_cancelacion: "2026-11-04",
    medio_pago: "Transferencia Bancaria",
  },
  {
    id: 3,
    alumno_legajo: 1344,
    alumno_nombre: "Camila Romero",
    alumno_curso: "2° Año A - Primaria",
    tutor_nombre: "Esteban Romero",
    monto_total: "38000.00",
    fecha_cancelacion: "2026-11-02",
    medio_pago: "Transferencia Bancaria",
  },
  {
    id: 4,
    alumno_legajo: 1401,
    alumno_nombre: "Martina Díaz",
    alumno_curso: "1° Año A - Secundaria",
    tutor_nombre: "Valeria Gómez",
    monto_total: "47500.00",
    fecha_cancelacion: "2026-11-06",
    medio_pago: "Transferencia Bancaria",
  },
];

export const MOCK_PAGOS_INCOMPLETOS_ADMIN: PagoIncompletoDTO[] = [
  {
    id: 1,
    alumno_legajo: 1350,
    alumno_nombre: "Sofía Pérez",
    alumno_curso: "1° Año B - Primaria",
    tutor_nombre: "Juan Pérez",
    tutor_email: "juan.perez@email.com",
    tutor_telefono: "+54 9 379 411-2233",
    monto_total: "38000.00",
    monto_pagado: "0.00",
    saldo_pendiente: "38000.00",
    conceptos_adeudados: ["Cuota Base", "Gimnasia", "Transporte"],
    estado: "pendiente",
  },
  {
    id: 2,
    alumno_legajo: 1289,
    alumno_nombre: "Joaquín Rossi",
    alumno_curso: "3° Año B - Secundaria",
    tutor_nombre: "Carlos Rossi",
    tutor_email: "carlos.rossi@email.com",
    tutor_telefono: "+54 9 379 455-8899",
    monto_total: "45000.00",
    monto_pagado: "22500.00",
    saldo_pendiente: "22500.00",
    conceptos_adeudados: ["Saldo Cuota Base Noviembre"],
    estado: "parcial",
  },
  {
    id: 3,
    alumno_legajo: 1198,
    alumno_nombre: "Facundo Morales",
    alumno_curso: "5° Año A - Secundaria",
    tutor_nombre: "Susana Suárez",
    tutor_email: "susana.suarez@email.com",
    tutor_telefono: "+54 9 379 477-1122",
    monto_total: "42000.00",
    monto_pagado: "0.00",
    saldo_pendiente: "42000.00",
    conceptos_adeudados: ["Cuota Octubre", "Fútbol"],
    estado: "vencida",
  },
];

export const MOCK_FACTURAS_TUTOR: FacturaReporteDTO[] = [
  {
    id: 101,
    numero_factura: "FC-0001-00000087",
    fecha_emision: "2026-10-31",
    periodo: "Noviembre 2026",
    alumno_nombre: "Mateo Pérez",
    alumno_curso: "3° Año A - Secundaria",
    monto_total: "45000.00",
    monto_pagado: "45000.00",
    saldo: "0.00",
    estado: "pagada",
    comprobantes: [
      {
        id: 12,
        fecha_pago: "2026-11-05",
        importe: "45000.00",
        estado: "aprobado",
        archivo_url: "/media/comprobantes/comp_12.pdf",
      },
    ],
  },
  {
    id: 102,
    numero_factura: "FC-0001-00000088",
    fecha_emision: "2026-10-31",
    periodo: "Noviembre 2026",
    alumno_nombre: "Sofía Pérez",
    alumno_curso: "1° Año B - Primaria",
    monto_total: "38000.00",
    monto_pagado: "0.00",
    saldo: "38000.00",
    estado: "pendiente",
    comprobantes: [],
  },
  {
    id: 100,
    numero_factura: "FC-0001-00000072",
    fecha_emision: "2026-09-30",
    periodo: "Octubre 2026",
    alumno_nombre: "Mateo Pérez",
    alumno_curso: "3° Año A - Secundaria",
    monto_total: "45000.00",
    monto_pagado: "45000.00",
    saldo: "0.00",
    estado: "pagada",
    comprobantes: [
      {
        id: 8,
        fecha_pago: "2026-10-08",
        importe: "45000.00",
        estado: "aprobado",
        archivo_url: "/media/comprobantes/comp_08.pdf",
      },
    ],
  },
  {
    id: 99,
    numero_factura: "FC-0001-00000073",
    fecha_emision: "2026-09-30",
    periodo: "Octubre 2026",
    alumno_nombre: "Sofía Pérez",
    alumno_curso: "1° Año B - Primaria",
    monto_total: "38000.00",
    monto_pagado: "38000.00",
    saldo: "0.00",
    estado: "pagada",
    comprobantes: [
      {
        id: 7,
        fecha_pago: "2026-10-07",
        importe: "38000.00",
        estado: "aprobado",
        archivo_url: "/media/comprobantes/comp_07.jpg",
      },
    ],
  },
];

export const MOCK_DEUDA_DISCRIMINADA_TUTOR: DeudaDiscriminadaDTO = {
  tutor_id: 14,
  total_deuda: "38000.00",
  deuda_cuota_base: "26000.00",
  deuda_deportes: "6000.00",
  deuda_transporte: "6000.00",
  deuda_comedor: "0.00",
  desglose_alumnos: [
    {
      alumno_legajo: 1245,
      alumno_nombre: "Mateo Pérez",
      alumno_curso: "3° Año A - Secundaria",
      cuota_base: "0.00",
      deportes: "0.00",
      transporte: "0.00",
      comedor: "0.00",
      subtotal_deuda: "0.00",
    },
    {
      alumno_legajo: 1350,
      alumno_nombre: "Sofía Pérez",
      alumno_curso: "1° Año B - Primaria",
      cuota_base: "26000.00",
      deportes: "6000.00",
      transporte: "6000.00",
      comedor: "0.00",
      subtotal_deuda: "38000.00",
    },
  ],
};
