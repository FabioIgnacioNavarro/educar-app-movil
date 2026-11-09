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
  estado: "pendiente" | "en revisión" | "pagado" | "rechazado";
  mensaje: string;
}

export interface ComprobantePendienteModel {
  id: number;
  cuotaId: number | null;
  periodo: string;
  importe: number;
  estado: string;
  fechaSolicitud: string | null;
  motivoRechazo: string | null;
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
    nombreArchivo: string;
    archivoUrl: string;
    fechaEnvio: string | null;
  } | null;
  conceptos: {
    clave: string;
    concepto: string;
    monto: number;
  }[];
}
