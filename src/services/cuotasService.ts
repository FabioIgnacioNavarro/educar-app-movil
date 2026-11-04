import { apiClient } from "../api/client";
import {
  ComprobanteUploadFile,
  ComprobanteUploadResponse,
  CuotaDTO,
} from "../types/cuota";
import { adaptCuotasList } from "../adapters/cuotaAdapter";

export const cuotasService = {
  async getCuotas(params?: { periodo?: string; estado?: string }) {
    const response = await apiClient.get<CuotaDTO[]>("/cuotas/", { params });
    return adaptCuotasList(response.data);
  },

  async uploadComprobante(input: {
    cuotaId: number;
    importe: number;
    medioPago?: string;
    archivo: ComprobanteUploadFile;
  }) {
    const formData = new FormData();
    formData.append("cuota_id", String(input.cuotaId));
    formData.append("importe", input.importe.toFixed(2));
    formData.append("medio_pago", input.medioPago || "Transferencia");
    formData.append(
      "archivo",
      {
        uri: input.archivo.uri,
        name: input.archivo.name,
        type: input.archivo.type,
      } as unknown as Blob
    );

    const response = await apiClient.post<ComprobanteUploadResponse>(
      "/comprobantes/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },
};
