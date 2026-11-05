export interface DeporteDTO {
  id: number;
  nombre: string;
  monto_mensual: string | number | null;
  horario?: string;
}

export interface TransporteDTO {
  id_inscripcion?: number;
  recorrido: string;
  monto_mensual: string | number | null;
  estado?: string;
}

export interface ComedorDTO {
  id_inscripcion?: number;
  monto_mensual: string | number | null;
  estado?: string;
  detalle_menu?: string;
}

export interface AlumnoServiciosDTO {
  alumno: {
    legajo: number;
    nombre_completo: string;
    curso?: string;
  };
  deportes: DeporteDTO[];
  transporte?: TransporteDTO | null;
  comedor?: ComedorDTO | null;
}

export interface DeporteModel {
  id: number;
  nombre: string;
  montoMensual: number | null;
  montoMensualFormateado: string;
  horario: string;
}

export interface TransporteModel {
  idInscripcion?: number;
  recorrido: string;
  montoMensual: number | null;
  montoMensualFormateado: string;
  estado: string;
}

export interface ComedorModel {
  idInscripcion?: number;
  montoMensual: number | null;
  montoMensualFormateado: string;
  estado: string;
  detalleMenu?: string;
}

export interface AlumnoServiciosModel {
  alumnoLegajo: number;
  alumnoNombre: string;
  alumnoCurso: string;
  deportes: DeporteModel[];
  cantidadDeportes: number;
  transporte: TransporteModel | null;
  comedor: ComedorModel | null;
  totalMensualServicios: number | null;
  totalMensualServiciosFormateado: string;
}
