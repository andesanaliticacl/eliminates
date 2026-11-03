import { NextResponse } from "next/server";
import { procesarPagoMP } from "@/lib/pagos";
import { error, permitido, ruta } from "@/lib/servidor";
import { esDemo, obtenerStore } from "@/lib/store";

export const GET = ruta(async (req: Request) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const store = await obtenerStore();
  if (!(await permitido(store, req, "estado", 120, 600))) return error("Demasiadas consultas.", 429);

  let solicitud = await store.solicitudPorToken(token);
  if (!solicitud) return error("Solicitud no encontrada.", 404);

  // Si el webhook se atrasa, se consulta el pago a Mercado Pago desde el servidor.
  // Lo que venga en la URL solo indica qué pago preguntar: nunca se da por pagado.
  const paymentId = url.searchParams.get("payment_id");
  if (paymentId && /^\d+$/.test(paymentId) && !solicitud.numero_atencion && !esDemo()) {
    try {
      await procesarPagoMP(paymentId);
      solicitud = (await store.solicitudPorToken(token))!;
    } catch (e) {
      console.error("No se pudo consultar el pago", e);
    }
  }

  const cita = await store.citaDeSolicitud(solicitud.id);
  return NextResponse.json(
    {
      estado: solicitud.estado,
      numero_atencion: solicitud.numero_atencion,
      pago_estado: solicitud.pago_estado,
      nombre: solicitud.nombre.split(" ")[0],
      servicio: solicitud.servicio,
      monto_clp: solicitud.monto_clp,
      conflicto: solicitud.cita_conflicto,
      cita: cita ? { inicio: cita.inicio, modalidad: cita.modalidad, estado: cita.estado, expira_en: cita.expira_en } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
