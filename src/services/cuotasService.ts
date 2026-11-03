import { apiClient } from "../api/client";
import { CuotaDTO } from "../types/cuota";
import { adaptCuota, adaptCuotasList } from "../adapters/cuotaAdapter";

export const cuotasService = {
  async getCuotas(params?: { periodo?: string; estado?: string }) {
    const response = await apiClient.get<CuotaDTO[]>("/cuotas/", { params });
    return adaptCuotasList(response.data);
  },

  async getCuotaById(id: number) {
    const response = await apiClient.get<CuotaDTO>(`/cuotas/${id}/`);
    return adaptCuota(response.data);
  },
};
