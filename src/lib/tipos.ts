export type EstadoSolicitud = "nueva" | "pendiente_pago" | "en_curso" | "cerrada";
export type EstadoCita = "retenida" | "confirmada" | "liberada" | "cancelada";
export type Modalidad = "presencial" | "videollamada";
export type Antecedente = "dicom" | "informe_comercial" | "financiero" | "penal";

export const ANTECEDENTES: { id: Antecedente; etiqueta: string }[] = [
  { id: "dicom", etiqueta: "DICOM / deuda castigada" },
  { id: "informe_comercial", etiqueta: "Informe comercial" },
  { id: "financiero", etiqueta: "Antecedente financiero" },
  { id: "penal", etiqueta: "Antecedente penal" },
];

export const ESTADOS: { id: EstadoSolicitud; etiqueta: string }[] = [
  { id: "nueva", etiqueta: "Nueva" },
  { id: "pendiente_pago", etiqueta: "Pendiente de pago" },
  { id: "en_curso", etiqueta: "En curso" },
  { id: "cerrada", etiqueta: "Cerrada" },
];

export interface Solicitud {
  id: string;
  token: string;
  numero_atencion: string | null;
  estado: EstadoSolicitud;
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  comuna: string;
  antecedentes: Antecedente[];
  monto_aproximado: number | null;
  descripcion: string | null;
  consentimiento_en: string;
  servicio: string;
  monto_clp: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  pago_estado: string | null;
  pagado_en: string | null;
  cita_conflicto: boolean;
  creado_en: string;
}

export interface Cita {
  id: string;
  solicitud_id: string | null;
  hold_token: string;
  inicio: string;
  modalidad: Modalidad;
  estado: EstadoCita;
  expira_en: string | null;
}

export interface Documento {
  id: string;
  solicitud_id: string;
  storage_path: string;
  nombre: string;
  mime: string;
  tamano: number;
  creado_en: string;
}

export interface Nota {
  id: string;
  solicitud_id: string;
  autor: string;
  texto: string;
  creado_en: string;
}

export interface Horario {
  dia_semana: number; // 0 = domingo
  activo: boolean;
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
}

export interface DiaBloqueado {
  fecha: string; // YYYY-MM-DD
  motivo: string | null;
}

export interface Testimonio {
  nombre: string;
  texto: string;
  /** Mientras sea true el sitio lo rotula como ejemplo, para no publicar un testimonio inventado. */
  ejemplo: boolean;
}

export interface Config {
  servicio_nombre: string;
  precio_clp: number;
  duracion_bloque_min: number;
  dias_horizonte: number;
  logo_url: string;
  contadores: {
    casos_evaluados: number;
    casos_gestionados: number;
    anos_experiencia: number;
    /** Igual que en testimonios: true rotula las cifras como de ejemplo. */
    ejemplo: boolean;
  };
  testimonios: Testimonio[];
  contacto: { telefono: string; whatsapp: string; correo: string; direccion: string };
  abogado: { nombre: string; whatsapp: string; correo: string };
}

export interface DatosSolicitud {
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  comuna: string;
  antecedentes: Antecedente[];
  monto_aproximado: number | null;
  descripcion: string | null;
}

export type SolicitudConCita = Solicitud & { cita: Cita | null };
