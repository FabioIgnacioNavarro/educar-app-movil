import {
  CuotaDTO,
  CuotaModel,
  ComprobanteItemDTO,
  DetalleCuotaDTO,
  DetalleCuotaModel,
  EstadoPago,
  EstadoCuota,
  PagoHistorialModel,
} from "../types/cuota";
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
    montoPagadoFormateado: formatCurrency(montoPagado),
    saldoPendiente,
    saldoPendienteFormateado: formatCurrency(saldoPendiente),
    fechaVencimiento: formatDate(dto.fecha_vencimiento),
    estado,
    alumnoNombre: dto.alumno?.nombre_completo || "Alumno no asignado",
    alumnoLegajo: dto.alumno?.legajo || 0,
    alumnoCurso: dto.alumno?.curso || "Curso no especificado",
    facturaId: dto.factura_id,
    comprobantes: (dto.comprobantes || []).map(adaptComprobante),
  };
}

export function adaptEstadoPago(rawEstado: string): EstadoPago {
  const estado = rawEstado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (estado.includes("rechaz")) return "rechazado";
  if (estado.includes("pagad") || estado.includes("aprob")) return "pagado";
  if (estado.includes("revision")) return "en revisión";
  return "pendiente";
}

function adaptComprobante(comprobante: ComprobanteItemDTO) {
  const importe = Number(comprobante.importe ?? 0);
  const estadoPago = comprobante.estado_pago || comprobante.estado;
  const motivo = comprobante.motivo_rechazo?.trim();
  const fecha = comprobante.fecha_envio || comprobante.fecha_pago;
  return {
    id: comprobante.id,
    fechaPago: formatDate(fecha?.slice(0, 10)),
    importe,
    importeFormateado: formatCurrency(importe),
    estado: adaptEstadoPago(estadoPago),
    archivoUrl: comprobante.archivo_url || "",
    nombreArchivo: comprobante.nombre_archivo,
    motivoRechazo: motivo || undefined,
  };
}

export function adaptCuotasList(dtos: CuotaDTO[]): CuotaModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map(adaptCuota);
}

export function adaptHistorialPagos(cuotas: CuotaModel[]): PagoHistorialModel[] {
  return cuotas
    .flatMap((cuota) =>
      cuota.comprobantes.map((comprobante) => ({
        id: comprobante.id,
        cuotaId: cuota.id,
        facturaId: cuota.facturaId,
        periodo: cuota.periodo,
        alumnoNombre: cuota.alumnoNombre,
        alumnoCurso: cuota.alumnoCurso,
        fechaPago: comprobante.fechaPago,
        montoAbonado: comprobante.importe,
        montoAbonadoFormateado: comprobante.importeFormateado,
        estado: comprobante.estado,
        archivoUrl: comprobante.archivoUrl || undefined,
        motivoRechazo: comprobante.motivoRechazo,
      }))
    )
    .sort((a, b) => b.id - a.id);
}

export function adaptDetalleCuota(
  dto: DetalleCuotaDTO,
  fallbackBase?: CuotaModel
): DetalleCuotaModel {
  const baseMontoTotal =
    typeof dto.monto_total === "string"
      ? parseFloat(dto.monto_total)
      : dto.monto_total || fallbackBase?.montoTotal || 0;

  const cuotaBaseMonto = Number(dto.discriminacion?.cuota_base || 0);

  const deportes = (dto.discriminacion?.deportes || []).map((d) => {
    const val = typeof d.monto === "string" ? parseFloat(d.monto) : d.monto || 0;
    return {
      nombre: d.nombre,
      monto: val,
      montoFormateado: formatCurrency(val),
    };
  });

  const transporte = dto.discriminacion?.transporte
    ? {
        recorrido: dto.discriminacion.transporte.recorrido,
        monto:
          typeof dto.discriminacion.transporte.monto === "string"
            ? parseFloat(dto.discriminacion.transporte.monto)
            : dto.discriminacion.transporte.monto || 0,
        montoFormateado: formatCurrency(
          typeof dto.discriminacion.transporte.monto === "string"
            ? parseFloat(dto.discriminacion.transporte.monto)
            : dto.discriminacion.transporte.monto || 0
        ),
      }
    : null;

  const comedor = dto.discriminacion?.comedor
    ? {
        monto:
          typeof dto.discriminacion.comedor.monto === "string"
            ? parseFloat(dto.discriminacion.comedor.monto)
            : dto.discriminacion.comedor.monto || 0,
        montoFormateado: formatCurrency(
          typeof dto.discriminacion.comedor.monto === "string"
            ? parseFloat(dto.discriminacion.comedor.monto)
            : dto.discriminacion.comedor.monto || 0
        ),
      }
    : null;

  const comprobantes = (dto.comprobantes || []).map(adaptComprobante);
  const conceptosPago = (dto.conceptos_pago || []).map((concepto) => {
    const monto = Number(concepto.monto || 0);
    const montoPagado = Number(concepto.monto_pagado || 0);
    const montoEnRevision = Number(concepto.monto_en_revision || 0);
    const saldoDisponible = Number(concepto.saldo_disponible || 0);
    return {
      clave: concepto.clave,
      tipo: concepto.tipo,
      concepto: concepto.concepto,
      monto,
      montoFormateado: formatCurrency(monto),
      montoPagado,
      montoEnRevision,
      saldoDisponible,
      saldoDisponibleFormateado: formatCurrency(saldoDisponible),
      bloqueadoPorRevision: Boolean(concepto.bloqueado_por_revision),
    };
  });

  const totalComprobantesAprobados = comprobantes
    .filter((c) => c.estado === "pagado")
    .reduce((acc, c) => acc + c.importe, 0);

  const montoPagado =
    fallbackBase?.montoPagado ??
    (dto.monto_pagado !== undefined
      ? Number(dto.monto_pagado)
      : totalComprobantesAprobados);
  const saldoPendiente = Math.max(0, baseMontoTotal - montoPagado);

  const rawEstado = (dto.estado || fallbackBase?.estado || "pendiente").toLowerCase();
  let estado: EstadoCuota = "pendiente";
  if (rawEstado.includes("pagad") || rawEstado.includes("paga")) {
    estado = "pagada";
  } else if (rawEstado.includes("parcial") || (montoPagado > 0 && saldoPendiente > 0)) {
    estado = "parcial";
  } else if (rawEstado.includes("vencid")) {
    estado = "vencida";
  }

  return {
    id: dto.id,
    periodo: dto.periodo || fallbackBase?.periodo || "",
    montoTotal: baseMontoTotal,
    montoTotalFormateado: formatCurrency(baseMontoTotal),
    montoPagado,
    montoPagadoFormateado: formatCurrency(montoPagado),
    saldoPendiente,
    saldoPendienteFormateado: formatCurrency(saldoPendiente),
    fechaVencimiento: formatDate(dto.fecha_vencimiento || fallbackBase?.fechaVencimiento),
    estado,
    alumnoNombre:
      dto.alumno?.nombre_completo || fallbackBase?.alumnoNombre || "Alumno no asignado",
    alumnoLegajo: dto.alumno?.legajo || fallbackBase?.alumnoLegajo || 0,
    alumnoCurso: dto.alumno?.curso || fallbackBase?.alumnoCurso || "Curso no especificado",
    facturaId: dto.factura_id || fallbackBase?.facturaId,
    conceptosPago,
    discriminacion: dto.discriminacion
      ? {
          cuotaBase: cuotaBaseMonto,
          cuotaBaseFormateada: formatCurrency(cuotaBaseMonto),
          deportes,
          transporte,
          comedor,
        }
      : undefined,
    comprobantes,
  };
}

/**
 * Dataset simulado de desarrollo (Mocks) que respeta al 100% el contrato de docs/contratos.md.
 * Asegura operatividad en Expo Go antes o durante el desarrollo del backend Django.
 */
export const MOCK_CUOTAS_DTO: CuotaDTO[] = [
  {
    id: 101,
    periodo: "Noviembre 2026",
    monto: "45000.00",
    monto_pagado: "20000.00",
    fecha_vencimiento: "2026-11-10",
    estado: "parcial",
    alumno: {
      legajo: 1245,
      nombre_completo: "Mateo Pérez",
      curso: "3° Año A - Secundaria",
    },
    factura_id: 87,
  },
  {
    id: 102,
    periodo: "Noviembre 2026",
    monto: "38000.00",
    monto_pagado: "0.00",
    fecha_vencimiento: "2026-11-10",
    estado: "pendiente",
    alumno: {
      legajo: 1350,
      nombre_completo: "Sofía Pérez",
      curso: "1° Año B - Primaria",
    },
    factura_id: 88,
  },
  {
    id: 103,
    periodo: "Diciembre 2026",
    monto: "45000.00",
    monto_pagado: "0.00",
    fecha_vencimiento: "2026-12-10",
    estado: "pendiente",
    alumno: {
      legajo: 1245,
      nombre_completo: "Mateo Pérez",
      curso: "3° Año A - Secundaria",
    },
    factura_id: 95,
  },
  {
    id: 100,
    periodo: "Octubre 2026",
    monto: "45000.00",
    monto_pagado: "45000.00",
    fecha_vencimiento: "2026-10-10",
    estado: "pagada",
    alumno: {
      legajo: 1245,
      nombre_completo: "Mateo Pérez",
      curso: "3° Año A - Secundaria",
    },
    factura_id: 72,
  },
  {
    id: 99,
    periodo: "Septiembre 2026",
    monto: "38000.00",
    monto_pagado: "0.00",
    fecha_vencimiento: "2026-09-10",
    estado: "vencida",
    alumno: {
      legajo: 1350,
      nombre_completo: "Sofía Pérez",
      curso: "1° Año B - Primaria",
    },
    factura_id: 60,
  },
];

export const MOCK_DETALLES_CUOTA: Record<number, DetalleCuotaDTO> = {
  101: {
    id: 101,
    periodo: "Noviembre 2026",
    monto_total: "45000.00",
    fecha_vencimiento: "2026-11-10",
    estado: "parcial",
    alumno: {
      legajo: 1245,
      nombre_completo: "Mateo Pérez",
      curso: "3° Año A - Secundaria",
    },
    factura_id: 87,
    discriminacion: {
      cuota_base: "30000.00",
      deportes: [
        { nombre: "Fútbol", monto: "5000.00" },
        { nombre: "Básquet", monto: "4000.00" },
      ],
      transporte: { recorrido: "Recorrido 2 - Centro", monto: "6000.00" },
      comedor: null,
    },
    comprobantes: [
      {
        id: 12,
        fecha_pago: "2026-11-05",
        importe: "20000.00",
        estado: "aprobado",
        archivo_url: "/media/comprobantes/comp_12.pdf",
      },
    ],
  },
  102: {
    id: 102,
    periodo: "Noviembre 2026",
    monto_total: "38000.00",
    fecha_vencimiento: "2026-11-10",
    estado: "pendiente",
    alumno: {
      legajo: 1350,
      nombre_completo: "Sofía Pérez",
      curso: "1° Año B - Primaria",
    },
    factura_id: 88,
    discriminacion: {
      cuota_base: "26000.00",
      deportes: [{ nombre: "Gimnasia Artística", monto: "6000.00" }],
      transporte: { recorrido: "Recorrido 2 - Centro", monto: "6000.00" },
      comedor: null,
    },
    comprobantes: [],
  },
};

export const MOCK_HISTORIAL_PAGOS: PagoHistorialModel[] = [
  {
    id: 1,
    cuotaId: 101,
    facturaId: 87,
    periodo: "Noviembre 2026",
    alumnoNombre: "Mateo Pérez",
    alumnoCurso: "3° Año A - Secundaria",
    fechaPago: "05/11/2026",
    montoAbonado: 20000,
    montoAbonadoFormateado: formatCurrency(20000),
    estado: "pagado",
    archivoUrl: "/media/comprobantes/comp_12.pdf",
  },
  {
    id: 2,
    cuotaId: 100,
    facturaId: 72,
    periodo: "Octubre 2026",
    alumnoNombre: "Mateo Pérez",
    alumnoCurso: "3° Año A - Secundaria",
    fechaPago: "08/10/2026",
    montoAbonado: 45000,
    montoAbonadoFormateado: formatCurrency(45000),
    estado: "pagado",
    archivoUrl: "/media/comprobantes/comp_08.pdf",
  },
  {
    id: 3,
    cuotaId: 98,
    facturaId: 58,
    periodo: "Octubre 2026",
    alumnoNombre: "Sofía Pérez",
    alumnoCurso: "1° Año B - Primaria",
    fechaPago: "07/10/2026",
    montoAbonado: 38000,
    montoAbonadoFormateado: formatCurrency(38000),
    estado: "pagado",
    archivoUrl: "/media/comprobantes/comp_07.jpg",
  },
];
