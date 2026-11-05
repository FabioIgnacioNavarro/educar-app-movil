import {
  AlumnoServiciosDTO,
  AlumnoServiciosModel,
  DeporteModel,
  TransporteModel,
  ComedorModel,
} from "../types/servicio";
import { formatCurrency } from "../utils/formatters";

function parseMonthlyAmount(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(amount) ? amount : null;
}

function formatMonthlyAmount(value: number | null): string {
  return value === null ? "No informado" : formatCurrency(value);
}

/**
 * Adaptador de Servicios Extracurriculares - PATRÓN ESTRUCTURAL: ADAPTER (ADR 0003)
 * Convierte DTOs de DRF (/api/servicios/inscripciones/) al modelo de vista institucional.
 */
export function adaptAlumnoServicios(dto: AlumnoServiciosDTO): AlumnoServiciosModel {
  const deportes: DeporteModel[] = (dto.deportes || []).map((d) => {
    const monto = parseMonthlyAmount(d.monto_mensual);
    return {
      id: d.id,
      nombre: d.nombre,
      montoMensual: monto,
      montoMensualFormateado: formatMonthlyAmount(monto),
      horario: d.horario || "Horario a coordinar",
    };
  });

  let transporte: TransporteModel | null = null;
  if (dto.transporte) {
    const monto = parseMonthlyAmount(dto.transporte.monto_mensual);
    transporte = {
      idInscripcion: dto.transporte.id_inscripcion,
      recorrido: dto.transporte.recorrido,
      montoMensual: monto,
      montoMensualFormateado: formatMonthlyAmount(monto),
      estado: dto.transporte.estado || "Activo",
    };
  }

  let comedor: ComedorModel | null = null;
  if (dto.comedor) {
    const monto = parseMonthlyAmount(dto.comedor.monto_mensual);
    comedor = {
      idInscripcion: dto.comedor.id_inscripcion,
      montoMensual: monto,
      montoMensualFormateado: formatMonthlyAmount(monto),
      estado: dto.comedor.estado || "Activo",
      detalleMenu: dto.comedor.detalle_menu || "Menú Nutricional Completo",
    };
  }

  const importes = [
    ...deportes.map((deporte) => deporte.montoMensual),
    ...(transporte ? [transporte.montoMensual] : []),
    ...(comedor ? [comedor.montoMensual] : []),
  ];
  const totalMensualServicios = importes.some((importe) => importe === null)
    ? null
    : importes.reduce<number>((total, importe) => total + (importe ?? 0), 0);

  return {
    alumnoLegajo: dto.alumno?.legajo || 0,
    alumnoNombre: dto.alumno?.nombre_completo || "Alumno no especificado",
    alumnoCurso: dto.alumno?.curso || "Curso no especificado",
    deportes,
    cantidadDeportes: deportes.length,
    transporte,
    comedor,
    totalMensualServicios,
    totalMensualServiciosFormateado: formatMonthlyAmount(totalMensualServicios),
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
