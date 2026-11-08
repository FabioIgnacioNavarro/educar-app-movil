import { apiClient } from "../api/client";
import {
  CuotaDTO,
  CuotaModel,
  DetalleCuotaModel,
  PagoHistorialModel,
} from "../types/cuota";
import {
  adaptCuotasList,
  adaptDetalleCuota,
  adaptHistorialPagos,
} from "../adapters/cuotaAdapter";

export const cuotasService = {
  /**
   * Obtiene la lista de cuotas del tutor autenticado.
   * El listado debe contener solo cuotas reales devueltas por el backend para
   * que el tutor nunca intente pagar una cuota simulada.
   */
  async getCuotas(params?: { periodo?: string; estado?: string }): Promise<CuotaModel[]> {
    const response = await apiClient.get<CuotaDTO[]>("/cuotas/", { params });
    return adaptCuotasList(response.data);
  },

  /**
   * Obtiene el detalle real disponible desde el listado seguro del tutor.
   */
  async getCuotaById(id: number): Promise<DetalleCuotaModel> {
    const response = await apiClient.get<CuotaDTO[]>("/cuotas/");
    const cuota = response.data.find((item) => item.id === id);
    if (!cuota) {
      throw new Error("No se encontró esta cuota entre las cuotas del tutor.");
    }
    return adaptDetalleCuota({
      id: cuota.id,
      periodo: cuota.periodo,
      monto_total: cuota.monto_total ?? cuota.monto,
      monto_pagado: cuota.monto_pagado,
      fecha_vencimiento: cuota.fecha_vencimiento,
      estado: cuota.estado,
      alumno: cuota.alumno,
      factura_id: cuota.factura_id,
      conceptos_pago: cuota.conceptos_pago || [],
      discriminacion: cuota.discriminacion,
      comprobantes: cuota.comprobantes || [],
    });
  },

  /**
   * Construye el historial desde comprobantes reales de las cuotas del tutor.
   */
  async getHistorialPagos(cuotas?: CuotaModel[]): Promise<PagoHistorialModel[]> {
    const data =
      cuotas ??
      adaptCuotasList((await apiClient.get<CuotaDTO[]>("/cuotas/")).data);
    return adaptHistorialPagos(data);
  },
};
