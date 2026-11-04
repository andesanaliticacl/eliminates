import type { Config, Horario } from "./tipos";

/** Valores por defecto. Lo guardado en /admin se combina encima (ver combinarConfig). */
export const CONFIG_POR_DEFECTO: Config = {
  servicio_nombre: "Abono inicial y cita con abogado",
  precio_clp: 29990,
  duracion_bloque_min: 30,
  dias_horizonte: 30,
  logo_url: "",
  contadores: { casos_evaluados: 1200, casos_gestionados: 850, anos_experiencia: 10, ejemplo: true },
  testimonios: [
    {
      nombre: "Cliente de ejemplo, Santiago",
      texto: "Me explicaron qué se podía hacer en mi caso y cuánto iba a demorar. Sin letra chica.",
      ejemplo: true,
    },
    {
      nombre: "Cliente de ejemplo, Valparaíso",
      texto: "Subí mis documentos desde el celular y al día siguiente ya tenía respuesta del abogado.",
      ejemplo: true,
    },
    {
      nombre: "Cliente de ejemplo, Concepción",
      texto: "Lo mejor fue saber en todo momento en qué etapa estaba mi solicitud.",
      ejemplo: true,
    },
  ],
  contacto: {
    telefono: "+56 2 0000 0000",
    whatsapp: "56900000000",
    correo: "contacto@eliminate.cl",
    direccion: "Dirección por confirmar, Santiago, Chile",
  },
  abogado: { nombre: "Abogado responsable", whatsapp: "", correo: "" },
};

export const HORARIOS_POR_DEFECTO: Horario[] = [0, 1, 2, 3, 4, 5, 6].map((dia_semana) => ({
  dia_semana,
  activo: dia_semana >= 1 && dia_semana <= 5,
  hora_inicio: "09:00",
  hora_fin: "18:00",
}));

/** Minutos que un horario queda retenido mientras la persona paga. */
export const MINUTOS_RETENCION = 30;
/** Anticipación mínima para agendar. */
export const MINUTOS_ANTICIPACION = 120;

export const NOTA_LEGAL =
  "La procedencia de cada eliminación depende de los requisitos legales aplicables a tu caso. Te lo explicamos con claridad desde el primer análisis.";

export function combinarConfig(guardada: Partial<Config> | null | undefined): Config {
  const g = guardada ?? {};
  return {
    ...CONFIG_POR_DEFECTO,
    ...g,
    contadores: { ...CONFIG_POR_DEFECTO.contadores, ...g.contadores },
    contacto: { ...CONFIG_POR_DEFECTO.contacto, ...g.contacto },
    abogado: { ...CONFIG_POR_DEFECTO.abogado, ...g.abogado },
    testimonios: g.testimonios ?? CONFIG_POR_DEFECTO.testimonios,
  };
}

export function urlSitio(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function enlaceWhatsApp(numero: string, mensaje?: string): string {
  const limpio = numero.replace(/\D/g, "");
  return `https://wa.me/${limpio}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}
