import { apiClient } from "../api/client";
import {
  ComprobanteUploadFile,
  ComprobanteUploadResponse,
} from "../types/comprobantes";

export const comprobantesService = {
  async upload(input: {
    cuotaId: number;
    importe: number;
    medioPago?: string;
    archivo: ComprobanteUploadFile;
  }): Promise<ComprobanteUploadResponse> {
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
