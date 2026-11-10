import { apiClient } from "../api/client";

export type TipoNotificacionPrueba = "factura" | "recordatorio";

export interface ResultadoSimulacionNotificacion {
  detail: string;
  destinatario: string;
  tipo: TipoNotificacionPrueba;
  periodo: string;
  alumno: string;
  total: string | null;
}

export const notificacionesService = {
  async simular(input: {
    tipo: TipoNotificacionPrueba;
    mes: number;
    anio: number;
    legajo: number;
  }): Promise<ResultadoSimulacionNotificacion> {
    const response = await apiClient.post<ResultadoSimulacionNotificacion>(
      "/admin/notificaciones/simulacion/",
      input
    );
    return response.data;
  },
};
