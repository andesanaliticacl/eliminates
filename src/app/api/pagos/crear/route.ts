import { NextResponse } from "next/server";
import { MINUTOS_RETENCION } from "@/lib/config";
import { esBloqueValido } from "@/lib/fechas";
import { crearPreferencia } from "@/lib/mercadopago";
import { error, leerJson, parametrosAgenda, permitido, ruta } from "@/lib/servidor";
import { esDemo, obtenerStore } from "@/lib/store";

// Sirve para el primer pago y para los reintentos desde /solicitud/[token].
export const POST = ruta(async (req: Request) => {
  const store = await obtenerStore();
  if (!(await permitido(store, req, "pago", 20, 3600))) return error("Demasiados intentos. Espera unos minutos.", 429);

  const { token, inicio } = await leerJson(req);
  const solicitud = typeof token === "string" ? await store.solicitudPorToken(token) : null;
  if (!solicitud) return error("Solicitud no encontrada.", 404);
  if (solicitud.numero_atencion) return NextResponse.json({ yaPagada: true });
  if (solicitud.estado === "cerrada") return error("La solicitud está cerrada.", 409);

  let nuevoInicio: string | null = null;
  if (typeof inicio === "string") {
    const fecha = new Date(inicio);
    if (!esBloqueValido(fecha, await parametrosAgenda(store))) return error("Ese horario no está disponible.", 409, { codigo: "HORARIO_TOMADO" });
    nuevoInicio = fecha.toISOString();
  }

  const renovada = await store.renovarCita(solicitud.id, nuevoInicio, MINUTOS_RETENCION);
  if (!renovada) return error("Tu horario ya no está disponible. Elige otro.", 409, { codigo: "HORARIO_TOMADO" });

  if (esDemo()) {
    await store.marcarPendientePago(solicitud.id, null);
    return NextResponse.json({ url: `/demo/pago?token=${solicitud.token}` });
  }

  const preferencia = await crearPreferencia(solicitud, new Date(Date.now() + MINUTOS_RETENCION * 60_000));
  await store.marcarPendientePago(solicitud.id, preferencia.id);
  return NextResponse.json({ url: preferencia.init_point });
});
