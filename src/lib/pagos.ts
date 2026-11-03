import { urlSitio } from "./config";
import { formatearCLP, formatearFecha, formatearHora } from "./fechas";
import { correoConfigurado, enviarCorreo, enviarPlantillaWhatsApp, plantillaCorreo, whatsappConfigurado } from "./mensajeria";
import { obtenerPago } from "./mercadopago";
import { obtenerStore } from "./store";
import type { Store } from "./store/tipos";
import type { Solicitud } from "./tipos";
import { telefonoE164 } from "./validacion";

export interface EstadoPagoRecibido {
  solicitudId: string;
  paymentId: string;
  status: string;
  monto: number;
  moneda: string;
}

/**
 * Único punto donde un pago cambia el estado de una solicitud. Lo llaman el webhook
 * y la consulta de la página de retorno, siempre con datos leídos de la API de Mercado Pago.
 * Devuelve false si alguna notificación falló, para que el webhook pida reintento.
 */
export async function aplicarPago(pago: EstadoPagoRecibido): Promise<boolean> {
  const store = await obtenerStore();
  const solicitud = await store.solicitudPorId(pago.solicitudId);
  if (!solicitud) {
    console.warn(`Pago ${pago.paymentId} con referencia desconocida: ${pago.solicitudId}`);
    return true;
  }

  if (pago.status === "approved") {
    if (pago.moneda !== "CLP" || pago.monto !== solicitud.monto_clp) {
      await store.agregarNota(
        solicitud.id,
        "Sistema",
        `Pago ${pago.paymentId} aprobado por ${pago.monto} ${pago.moneda}, distinto de lo cobrado (${solicitud.monto_clp} CLP). No se confirmó la solicitud.`,
      );
      return true;
    }
    const confirmada = await store.confirmarPago(solicitud.id, pago.paymentId);
    return enviarNotificacionesDePago(store, confirmada);
  }

  await store.registrarPagoNoAprobado(solicitud.id, pago.paymentId, pago.status);
  if (pago.status === "rejected" || pago.status === "cancelled") {
    return enviarAvisoDeReintento(store, solicitud);
  }
  return true;
}

export async function procesarPagoMP(paymentId: string): Promise<boolean> {
  const pago = await obtenerPago(paymentId);
  if (!pago.external_reference) return true;
  return aplicarPago({
    solicitudId: pago.external_reference,
    paymentId: String(pago.id),
    status: pago.status,
    monto: pago.transaction_amount,
    moneda: pago.currency_id,
  });
}

interface Envio {
  canal: string;
  disponible: boolean;
  enviar: () => Promise<void>;
}

/** Cada canal se reclama antes de enviar y se suelta si falla: reintentar no duplica lo ya enviado. */
async function ejecutarEnvios(store: Store, solicitudId: string, envios: Envio[]): Promise<boolean> {
  let todoBien = true;
  for (const envio of envios) {
    if (!envio.disponible) {
      console.warn(`Notificación omitida (${envio.canal}): canal sin configurar.`);
      continue;
    }
    if (!(await store.reclamarNotificacion(solicitudId, envio.canal))) continue;
    try {
      await envio.enviar();
    } catch (error) {
      console.error(`Falló la notificación ${envio.canal} de ${solicitudId}`, error);
      await store.soltarNotificacion(solicitudId, envio.canal);
      todoBien = false;
    }
  }
  return todoBien;
}

async function enviarNotificacionesDePago(store: Store, s: Solicitud): Promise<boolean> {
  const [cita, config] = await Promise.all([store.citaDeSolicitud(s.id), store.obtenerConfig()]);
  const numero = s.numero_atencion!;
  const fecha = cita && !s.cita_conflicto ? formatearFecha(cita.inicio) : "por coordinar";
  const hora = cita && !s.cita_conflicto ? formatearHora(cita.inicio) : "por coordinar";
  const enlacePanel = `${urlSitio()}/admin/solicitudes/${s.id}`;
  const primerNombre = s.nombre.split(" ")[0];
  const filas: [string, string][] = [
    ["Número de atención", numero],
    ["Fecha", fecha],
    ["Hora", hora],
    ["Modalidad", cita?.modalidad === "videollamada" ? "Videollamada" : "Presencial"],
  ];
  const plantillaCliente = process.env.WHATSAPP_TEMPLATE_CLIENTE || "solicitud_en_curso";
  const plantillaAbogado = process.env.WHATSAPP_TEMPLATE_ABOGADO || "aviso_nueva_solicitud";

  return ejecutarEnvios(store, s.id, [
    {
      canal: "whatsapp_cliente",
      // La plantilla afirma una fecha: si el horario se perdió, el aviso va por correo y lo coordina el abogado.
      disponible: whatsappConfigurado() && !s.cita_conflicto,
      enviar: () => enviarPlantillaWhatsApp(telefonoE164(s.telefono), plantillaCliente, [primerNombre, numero, fecha, hora]),
    },
    {
      canal: "whatsapp_abogado",
      disponible: whatsappConfigurado() && !!config.abogado.whatsapp,
      enviar: () =>
        enviarPlantillaWhatsApp(config.abogado.whatsapp, plantillaAbogado, [
          numero,
          s.nombre,
          s.cita_conflicto ? "por coordinar: el horario se perdió" : `${fecha} a las ${hora}`,
          enlacePanel,
        ]),
    },
    {
      canal: "correo_cliente",
      disponible: correoConfigurado(),
      enviar: () =>
        enviarCorreo(
          s.correo,
          `Tu solicitud ${numero} ya está en curso`,
          plantillaCorreo(
            `Hola ${primerNombre}, tu solicitud ya está en curso`,
            filas,
            s.cita_conflicto
              ? "Recibimos tu pago, pero el horario que elegiste ya no estaba disponible. Un abogado te contactará para coordinar una nueva hora."
              : "Ya vas a ser atendido: un abogado revisará tu caso y te contactará.",
          ),
        ),
    },
    {
      canal: "correo_abogado",
      disponible: correoConfigurado() && !!config.abogado.correo,
      enviar: () =>
        enviarCorreo(
          config.abogado.correo,
          `Nueva solicitud ${numero}: ${s.nombre}`,
          plantillaCorreo(
            "Nueva solicitud pagada",
            [["Cliente", s.nombre], ["RUT", s.rut], ["Teléfono", s.telefono], ["Pagado", formatearCLP(s.monto_clp)], ...filas],
            s.cita_conflicto ? "Atención: hay que coordinar una nueva hora con esta persona." : "Revisa el caso en el panel antes de la cita.",
            { texto: "Abrir en el panel", url: enlacePanel },
          ),
        ),
    },
  ]);
}

async function enviarAvisoDeReintento(store: Store, s: Solicitud): Promise<boolean> {
  return ejecutarEnvios(store, s.id, [
    {
      canal: "correo_reintento",
      disponible: correoConfigurado(),
      enviar: () =>
        enviarCorreo(
          s.correo,
          "Tu pago no se pudo completar",
          plantillaCorreo(
            "Tu pago no se pudo completar",
            [["Servicio", s.servicio], ["Monto", formatearCLP(s.monto_clp)]],
            "Guardamos tu solicitud. Puedes reintentar el pago desde este enlace; el horario se libera 30 minutos después de iniciado el pago, y si ya no está disponible podrás elegir otro.",
            { texto: "Reintentar el pago", url: `${urlSitio()}/solicitud/${s.token}` },
          ),
        ),
    },
  ]);
}
