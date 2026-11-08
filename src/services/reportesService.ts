import { apiClient } from "../api/client";
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
import {
  adaptReporteIngresos,
  adaptPagosCompletosList,
  adaptPagosIncompletosList,
  adaptFacturasReporteList,
  adaptDeudaDiscriminada,
  adaptReporteDesgloseFinanciero,
} from "../adapters/reporteAdapter";

export const reportesService = {
  // --- Métodos de Reportes Administrativos (HU_M10) ---

  async getReporteIngresos(mes?: number, anio?: number): Promise<ReporteIngresosModel> {
    const response = await apiClient.get<ReporteIngresosDTO>("/reportes/ingresos/", {
      params: { mes, anio },
    });
    if (!response.data || response.data.total_recaudado === undefined) {
      throw new Error("La API devolvió un reporte de ingresos inválido.");
    }
    return adaptReporteIngresos(response.data);
  },

  async getPagosCompletos(mes?: number, anio?: number): Promise<PagoCompletoModel[]> {
    const response = await apiClient.get<PagoCompletoDTO[]>(
      "/reportes/pagos-completos/",
      { params: { mes, anio } }
    );
    if (!Array.isArray(response.data)) {
      throw new Error("La API devolvió un listado de pagos completos inválido.");
    }
    return adaptPagosCompletosList(response.data);
  },

  async getPagosIncompletos(mes?: number, anio?: number): Promise<PagoIncompletoModel[]> {
    const response = await apiClient.get<PagoIncompletoDTO[]>(
      "/reportes/pagos-incompletos/",
      { params: { mes, anio } }
    );
    if (!Array.isArray(response.data)) {
      throw new Error("La API devolvió un listado de pagos incompletos inválido.");
    }
    return adaptPagosIncompletosList(response.data);
  },

  async getDesgloseFinanciero(
    mes: number,
    anio: number
  ): Promise<ReporteDesgloseFinancieroModel> {
    const response = await apiClient.get<ReporteDesgloseFinancieroDTO>(
      "/reportes/desglose-financiero/",
      { params: { mes, anio } }
    );
    if (!response.data || response.data.mes !== mes || response.data.anio !== anio) {
      throw new Error("La API devolvió un desglose financiero inválido para el período.");
    }
    return adaptReporteDesgloseFinanciero(response.data);
  },

  // --- Métodos de Reportes del Tutor (HU_M08 y HU_M09) ---

  async getFacturasTutor(params?: {
    desde?: string;
    hasta?: string;
  }): Promise<FacturaReporteModel[]> {
    const response = await apiClient.get<FacturaReporteDTO[]>("/facturas/", {
      params,
    });
    if (!Array.isArray(response.data)) {
      throw new Error("La API devolvió un listado de facturas inválido.");
    }
    return adaptFacturasReporteList(response.data);
  },

  async getDeudaDiscriminada(): Promise<DeudaDiscriminadaModel> {
    const response = await apiClient.get<DeudaDiscriminadaDTO>("/deuda/historial/");
    if (!response.data || response.data.total_deuda === undefined) {
      throw new Error("La API devolvió un historial de deuda inválido.");
    }
    return adaptDeudaDiscriminada(response.data);
  },
};

