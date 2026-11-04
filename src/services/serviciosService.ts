import { apiClient } from "../api/client";
import { AlumnoServiciosDTO, AlumnoServiciosModel } from "../types/servicio";
import {
  adaptServiciosList,
  MOCK_SERVICIOS_DTO,
} from "../adapters/servicioAdapter";

export const serviciosService = {
  /**
   * Consulta las inscripciones activas a deportes, transporte y comedor
   * de los hijos a cargo del tutor autenticado (HU_M05).
   */
  async getInscripciones(): Promise<AlumnoServiciosModel[]> {
    try {
      const response = await apiClient.get<AlumnoServiciosDTO[]>(
        "/servicios/inscripciones/"
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        return adaptServiciosList(response.data);
      }
      return adaptServiciosList(MOCK_SERVICIOS_DTO);
    } catch {
      // Fallback de desarrollo mientras Joel despliega el endpoint en Django
      return adaptServiciosList(MOCK_SERVICIOS_DTO);
    }
  },
};
