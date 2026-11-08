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
  ReporteDesgloseFinancieroDTO,
  ReporteDesgloseFinancieroModel,
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
    ingresosSinDesglose: Number(dto.ingresos_sin_desglose || 0),
    ingresosSinDesgloseFormateado: formatCurrency(Number(dto.ingresos_sin_desglose || 0)),
    cuotasSinDesglose: dto.cuotas_sin_desglose || 0,
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

export function adaptReporteDesgloseFinanciero(
  dto: ReporteDesgloseFinancieroDTO
): ReporteDesgloseFinancieroModel {
  const adaptarGrupo = (grupo: ReporteDesgloseFinancieroDTO["deportes"]) =>
    (grupo || []).map((fila) => ({
      nombre: fila.nombre,
      facturadoFormateado: formatCurrency(Number(fila.facturado || 0)),
      pagadoFormateado: formatCurrency(Number(fila.pagado || 0)),
    }));

  return {
    deportes: adaptarGrupo(dto.deportes),
    niveles: adaptarGrupo(dto.niveles),
    horarios: adaptarGrupo(dto.horarios),
    docentes: adaptarGrupo(dto.docentes),
    recorridos: adaptarGrupo(dto.recorridos),
    cuotasSinDesglose: dto.cuotas_sin_desglose || 0,
    facturadoSinDesgloseFormateado: formatCurrency(Number(dto.facturado_sin_desglose || 0)),
    pagadoSinDesgloseFormateado: formatCurrency(Number(dto.pagado_sin_desglose || 0)),
  };
}


