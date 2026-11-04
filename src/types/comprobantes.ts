export interface ComprobanteUploadFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface ComprobanteUploadResponse {
  id: number;
  cuota_id: number;
  pago_id: number;
  estado: "pendiente" | "aprobado" | "rechazado";
  mensaje: string;
}
