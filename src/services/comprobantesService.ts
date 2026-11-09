import { apiClient } from "../api/client";
import {
  ComprobantePendienteModel,
  ComprobanteUploadFile,
  ComprobanteUploadResponse,
} from "../types/comprobantes";

interface ComprobantePendienteDTO {
  id: number;
  cuota_id: number | null;
  periodo: string;
  importe: string;
  estado: string;
  fecha_solicitud: string | null;
  motivo_rechazo: string | null;
  alumno: {
    legajo: number;
    nombre: string;
    curso: string;
  };
  tutor: {
    id: number;
    nombre: string;
    email: string;
  };
  comprobante: {
    id: number;
    nombre_archivo: string;
    archivo_url: string;
    fecha_envio: string | null;
  } | null;
  conceptos: {
    clave: string;
    concepto: string;
    monto: string;
  }[];
}

export const comprobantesService = {
  async upload(input: {
    cuotaId: number;
    importe: number;
    conceptosSeleccionados: string[];
    medioPago?: string;
    archivo: ComprobanteUploadFile;
  }): Promise<ComprobanteUploadResponse> {
    const formData = new FormData();
    formData.append("cuota_id", String(input.cuotaId));
    formData.append("importe", input.importe.toFixed(2));
    formData.append("conceptos_seleccionados", JSON.stringify(input.conceptosSeleccionados));
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

  async getComprobantesPendientes(): Promise<ComprobantePendienteModel[]> {
    const response = await apiClient.get<ComprobantePendienteDTO[]>(
      "/comprobantes/pendientes/"
    );
    return (response.data || []).map((dto) => ({
      id: dto.id,
      cuotaId: dto.cuota_id,
      periodo: dto.periodo,
      importe: parseFloat(dto.importe) || 0,
      estado: dto.estado,
      fechaSolicitud: dto.fecha_solicitud,
      motivoRechazo: dto.motivo_rechazo,
      alumno: {
        legajo: dto.alumno.legajo,
        nombre: dto.alumno.nombre,
        curso: dto.alumno.curso,
      },
      tutor: {
        id: dto.tutor.id,
        nombre: dto.tutor.nombre,
        email: dto.tutor.email,
      },
      comprobante: dto.comprobante
        ? {
            id: dto.comprobante.id,
            nombreArchivo: dto.comprobante.nombre_archivo,
            archivoUrl: dto.comprobante.archivo_url,
            fechaEnvio: dto.comprobante.fecha_envio,
          }
        : null,
      conceptos: (dto.conceptos || []).map((c) => ({
        clave: c.clave,
        concepto: c.concepto,
        monto: parseFloat(c.monto) || 0,
      })),
    }));
  },

  async aprobarComprobante(pagoId: number): Promise<{ detail: string; estado: string }> {
    const response = await apiClient.post<{ detail: string; estado: string }>(
      `/comprobantes/${pagoId}/aprobar/`
    );
    return response.data;
  },

  async rechazarComprobante(
    pagoId: number,
    motivo: string
  ): Promise<{ detail: string; estado: string }> {
    const response = await apiClient.post<{ detail: string; estado: string }>(
      `/comprobantes/${pagoId}/rechazar/`,
      { motivo }
    );
    return response.data;
  },
};
