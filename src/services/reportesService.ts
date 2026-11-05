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
} from "../types/reportes";
import {
  adaptReporteIngresos,
  adaptPagosCompletosList,
  adaptPagosIncompletosList,
  adaptFacturasReporteList,
  adaptDeudaDiscriminada,
  MOCK_REPORTE_INGRESOS_ADMIN,
  MOCK_PAGOS_COMPLETOS_ADMIN,
  MOCK_PAGOS_INCOMPLETOS_ADMIN,
  MOCK_FACTURAS_TUTOR,
  MOCK_DEUDA_DISCRIMINADA_TUTOR,
} from "../adapters/reporteAdapter";

export const reportesService = {
  // --- Métodos de Reportes Administrativos (HU_M10) ---

  async getReporteIngresos(mes?: number, anio?: number): Promise<ReporteIngresosModel> {
    try {
      const response = await apiClient.get<ReporteIngresosDTO>("/reportes/ingresos/", {
        params: { mes, anio },
      });
      if (response.data && response.data.total_recaudado !== undefined) {
        return adaptReporteIngresos(response.data);
      }
      return adaptReporteIngresos(MOCK_REPORTE_INGRESOS_ADMIN);
    } catch {
      return adaptReporteIngresos(MOCK_REPORTE_INGRESOS_ADMIN);
    }
  },

  async getPagosCompletos(mes?: number, anio?: number): Promise<PagoCompletoModel[]> {
    try {
      const response = await apiClient.get<PagoCompletoDTO[]>(
        "/reportes/pagos-completos/",
        { params: { mes, anio } }
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        return adaptPagosCompletosList(response.data);
      }
      return adaptPagosCompletosList(MOCK_PAGOS_COMPLETOS_ADMIN);
    } catch {
      return adaptPagosCompletosList(MOCK_PAGOS_COMPLETOS_ADMIN);
    }
  },

  async getPagosIncompletos(mes?: number, anio?: number): Promise<PagoIncompletoModel[]> {
    try {
      const response = await apiClient.get<PagoIncompletoDTO[]>(
        "/reportes/pagos-incompletos/",
        { params: { mes, anio } }
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        return adaptPagosIncompletosList(response.data);
      }
      return adaptPagosIncompletosList(MOCK_PAGOS_INCOMPLETOS_ADMIN);
    } catch {
      return adaptPagosIncompletosList(MOCK_PAGOS_INCOMPLETOS_ADMIN);
    }
  },

  // --- Métodos de Reportes del Tutor (HU_M08 y HU_M09) ---

  async getFacturasTutor(params?: {
    desde?: string;
    hasta?: string;
  }): Promise<FacturaReporteModel[]> {
    try {
      const response = await apiClient.get<FacturaReporteDTO[]>("/facturas/", {
        params,
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return adaptFacturasReporteList(response.data);
      }
      return adaptFacturasReporteList(MOCK_FACTURAS_TUTOR);
    } catch {
      return adaptFacturasReporteList(MOCK_FACTURAS_TUTOR);
    }
  },

  async getDeudaDiscriminada(): Promise<DeudaDiscriminadaModel> {
    try {
      const response = await apiClient.get<DeudaDiscriminadaDTO>("/deuda/historial/");
      if (response.data && response.data.total_deuda !== undefined) {
        return adaptDeudaDiscriminada(response.data);
      }
      return adaptDeudaDiscriminada(MOCK_DEUDA_DISCRIMINADA_TUTOR);
    } catch {
      return adaptDeudaDiscriminada(MOCK_DEUDA_DISCRIMINADA_TUTOR);
    }
  },
};
