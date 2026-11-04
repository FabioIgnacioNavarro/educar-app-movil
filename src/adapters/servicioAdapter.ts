import {
  AlumnoServiciosDTO,
  AlumnoServiciosModel,
  DeporteModel,
  TransporteModel,
  ComedorModel,
} from "../types/servicio";
import { formatCurrency } from "../utils/formatters";

/**
 * Adaptador de Servicios Extracurriculares - PATRÓN ESTRUCTURAL: ADAPTER (ADR 0003)
 * Convierte DTOs de DRF (/api/servicios/inscripciones/) al modelo de vista institucional.
 */
export function adaptAlumnoServicios(dto: AlumnoServiciosDTO): AlumnoServiciosModel {
  const deportes: DeporteModel[] = (dto.deportes || []).map((d) => {
    const monto =
      typeof d.monto_mensual === "string"
        ? parseFloat(d.monto_mensual)
        : d.monto_mensual || 0;
    return {
      id: d.id,
      nombre: d.nombre,
      montoMensual: monto,
      montoMensualFormateado: formatCurrency(monto),
      horario: d.horario || "Horario a coordinar",
    };
  });

  let transporte: TransporteModel | null = null;
  if (dto.transporte) {
    const monto =
      typeof dto.transporte.monto_mensual === "string"
        ? parseFloat(dto.transporte.monto_mensual)
        : dto.transporte.monto_mensual || 0;
    transporte = {
      idInscripcion: dto.transporte.id_inscripcion,
      recorrido: dto.transporte.recorrido,
      montoMensual: monto,
      montoMensualFormateado: formatCurrency(monto),
      estado: dto.transporte.estado || "Activo",
    };
  }

  let comedor: ComedorModel | null = null;
  if (dto.comedor) {
    const monto =
      typeof dto.comedor.monto_mensual === "string"
        ? parseFloat(dto.comedor.monto_mensual)
        : dto.comedor.monto_mensual || 0;
    comedor = {
      idInscripcion: dto.comedor.id_inscripcion,
      montoMensual: monto,
      montoMensualFormateado: formatCurrency(monto),
      estado: dto.comedor.estado || "Activo",
      detalleMenu: dto.comedor.detalle_menu || "Menú Nutricional Completo",
    };
  }

  const sumaDeportes = deportes.reduce((acc, d) => acc + d.montoMensual, 0);
  const sumaTransporte = transporte ? transporte.montoMensual : 0;
  const sumaComedor = comedor ? comedor.montoMensual : 0;
  const totalMensualServicios = sumaDeportes + sumaTransporte + sumaComedor;

  return {
    alumnoLegajo: dto.alumno?.legajo || 0,
    alumnoNombre: dto.alumno?.nombre_completo || "Alumno no especificado",
    alumnoCurso: dto.alumno?.curso || "Curso no especificado",
    deportes,
    cantidadDeportes: deportes.length,
    transporte,
    comedor,
    totalMensualServicios,
    totalMensualServiciosFormateado: formatCurrency(totalMensualServicios),
  };
}

export function adaptServiciosList(dtos: AlumnoServiciosDTO[]): AlumnoServiciosModel[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map(adaptAlumnoServicios);
}

/**
 * Dataset simulado institucional de desarrollo (Mocks).
 * Respeta el contrato formal de docs/contratos.md y las reglas institucionales
 * (máx 2 deportes por alumno y recorridos fijos).
 */
export const MOCK_SERVICIOS_DTO: AlumnoServiciosDTO[] = [
  {
    alumno: {
      legajo: 1245,
      nombre_completo: "Mateo Pérez",
      curso: "3° Año A - Secundaria",
    },
    deportes: [
      {
        id: 3,
        nombre: "Fútbol",
        monto_mensual: "5000.00",
        horario: "Lunes y Miércoles 17:00 hs",
      },
      {
        id: 5,
        nombre: "Básquet",
        monto_mensual: "4000.00",
        horario: "Martes y Jueves 18:00 hs",
      },
    ],
    transporte: {
      id_inscripcion: 8,
      recorrido: "Recorrido 2 - Centro",
      monto_mensual: "6000.00",
      estado: "Activo",
    },
    comedor: null,
  },
  {
    alumno: {
      legajo: 1350,
      nombre_completo: "Sofía Pérez",
      curso: "1° Año B - Primaria",
    },
    deportes: [
      {
        id: 7,
        nombre: "Gimnasia Artística",
        monto_mensual: "6000.00",
        horario: "Martes y Viernes 16:30 hs",
      },
    ],
    transporte: {
      id_inscripcion: 9,
      recorrido: "Recorrido 2 - Centro",
      monto_mensual: "6000.00",
      estado: "Activo",
    },
    comedor: {
      id_inscripcion: 3,
      monto_mensual: "18000.00",
      estado: "Activo",
      detalle_menu: "Menú Saludable Integral (Almuerzo + Colación)",
    },
  },
];
