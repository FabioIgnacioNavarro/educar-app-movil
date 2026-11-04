import { apiClient } from "../api/client";
import {
  CuotaDTO,
  CuotaModel,
  DetalleCuotaDTO,
  DetalleCuotaModel,
  PagoHistorialModel,
} from "../types/cuota";
import {
  adaptCuotasList,
  adaptDetalleCuota,
  MOCK_CUOTAS_DTO,
  MOCK_DETALLES_CUOTA,
  MOCK_HISTORIAL_PAGOS,
} from "../adapters/cuotaAdapter";

export const cuotasService = {
  /**
   * Obtiene la lista de cuotas del tutor autenticado.
   * Si el backend de Django aún no tiene el endpoint activo, recurre al dataset
   * tipado de prueba que replica fielmente el contrato de la API.
   */
  async getCuotas(params?: { periodo?: string; estado?: string }): Promise<CuotaModel[]> {
    try {
      const response = await apiClient.get<CuotaDTO[]>("/cuotas/", { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return adaptCuotasList(response.data);
      }
      return adaptCuotasList(MOCK_CUOTAS_DTO);
    } catch {
      // Fallback de desarrollo para no bloquear la experiencia móvil
      return adaptCuotasList(MOCK_CUOTAS_DTO);
    }
  },

  /**
   * Obtiene el detalle discriminado de una cuota (arancel base, deportes, transporte, comedor).
   */
  async getCuotaById(id: number): Promise<DetalleCuotaModel> {
    try {
      const response = await apiClient.get<DetalleCuotaDTO>(`/cuotas/${id}/`);
      return adaptDetalleCuota(response.data);
    } catch {
      const mockDto = MOCK_DETALLES_CUOTA[id] || {
        id,
        periodo: "Noviembre 2026",
        monto_total: "45000.00",
        fecha_vencimiento: "2026-11-10",
        estado: "pendiente",
        discriminacion: {
          cuota_base: "30000.00",
          deportes: [{ nombre: "Fútbol", monto: "5000.00" }],
          transporte: { recorrido: "Recorrido 2 - Centro", monto: "6000.00" },
          comedor: null,
        },
        comprobantes: [],
      };
      return adaptDetalleCuota(mockDto);
    }
  },

  /**
   * Obtiene el historial de pagos cancelados y comprobantes aprobados (HU_M03).
   */
  async getHistorialPagos(): Promise<PagoHistorialModel[]> {
    try {
      const response = await apiClient.get<PagoHistorialModel[]>("/cuotas/historial/");
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return MOCK_HISTORIAL_PAGOS;
    } catch {
      return MOCK_HISTORIAL_PAGOS;
    }
  },
};
